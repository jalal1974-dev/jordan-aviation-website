import { getDb } from './db'
import { eq, sql, and, lt, gte } from 'drizzle-orm'
import { userDocuments, users } from '../drizzle/schema'

export interface PerformanceAlert {
  id: string
  verifierId: string
  verifierName: string
  alertType: 'low_accuracy' | 'slow_processing' | 'underperformer' | 'accuracy_drop'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  metrics: Record<string, any>
  createdAt: Date
  resolved: boolean
}

// Check for low accuracy verifiers
export async function checkLowAccuracyAlerts(
  accuracyThreshold: number = 85,
  minDocuments: number = 50
): Promise<PerformanceAlert[]> {
  const db = await getDb()
  if (!db) return []

  const alerts: PerformanceAlert[] = []

  const lowAccuracyVerifiers = await db
    .select({
      verifierId: userDocuments.verifiedBy,
      verifierName: users.name,
      verifierEmail: users.email,
      totalDocs: sql<number>`COUNT(*)`,
      verifiedCount: sql<number>`SUM(CASE WHEN verificationStatus = 'verified' THEN 1 ELSE 0 END)`,
      accuracy: sql<number>`(SUM(CASE WHEN verificationStatus = 'verified' THEN 1 ELSE 0 END) / COUNT(*)) * 100`,
    })
    .from(userDocuments)
    .leftJoin(users, eq(users.id, userDocuments.verifiedBy))
    .where(gte(sql`COUNT(*)`, minDocuments))
    .groupBy(userDocuments.verifiedBy)
    .having(sql`accuracy < ${accuracyThreshold}`)

  for (const verifier of lowAccuracyVerifiers) {
    if (verifier.verifierId && verifier.verifierName && verifier.accuracy) {
      alerts.push({
        id: `alert_${verifier.verifierId}_low_accuracy_${Date.now()}`,
        verifierId: verifier.verifierId.toString(),
        verifierName: verifier.verifierName,
        alertType: 'low_accuracy',
        severity: verifier.accuracy < 75 ? 'critical' : 'high',
        message: `Verifier ${verifier.verifierName} has low accuracy of ${verifier.accuracy.toFixed(1)}% (threshold: ${accuracyThreshold}%)`,
        metrics: {
          currentAccuracy: verifier.accuracy,
          threshold: accuracyThreshold,
          totalDocuments: verifier.totalDocs,
          verifiedCount: verifier.verifiedCount,
        },
        createdAt: new Date(),
        resolved: false,
      })
    }
  }

  return alerts
}

// Check for slow processing times
export async function checkSlowProcessingAlerts(
  maxHoursThreshold: number = 24,
  minDocuments: number = 20
): Promise<PerformanceAlert[]> {
  const db = await getDb()
  if (!db) return []

  const alerts: PerformanceAlert[] = []

  const slowVerifiers = await db
    .select({
      verifierId: userDocuments.verifiedBy,
      verifierName: users.name,
      verifierEmail: users.email,
      totalDocs: sql<number>`COUNT(*)`,
      avgProcessingHours: sql<number>`AVG(TIMESTAMPDIFF(HOUR, createdAt, updatedAt))`,
    })
    .from(userDocuments)
    .leftJoin(users, eq(users.id, userDocuments.verifiedBy))
    .where(gte(sql`COUNT(*)`, minDocuments))
    .groupBy(userDocuments.verifiedBy)
    .having(sql`avgProcessingHours > ${maxHoursThreshold}`)

  for (const verifier of slowVerifiers) {
    if (verifier.verifierId && verifier.verifierName && verifier.avgProcessingHours) {
      alerts.push({
        id: `alert_${verifier.verifierId}_slow_processing_${Date.now()}`,
        verifierId: verifier.verifierId.toString(),
        verifierName: verifier.verifierName,
        alertType: 'slow_processing',
        severity: verifier.avgProcessingHours > 48 ? 'critical' : 'medium',
        message: `Verifier ${verifier.verifierName} has slow average processing time of ${verifier.avgProcessingHours.toFixed(1)} hours (threshold: ${maxHoursThreshold} hours)`,
        metrics: {
          avgProcessingHours: verifier.avgProcessingHours,
          threshold: maxHoursThreshold,
          totalDocuments: verifier.totalDocs,
        },
        createdAt: new Date(),
        resolved: false,
      })
    }
  }

  return alerts
}

// Check for underperformers (low volume)
export async function checkUnderperformerAlerts(
  minDocumentsPerDay: number = 5,
  daysActive: number = 7
): Promise<PerformanceAlert[]> {
  const db = await getDb()
  if (!db) return []

  const alerts: PerformanceAlert[] = []
  const startDate = new Date(Date.now() - daysActive * 24 * 60 * 60 * 1000)

  const underperformers = await db
    .select({
      verifierId: userDocuments.verifiedBy,
      verifierName: users.name,
      verifierEmail: users.email,
      docsPerDay: sql<number>`COUNT(*) / ${daysActive}`,
      totalDocs: sql<number>`COUNT(*)`,
    })
    .from(userDocuments)
    .leftJoin(users, eq(users.id, userDocuments.verifiedBy))
    .where(gte(userDocuments.updatedAt, startDate))
    .groupBy(userDocuments.verifiedBy)
    .having(sql`docsPerDay < ${minDocumentsPerDay}`)

  for (const verifier of underperformers) {
    if (verifier.verifierId && verifier.verifierName && verifier.docsPerDay !== undefined) {
      alerts.push({
        id: `alert_${verifier.verifierId}_underperformer_${Date.now()}`,
        verifierId: verifier.verifierId.toString(),
        verifierName: verifier.verifierName,
        alertType: 'underperformer',
        severity: 'low',
        message: `Verifier ${verifier.verifierName} is underperforming with ${verifier.docsPerDay.toFixed(1)} documents/day (threshold: ${minDocumentsPerDay} documents/day)`,
        metrics: {
          docsPerDay: verifier.docsPerDay,
          threshold: minDocumentsPerDay,
          totalDocuments: verifier.totalDocs,
          period: `${daysActive} days`,
        },
        createdAt: new Date(),
        resolved: false,
      })
    }
  }

  return alerts
}

// Check for accuracy drops
export async function checkAccuracyDropAlerts(
  dropThreshold: number = 10,
  comparisonDays: number = 7
): Promise<PerformanceAlert[]> {
  const db = await getDb()
  if (!db) return []

  const alerts: PerformanceAlert[] = []
  const startDate = new Date(Date.now() - comparisonDays * 2 * 24 * 60 * 60 * 1000)
  const midDate = new Date(Date.now() - comparisonDays * 24 * 60 * 60 * 1000)

  const accuracyDrops = await db
    .select({
      verifierId: userDocuments.verifiedBy,
      verifierName: users.name,
      verifierEmail: users.email,
      period: sql<string>`CASE WHEN updatedAt >= ${midDate} THEN 'recent' ELSE 'previous' END`,
      accuracy: sql<number>`(SUM(CASE WHEN verificationStatus = 'verified' THEN 1 ELSE 0 END) / COUNT(*)) * 100`,
    })
    .from(userDocuments)
    .leftJoin(users, eq(users.id, userDocuments.verifiedBy))
    .where(gte(userDocuments.updatedAt, startDate))
    .groupBy(userDocuments.verifiedBy, sql`period`)

  // Group by verifier and compare periods
  const verifierAccuracies: Record<string, { recent?: number; previous?: number; name?: string; email?: string }> = {}

  for (const row of accuracyDrops) {
    const verifierId = row.verifierId?.toString() || ''
    if (!verifierAccuracies[verifierId]) {
      verifierAccuracies[verifierId] = { name: row.verifierName || undefined, email: row.verifierEmail || undefined }
    }
    if (row.period === 'recent') {
      verifierAccuracies[verifierId].recent = row.accuracy
    } else {
      verifierAccuracies[verifierId].previous = row.accuracy
    }
  }

  for (const [verifierId, data] of Object.entries(verifierAccuracies)) {
    if (data.recent && data.previous && data.previous - data.recent >= dropThreshold) {
      alerts.push({
        id: `alert_${verifierId}_accuracy_drop_${Date.now()}`,
        verifierId,
        verifierName: data.name || 'Unknown' as string,
        alertType: 'accuracy_drop',
        severity: data.previous - data.recent > 20 ? 'critical' : 'high',
        message: `Verifier ${data.name} accuracy dropped from ${data.previous.toFixed(1)}% to ${data.recent.toFixed(1)}% (drop: ${(data.previous - data.recent).toFixed(1)}%)`,
        metrics: {
          previousAccuracy: data.previous,
          currentAccuracy: data.recent,
          accuracyDrop: data.previous - data.recent,
          threshold: dropThreshold,
          period: `${comparisonDays} days`,
        },
        createdAt: new Date(),
        resolved: false,
      })
    }
  }

  return alerts
}

// Send alert notifications to managers
export async function sendAlertNotifications(alerts: PerformanceAlert[], managerEmail: string): Promise<void> {
  if (alerts.length === 0) return

  const alertsByType = alerts.reduce(
    (acc, alert) => {
      if (!acc[alert.alertType]) acc[alert.alertType] = []
      acc[alert.alertType].push(alert)
      return acc
    },
    {} as Record<string, PerformanceAlert[]>
  )

  const alertSummary = Object.entries(alertsByType)
    .map(([type, typeAlerts]) => `${type}: ${typeAlerts.length} alert(s)`)
    .join('\n')

  const criticalAlerts = alerts.filter(a => a.severity === 'critical')
  const highAlerts = alerts.filter(a => a.severity === 'high')

  const emailContent = `
    <h2>Performance Alerts Summary</h2>
    <p>Total Alerts: ${alerts.length}</p>
    
    <h3>Alert Summary by Type:</h3>
    <pre>${alertSummary}</pre>
    
    ${
      criticalAlerts.length > 0
        ? `
      <h3>CRITICAL ALERTS (${criticalAlerts.length}):</h3>
      <ul>
        ${criticalAlerts.map(a => `<li><strong>${a.verifierName}</strong> - ${a.message}</li>`).join('')}
      </ul>
    `
        : ''
    }
    
    ${
      highAlerts.length > 0
        ? `
      <h3>High Priority Alerts (${highAlerts.length}):</h3>
      <ul>
        ${highAlerts.map(a => `<li><strong>${a.verifierName}</strong> - ${a.message}</li>`).join('')}
      </ul>
    `
        : ''
    }
    
    <p>Please review the admin dashboard for detailed information and take appropriate action.</p>
  `

  // Send email notification (using nodemailer or email service)
  // This is a placeholder - integrate with your email service
  console.log(`[ALERT EMAIL] To: ${managerEmail}\nSubject: Performance Alerts - Action Required\nContent: ${emailContent}`)
}

// Get all active alerts
export async function getAllActiveAlerts(): Promise<PerformanceAlert[]> {
  const alerts = await Promise.all([
    checkLowAccuracyAlerts(),
    checkSlowProcessingAlerts(),
    checkUnderperformerAlerts(),
    checkAccuracyDropAlerts(),
  ])

  return alerts.flat()
}
