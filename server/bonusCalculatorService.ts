import { getDb } from './db'
import { eq, sql, gte } from 'drizzle-orm'
import { userDocuments, users } from '../drizzle/schema'

export interface BonusConfiguration {
  baseSalary: number
  accuracyWeight: number // 0-1
  volumeWeight: number // 0-1
  speedWeight: number // 0-1
  accuracyTarget: number // percentage
  volumeTarget: number // documents per day
  speedTarget: number // hours average processing time
  maxBonusPercentage: number // max bonus as % of base salary
  minAccuracyForBonus: number // minimum accuracy to qualify
}

export interface BonusCalculation {
  verifierId: string
  verifierName: string
  baseSalary: number
  metrics: {
    accuracy: number
    volume: number
    speed: number
  }
  scores: {
    accuracyScore: number // 0-100
    volumeScore: number // 0-100
    speedScore: number // 0-100
    overallScore: number // 0-100
  }
  bonusAmount: number
  bonusPercentage: number
  totalCompensation: number
}

// Calculate verifier bonus based on performance
export async function calculateVerifierBonus(
  verifierId: string,
  config: BonusConfiguration,
  days: number = 30
): Promise<BonusCalculation | null> {
  const db = await getDb()
  if (!db) return null

  // Get verifier info
  const verifier = await db
    .select({
      id: users.id,
      name: users.name,
    })
    .from(users)
    .where(eq(users.id, verifierId as any))
    .limit(1)

  if (!verifier || verifier.length === 0) return null

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  // Get performance metrics
  const metrics = await db
    .select({
      totalDocs: sql<number>`COUNT(*)`,
      verifiedDocs: sql<number>`SUM(CASE WHEN verificationStatus = 'verified' THEN 1 ELSE 0 END)`,
      avgProcessingHours: sql<number>`AVG(TIMESTAMPDIFF(HOUR, createdAt, updatedAt))`,
    })
    .from(userDocuments)
    .where(eq(userDocuments.verifiedBy, verifierId as any))

  if (!metrics || metrics.length === 0) return null

  const metric = metrics[0]
  const accuracy = metric.totalDocs > 0 ? (metric.verifiedDocs / metric.totalDocs) * 100 : 0
  const volume = metric.totalDocs / days
  const speed = metric.avgProcessingHours || 0

  // Check minimum accuracy requirement
  if (accuracy < config.minAccuracyForBonus) {
    return {
      verifierId,
      verifierName: verifier[0].name || 'Unknown',
      baseSalary: config.baseSalary,
      metrics: { accuracy, volume, speed },
      scores: {
        accuracyScore: (accuracy / config.accuracyTarget) * 100,
        volumeScore: (volume / config.volumeTarget) * 100,
        speedScore: Math.max(0, 100 - (speed / config.speedTarget) * 100),
        overallScore: 0,
      },
      bonusAmount: 0,
      bonusPercentage: 0,
      totalCompensation: config.baseSalary,
    }
  }

  // Calculate individual scores (0-100)
  const accuracyScore = Math.min(100, (accuracy / config.accuracyTarget) * 100)
  const volumeScore = Math.min(100, (volume / config.volumeTarget) * 100)
  const speedScore = Math.max(0, Math.min(100, 100 - (speed / config.speedTarget) * 100))

  // Calculate weighted overall score
  const overallScore =
    accuracyScore * config.accuracyWeight +
    volumeScore * config.volumeWeight +
    speedScore * config.speedWeight

  // Calculate bonus
  const bonusPercentage = Math.min(config.maxBonusPercentage, (overallScore / 100) * config.maxBonusPercentage)
  const bonusAmount = (config.baseSalary * bonusPercentage) / 100
  const totalCompensation = config.baseSalary + bonusAmount

  return {
    verifierId,
    verifierName: verifier[0].name || 'Unknown',
    baseSalary: config.baseSalary,
    metrics: { accuracy, volume, speed },
    scores: {
      accuracyScore,
      volumeScore,
      speedScore,
      overallScore,
    },
    bonusAmount,
    bonusPercentage,
    totalCompensation,
  }
}

// Calculate bonuses for all verifiers
export async function calculateAllBonuses(
  config: BonusConfiguration,
  days: number = 30
): Promise<BonusCalculation[]> {
  const db = await getDb()
  if (!db) return []

  // Get all verifiers
  const verifiers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'admin'))

  const bonuses: BonusCalculation[] = []

  for (const verifier of verifiers) {
    const bonus = await calculateVerifierBonus(verifier.id.toString(), config, days)
    if (bonus) {
      bonuses.push(bonus)
    }
  }

  return bonuses.sort((a, b) => b.bonusAmount - a.bonusAmount)
}

// Simulate bonus with different configurations
export async function simulateBonus(
  verifierId: string,
  baseConfig: BonusConfiguration,
  adjustments: Partial<BonusConfiguration>,
  days: number = 30
): Promise<{
  original: BonusCalculation | null
  simulated: BonusCalculation | null
  difference: { bonus: number; percentage: number }
}> {
  const original = await calculateVerifierBonus(verifierId, baseConfig, days)
  const simulated = await calculateVerifierBonus(verifierId, { ...baseConfig, ...adjustments }, days)

  return {
    original,
    simulated,
    difference: {
      bonus: (simulated?.bonusAmount || 0) - (original?.bonusAmount || 0),
      percentage: ((simulated?.bonusPercentage || 0) - (original?.bonusPercentage || 0)),
    },
  }
}

// Get bonus distribution statistics
export async function getBonusDistribution(
  config: BonusConfiguration,
  days: number = 30
): Promise<{
  totalVerifiers: number
  totalBonusPool: number
  averageBonus: number
  medianBonus: number
  minBonus: number
  maxBonus: number
  distribution: Record<string, number> // score ranges
}> {
  const bonuses = await calculateAllBonuses(config, days)

  if (bonuses.length === 0) {
    return {
      totalVerifiers: 0,
      totalBonusPool: 0,
      averageBonus: 0,
      medianBonus: 0,
      minBonus: 0,
      maxBonus: 0,
      distribution: {},
    }
  }

  const bonusAmounts = bonuses.map(b => b.bonusAmount)
  const totalBonus = bonusAmounts.reduce((a, b) => a + b, 0)
  const avgBonus = totalBonus / bonuses.length
  const sortedBonuses = [...bonusAmounts].sort((a, b) => a - b)
  const medianBonus = sortedBonuses[Math.floor(sortedBonuses.length / 2)]

  // Distribution by score ranges
  const distribution: Record<string, number> = {
    '0-20': 0,
    '20-40': 0,
    '40-60': 0,
    '60-80': 0,
    '80-100': 0,
  }

  for (const bonus of bonuses) {
    const score = bonus.scores.overallScore
    if (score < 20) distribution['0-20']++
    else if (score < 40) distribution['20-40']++
    else if (score < 60) distribution['40-60']++
    else if (score < 80) distribution['60-80']++
    else distribution['80-100']++
  }

  return {
    totalVerifiers: bonuses.length,
    totalBonusPool: totalBonus,
    averageBonus: avgBonus,
    medianBonus,
    minBonus: Math.min(...bonusAmounts),
    maxBonus: Math.max(...bonusAmounts),
    distribution,
  }
}

// Get default bonus configuration
export function getDefaultBonusConfiguration(): BonusConfiguration {
  return {
    baseSalary: 3000,
    accuracyWeight: 0.4,
    volumeWeight: 0.3,
    speedWeight: 0.3,
    accuracyTarget: 95,
    volumeTarget: 10,
    speedTarget: 24,
    maxBonusPercentage: 20,
    minAccuracyForBonus: 85,
  }
}

// Get bonus tiers
export function getBonusTiers(): Array<{
  name: string
  minScore: number
  maxScore: number
  bonusMultiplier: number
}> {
  return [
    { name: 'Bronze', minScore: 0, maxScore: 40, bonusMultiplier: 0.5 },
    { name: 'Silver', minScore: 40, maxScore: 60, bonusMultiplier: 1.0 },
    { name: 'Gold', minScore: 60, maxScore: 80, bonusMultiplier: 1.5 },
    { name: 'Platinum', minScore: 80, maxScore: 100, bonusMultiplier: 2.0 },
  ]
}
