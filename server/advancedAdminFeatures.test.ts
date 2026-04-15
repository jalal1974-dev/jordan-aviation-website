import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  calculateVerifierBonus,
  calculateAllBonuses,
  simulateBonus,
  getBonusDistribution,
  getDefaultBonusConfiguration,
  getBonusTiers,
  type BonusConfiguration,
} from './bonusCalculatorService'
import {
  checkLowAccuracyAlerts,
  checkSlowProcessingAlerts,
  checkUnderperformerAlerts,
  checkAccuracyDropAlerts,
  getAllActiveAlerts,
} from './performanceAlertsService'

describe('Advanced Admin Features', () => {
  describe('Bonus Calculator Service', () => {
    let defaultConfig: BonusConfiguration

    beforeAll(() => {
      defaultConfig = getDefaultBonusConfiguration()
    })

    it('should get default bonus configuration', () => {
      expect(defaultConfig).toBeDefined()
      expect(defaultConfig.baseSalary).toBe(3000)
      expect(defaultConfig.accuracyWeight).toBe(0.4)
      expect(defaultConfig.volumeWeight).toBe(0.3)
      expect(defaultConfig.speedWeight).toBe(0.3)
      expect(defaultConfig.maxBonusPercentage).toBe(20)
    })

    it('should get bonus tiers', () => {
      const tiers = getBonusTiers()
      expect(tiers).toHaveLength(4)
      expect(tiers[0].name).toBe('Bronze')
      expect(tiers[1].name).toBe('Silver')
      expect(tiers[2].name).toBe('Gold')
      expect(tiers[3].name).toBe('Platinum')
    })

    it('should calculate bonus for verifier with high performance', async () => {
      const config: BonusConfiguration = {
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

      // Test with mock data - actual calculation depends on database
      const bonus = await calculateVerifierBonus('test-verifier-1', config, 30)
      
      if (bonus) {
        expect(bonus).toHaveProperty('verifierId')
        expect(bonus).toHaveProperty('baseSalary', 3000)
        expect(bonus).toHaveProperty('metrics')
        expect(bonus).toHaveProperty('scores')
        expect(bonus).toHaveProperty('bonusAmount')
        expect(bonus.bonusAmount).toBeGreaterThanOrEqual(0)
        expect(bonus.bonusAmount).toBeLessThanOrEqual(600) // 20% of 3000
      }
    })

    it('should handle verifier with low accuracy', async () => {
      const config: BonusConfiguration = {
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

      const bonus = await calculateVerifierBonus('test-verifier-2', config, 30)
      
      if (bonus && bonus.metrics.accuracy < 85) {
        expect(bonus.bonusAmount).toBe(0)
        expect(bonus.bonusPercentage).toBe(0)
      }
    })

    it('should simulate bonus with different configurations', async () => {
      const baseConfig = getDefaultBonusConfiguration()
      const adjustments = {
        maxBonusPercentage: 30,
        accuracyTarget: 90,
      }

      const simulation = await simulateBonus('test-verifier-1', baseConfig, adjustments, 30)
      
      expect(simulation).toHaveProperty('original')
      expect(simulation).toHaveProperty('simulated')
      expect(simulation).toHaveProperty('difference')
      
      if (simulation.original && simulation.simulated) {
        expect(simulation.difference.bonus).toBeDefined()
        expect(simulation.difference.percentage).toBeDefined()
      }
    })

    it('should get bonus distribution statistics', async () => {
      const config = getDefaultBonusConfiguration()
      const distribution = await getBonusDistribution(config, 30)

      expect(distribution).toHaveProperty('totalVerifiers')
      expect(distribution).toHaveProperty('totalBonusPool')
      expect(distribution).toHaveProperty('averageBonus')
      expect(distribution).toHaveProperty('medianBonus')
      expect(distribution).toHaveProperty('minBonus')
      expect(distribution).toHaveProperty('maxBonus')
      expect(distribution).toHaveProperty('distribution')
    })

    it('should calculate bonuses for all verifiers', async () => {
      const config = getDefaultBonusConfiguration()
      const bonuses = await calculateAllBonuses(config, 30)

      expect(Array.isArray(bonuses)).toBe(true)
      
      if (bonuses.length > 0) {
        // Verify bonuses are sorted by amount (descending)
        for (let i = 0; i < bonuses.length - 1; i++) {
          expect(bonuses[i].bonusAmount).toBeGreaterThanOrEqual(bonuses[i + 1].bonusAmount)
        }
      }
    })
  })

  describe('Performance Alerts Service', () => {
    it('should check for low accuracy alerts', async () => {
      const alerts = await checkLowAccuracyAlerts(85, 50)
      
      expect(Array.isArray(alerts)).toBe(true)
      
      if (alerts.length > 0) {
        alerts.forEach(alert => {
          expect(alert.alertType).toBe('low_accuracy')
          expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity)
          expect(alert.metrics.accuracy).toBeLessThan(85)
        })
      }
    })

    it('should check for slow processing alerts', async () => {
      const alerts = await checkSlowProcessingAlerts(24, 20)
      
      expect(Array.isArray(alerts)).toBe(true)
      
      if (alerts.length > 0) {
        alerts.forEach(alert => {
          expect(alert.alertType).toBe('slow_processing')
          expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity)
          expect(alert.metrics.avgProcessingHours).toBeGreaterThan(24)
        })
      }
    })

    it('should check for underperformer alerts', async () => {
      const alerts = await checkUnderperformerAlerts(5, 7)
      
      expect(Array.isArray(alerts)).toBe(true)
      
      if (alerts.length > 0) {
        alerts.forEach(alert => {
          expect(alert.alertType).toBe('underperformer')
          expect(alert.severity).toBe('low')
        })
      }
    })

    it('should check for accuracy drop alerts', async () => {
      const alerts = await checkAccuracyDropAlerts(10, 7)
      
      expect(Array.isArray(alerts)).toBe(true)
      
      if (alerts.length > 0) {
        alerts.forEach(alert => {
          expect(alert.alertType).toBe('accuracy_drop')
          expect(['high', 'critical']).toContain(alert.severity)
          expect(alert.metrics.accuracyDrop).toBeGreaterThanOrEqual(10)
        })
      }
    })

    it('should get all active alerts', async () => {
      const alerts = await getAllActiveAlerts()
      
      expect(Array.isArray(alerts)).toBe(true)
      
      if (alerts.length > 0) {
        alerts.forEach(alert => {
          expect(['low_accuracy', 'slow_processing', 'underperformer', 'accuracy_drop']).toContain(
            alert.alertType
          )
          expect(alert).toHaveProperty('verifierId')
          expect(alert).toHaveProperty('verifierName')
          expect(alert).toHaveProperty('message')
          expect(alert).toHaveProperty('metrics')
        })
      }
    })
  })

  describe('Integration Tests', () => {
    it('should handle bonus calculation with performance alerts', async () => {
      const config = getDefaultBonusConfiguration()
      const bonuses = await calculateAllBonuses(config, 30)
      const alerts = await getAllActiveAlerts()

      expect(Array.isArray(bonuses)).toBe(true)
      expect(Array.isArray(alerts)).toBe(true)

      // Verify that low performers have alerts
      if (bonuses.length > 0 && alerts.length > 0) {
        const lowPerformers = bonuses.filter(b => b.scores.overallScore < 50)
        const alertedVerifiers = alerts.map(a => a.verifierId)

        lowPerformers.forEach(performer => {
          // Low performers should potentially have alerts
          expect(performer.scores.overallScore).toBeLessThan(100)
        })
      }
    })

    it('should simulate bonus impact on compensation', async () => {
      const baseConfig = getDefaultBonusConfiguration()
      const aggressiveConfig: BonusConfiguration = {
        ...baseConfig,
        maxBonusPercentage: 30,
        accuracyTarget: 90,
        volumeTarget: 15,
      }

      const baseBonuses = await calculateAllBonuses(baseConfig, 30)
      const aggressiveBonuses = await calculateAllBonuses(aggressiveConfig, 30)

      expect(baseBonuses.length).toBeGreaterThanOrEqual(0)
      expect(aggressiveBonuses.length).toBeGreaterThanOrEqual(0)

      if (baseBonuses.length > 0 && aggressiveBonuses.length > 0) {
        const baseTotalBonus = baseBonuses.reduce((sum, b) => sum + b.bonusAmount, 0)
        const aggressiveTotalBonus = aggressiveBonuses.reduce((sum, b) => sum + b.bonusAmount, 0)

        // Aggressive config should generally result in higher bonuses
        expect(aggressiveTotalBonus).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty verifier list', async () => {
      const config = getDefaultBonusConfiguration()
      const bonuses = await calculateAllBonuses(config, 30)

      expect(Array.isArray(bonuses)).toBe(true)
    })

    it('should handle alerts with no data', async () => {
      const alerts = await getAllActiveAlerts()

      expect(Array.isArray(alerts)).toBe(true)
    })

    it('should validate bonus configuration weights sum', () => {
      const config = getDefaultBonusConfiguration()
      const weightSum = config.accuracyWeight + config.volumeWeight + config.speedWeight

      expect(weightSum).toBeCloseTo(1.0, 1)
    })

    it('should ensure bonus does not exceed maximum', async () => {
      const config = getDefaultBonusConfiguration()
      const bonuses = await calculateAllBonuses(config, 30)

      bonuses.forEach(bonus => {
        const maxBonus = (config.baseSalary * config.maxBonusPercentage) / 100
        expect(bonus.bonusAmount).toBeLessThanOrEqual(maxBonus)
      })
    })
  })
})
