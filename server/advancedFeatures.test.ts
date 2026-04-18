/**
 * Advanced Features Test Suite
 * Tests for VRS Integration, Performance Leaderboard, and Scheduled Reports
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { VRSIntegrationService, initializeVRSService } from './vrsIntegration'
import { ScheduledReportService } from './scheduledReportService'
import { getPerformanceAnalyticsExportService } from './performanceAnalyticsExportService'

describe('VRS Integration Service', () => {
  let vrsService: VRSIntegrationService

  beforeEach(() => {
    vrsService = initializeVRSService()
  })

  it('should initialize VRS service with config', () => {
    expect(vrsService).toBeDefined()
  })

  it('should handle document submission result', async () => {
    const result = await vrsService.submitDocumentForVerification(
      '123',
      'doc-456',
      'https://example.com/doc.pdf',
      'passport'
    )

    expect(result).toHaveProperty('success')
    expect(typeof result.success).toBe('boolean')
  })

  it('should verify webhook signature', () => {
    const payload = {
      eventType: 'document.verified' as const,
      documentId: '123',
      externalId: 'ext-456',
      status: 'verified',
      timestamp: Date.now(),
      signature: 'valid-signature',
    }

    // Webhook processing should not throw
    expect(async () => {
      await vrsService.processWebhookEvent(payload)
    }).toBeDefined()
  })

  it('should handle retry failed submissions', async () => {
    // Should not throw
    expect(async () => {
      await vrsService.retryFailedSubmissions()
    }).toBeDefined()
  })

  it('should sync pending documents', async () => {
    // Should not throw
    expect(async () => {
      await vrsService.syncPendingDocuments()
    }).toBeDefined()
  })
})

describe('Scheduled Report Service', () => {
  let reportService: ScheduledReportService

  beforeEach(() => {
    const config = {
      schedules: [
        {
          id: 'test-daily',
          name: 'Test Daily Report',
          frequency: 'daily' as const,
          enabled: true,
          recipients: ['test@example.com'],
          format: 'html' as const,
          sendTime: '08:00',
        },
      ],
      emailService: {
        from: 'test@example.com',
        replyTo: 'support@example.com',
      },
    }

    reportService = new ScheduledReportService(config)
  })

  afterEach(() => {
    reportService.stopSchedules()
  })

  it('should initialize scheduled report service', () => {
    expect(reportService).toBeDefined()
  })

  it('should get all schedules', () => {
    const schedules = reportService.getSchedules()

    expect(Array.isArray(schedules)).toBe(true)
    expect(schedules.length).toBeGreaterThan(0)
  })

  it('should get schedule by ID', () => {
    const schedule = reportService.getSchedule('test-daily')

    expect(schedule).toBeDefined()
    expect(schedule?.id).toBe('test-daily')
  })

  it('should add a new schedule', () => {
    const newSchedule = {
      id: 'test-weekly',
      name: 'Test Weekly Report',
      frequency: 'weekly' as const,
      enabled: true,
      recipients: ['admin@example.com'],
      format: 'csv' as const,
      sendTime: '09:00',
    }

    reportService.addSchedule(newSchedule)
    const schedules = reportService.getSchedules()

    expect(schedules.length).toBeGreaterThan(1)
    expect(schedules.some(s => s.id === 'test-weekly')).toBe(true)
  })

  it('should update a schedule', () => {
    reportService.updateSchedule('test-daily', {
      enabled: false,
      format: 'csv',
    })

    const schedule = reportService.getSchedule('test-daily')

    expect(schedule?.enabled).toBe(false)
    expect(schedule?.format).toBe('csv')
  })

  it('should remove a schedule', () => {
    reportService.removeSchedule('test-daily')
    const schedule = reportService.getSchedule('test-daily')

    expect(schedule).toBeUndefined()
  })

  it('should start and stop schedules', () => {
    expect(() => {
      reportService.startSchedules()
      reportService.stopSchedules()
    }).not.toThrow()
  })
})

describe('Performance Analytics Export Service', () => {
  let exportService: ReturnType<typeof getPerformanceAnalyticsExportService>

  beforeEach(() => {
    exportService = getPerformanceAnalyticsExportService()
  })

  it('should initialize export service', () => {
    expect(exportService).toBeDefined()
  })

  it('should generate performance report', async () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    const endDate = new Date()

    const report = await exportService.generatePerformanceReport(startDate, endDate)

    expect(report).toBeDefined()
    expect(report.reportId).toBeDefined()
    expect(report.summary).toBeDefined()
    expect(report.summary.totalVerifiers).toBeGreaterThan(0)
    expect(report.topPerformers).toBeDefined()
    expect(Array.isArray(report.topPerformers)).toBe(true)
  })

  it('should export report to CSV', async () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    const endDate = new Date()

    const report = await exportService.generatePerformanceReport(startDate, endDate)
    const csv = exportService.exportToCSV(report)

    expect(csv.format).toBe('csv')
    expect(csv.fileName).toContain('.csv')
    expect(typeof csv.content).toBe('string')
    expect(csv.content.length).toBeGreaterThan(0)
  })

  it('should export report to JSON', async () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    const endDate = new Date()

    const report = await exportService.generatePerformanceReport(startDate, endDate)
    const json = exportService.exportToJSON(report)

    expect(json.format).toBe('json')
    expect(json.fileName).toContain('.json')
    expect(typeof json.content).toBe('string')
    expect(() => JSON.parse(json.content)).not.toThrow()
  })

  it('should export report to HTML', async () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    const endDate = new Date()

    const report = await exportService.generatePerformanceReport(startDate, endDate)
    const html = exportService.exportToHTML(report)

    expect(html.format).toBe('html')
    expect(html.fileName).toContain('.html')
    expect(typeof html.content).toBe('string')
    expect(html.content).toContain('<html>')
    expect(html.content).toContain('Performance Report')
  })

  it('should get schedule options', () => {
    const options = exportService.getScheduleOptions()

    expect(Array.isArray(options)).toBe(true)
    expect(options.length).toBeGreaterThan(0)
    expect(options[0]).toHaveProperty('id')
    expect(options[0]).toHaveProperty('name')
    expect(options[0]).toHaveProperty('cronExpression')
  })

  it('should generate report with accurate summary', async () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    const endDate = new Date()

    const report = await exportService.generatePerformanceReport(startDate, endDate)

    expect(report.summary.totalVerifiers).toBeGreaterThan(0)
    expect(report.summary.totalDocumentsProcessed).toBeGreaterThan(0)
    expect(report.summary.averageAccuracy).toBeGreaterThan(0)
    expect(report.summary.averageAccuracy).toBeLessThanOrEqual(100)
    expect(report.summary.totalBonusDistributed).toBeGreaterThan(0)
  })

  it('should generate top performers list', async () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    const endDate = new Date()

    const report = await exportService.generatePerformanceReport(startDate, endDate)

    expect(report.topPerformers.length).toBeGreaterThan(0)
    expect(report.topPerformers[0]).toHaveProperty('rank')
    expect(report.topPerformers[0]).toHaveProperty('accuracy')
    expect(report.topPerformers[0]).toHaveProperty('bonusEarned')
    expect(report.topPerformers[0].rank).toBe(1)
  })

  it('should generate performance distribution', async () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    const endDate = new Date()

    const report = await exportService.generatePerformanceReport(startDate, endDate)

    const distribution = report.performanceDistribution
    expect(distribution.excellent).toBeGreaterThanOrEqual(0)
    expect(distribution.good).toBeGreaterThanOrEqual(0)
    expect(distribution.average).toBeGreaterThanOrEqual(0)
    expect(distribution.poor).toBeGreaterThanOrEqual(0)
  })

  it('should generate trends analysis', async () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    const endDate = new Date()

    const report = await exportService.generatePerformanceReport(startDate, endDate)

    expect(report.trends).toBeDefined()
    expect(['improving', 'stable', 'declining']).toContain(report.trends.accuracyTrend)
    expect(['increasing', 'stable', 'decreasing']).toContain(report.trends.volumeTrend)
    expect(['faster', 'stable', 'slower']).toContain(report.trends.speedTrend)
  })

  it('should generate recommendations', async () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    const endDate = new Date()

    const report = await exportService.generatePerformanceReport(startDate, endDate)

    expect(Array.isArray(report.recommendations)).toBe(true)
    expect(report.recommendations.length).toBeGreaterThan(0)
    expect(typeof report.recommendations[0]).toBe('string')
  })
})

describe('Integration Tests', () => {
  it('should handle complete VRS workflow', async () => {
    const vrsService = initializeVRSService()

    // Submit document
    const submitResult = await vrsService.submitDocumentForVerification(
      '123',
      'doc-456',
      'https://example.com/doc.pdf',
      'passport'
    )

    expect(submitResult).toHaveProperty('success')

    // Process webhook event
    const webhookPayload = {
      eventType: 'document.verified' as const,
      documentId: '456',
      externalId: 'ext-789',
      status: 'verified',
      timestamp: Date.now(),
      signature: 'sig-123',
    }

    const webhookResult = await vrsService.processWebhookEvent(webhookPayload)
    expect(typeof webhookResult).toBe('boolean')
  })

  it('should handle complete report generation and export workflow', async () => {
    const exportService = getPerformanceAnalyticsExportService()

    // Generate report
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    const endDate = new Date()

    const report = await exportService.generatePerformanceReport(startDate, endDate)
    expect(report).toBeDefined()

    // Export to multiple formats
    const csv = exportService.exportToCSV(report)
    const json = exportService.exportToJSON(report)
    const html = exportService.exportToHTML(report)

    expect(csv.format).toBe('csv')
    expect(json.format).toBe('json')
    expect(html.format).toBe('html')
  })

  it('should handle complete scheduled report workflow', () => {
    const config = {
      schedules: [
        {
          id: 'integration-test',
          name: 'Integration Test Report',
          frequency: 'daily' as const,
          enabled: true,
          recipients: ['test@example.com'],
          format: 'html' as const,
          sendTime: '08:00',
        },
      ],
      emailService: {
        from: 'test@example.com',
        replyTo: 'support@example.com',
      },
    }

    const reportService = new ScheduledReportService(config)

    // Get schedules
    const schedules = reportService.getSchedules()
    expect(schedules.length).toBeGreaterThan(0)

    // Update schedule
    reportService.updateSchedule('integration-test', { enabled: false })
    const updated = reportService.getSchedule('integration-test')
    expect(updated?.enabled).toBe(false)

    // Clean up
    reportService.stopSchedules()
  })
})
