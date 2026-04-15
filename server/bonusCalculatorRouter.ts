import { z } from 'zod'
import { adminProcedure, router } from './_core/trpc'
import {
  calculateVerifierBonus,
  calculateAllBonuses,
  simulateBonus,
  getBonusDistribution,
  getDefaultBonusConfiguration,
  getBonusTiers,
  type BonusConfiguration,
} from './bonusCalculatorService'

const BonusConfigSchema = z.object({
  baseSalary: z.number().positive(),
  accuracyWeight: z.number().min(0).max(1),
  volumeWeight: z.number().min(0).max(1),
  speedWeight: z.number().min(0).max(1),
  accuracyTarget: z.number().positive(),
  volumeTarget: z.number().positive(),
  speedTarget: z.number().positive(),
  maxBonusPercentage: z.number().positive(),
  minAccuracyForBonus: z.number().min(0).max(100),
})

export const bonusCalculatorRouter = router({
  // Calculate bonus for single verifier
  calculateVerifierBonus: adminProcedure
    .input(
      z.object({
        verifierId: z.string(),
        config: BonusConfigSchema,
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const bonus = await calculateVerifierBonus(input.verifierId, input.config, input.days)

      if (!bonus) {
        return { success: false, data: null, message: 'Verifier not found' }
      }

      return { success: true, data: bonus }
    }),

  // Calculate bonuses for all verifiers
  calculateAllBonuses: adminProcedure
    .input(
      z.object({
        config: BonusConfigSchema,
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const bonuses = await calculateAllBonuses(input.config, input.days)

      return {
        success: true,
        data: bonuses,
        count: bonuses.length,
        totalBonusPool: bonuses.reduce((sum, b) => sum + b.bonusAmount, 0),
      }
    }),

  // Simulate bonus with different configurations
  simulateBonus: adminProcedure
    .input(
      z.object({
        verifierId: z.string(),
        baseConfig: BonusConfigSchema,
        adjustments: BonusConfigSchema.partial(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const simulation = await simulateBonus(
        input.verifierId,
        input.baseConfig,
        input.adjustments,
        input.days
      )

      return {
        success: true,
        data: simulation,
      }
    }),

  // Get bonus distribution statistics
  getBonusDistribution: adminProcedure
    .input(
      z.object({
        config: BonusConfigSchema,
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const distribution = await getBonusDistribution(input.config, input.days)

      return {
        success: true,
        data: distribution,
      }
    }),

  // Get default configuration
  getDefaultConfiguration: adminProcedure.query(async () => {
    const config = getDefaultBonusConfiguration()

    return {
      success: true,
      data: config,
    }
  }),

  // Get bonus tiers
  getBonusTiers: adminProcedure.query(async () => {
    const tiers = getBonusTiers()

    return {
      success: true,
      data: tiers,
    }
  }),

  // Compare two configurations
  compareConfigurations: adminProcedure
    .input(
      z.object({
        config1: BonusConfigSchema,
        config2: BonusConfigSchema,
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const bonuses1 = await calculateAllBonuses(input.config1, input.days)
      const bonuses2 = await calculateAllBonuses(input.config2, input.days)

      const totalBonus1 = bonuses1.reduce((sum, b) => sum + b.bonusAmount, 0)
      const totalBonus2 = bonuses2.reduce((sum, b) => sum + b.bonusAmount, 0)
      const avgBonus1 = bonuses1.length > 0 ? totalBonus1 / bonuses1.length : 0
      const avgBonus2 = bonuses2.length > 0 ? totalBonus2 / bonuses2.length : 0

      return {
        success: true,
        data: {
          config1: {
            totalBonusPool: totalBonus1,
            averageBonus: avgBonus1,
            verifierCount: bonuses1.length,
          },
          config2: {
            totalBonusPool: totalBonus2,
            averageBonus: avgBonus2,
            verifierCount: bonuses2.length,
          },
          difference: {
            totalBonusPool: totalBonus2 - totalBonus1,
            averageBonus: avgBonus2 - avgBonus1,
          },
        },
      }
    }),
})
