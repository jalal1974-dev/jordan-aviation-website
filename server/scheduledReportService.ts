/**
 * Scheduled Report Service
 * Generates and sends performance reports on a schedule
 * Integrates with email and notification systems
 */

import { getPerformanceAnalyticsExportService, PerformanceReport } from './performanceAnalyticsExportService'
import { notifyOwner } from './_core/notification'

export interface ReportSchedule {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  enabled: boolean
  recipients: string[]
  format: 'csv' | 'json' | 'html'
  sendTime: string // HH:mm format
  lastSent?: Date
  nextScheduled?: Date
}

export interface ScheduledReportConfig {
  schedules: ReportSchedule[]
  emailService: {
    from: string
    replyTo: string
  }
}

/**
 * Scheduled Report Service
 * Manages automatic report generation and delivery
 */
export class ScheduledReportService {
  private config: ScheduledReportConfig
  private activeSchedules: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: ScheduledReportConfig) {
    this.config = config
  }

  /**
   * Start all scheduled reports
   */
  startSchedules(): void {
    console.log('[Scheduled Reports] Starting report schedules...')

    for (const schedule of this.config.schedules) {
      if (schedule.enabled) {
        this.scheduleReport(schedule)
      }
    }
  }

  /**
   * Stop all scheduled reports
   */
  stopSchedules(): void {
    console.log('[Scheduled Reports] Stopping report schedules...')

    this.activeSchedules.forEach((timeout, id) => {
      clearTimeout(timeout)
      this.activeSchedules.delete(id)
    })
  }

  /**
   * Schedule a report for automatic generation and delivery
   */
  private scheduleReport(schedule: ReportSchedule): void {
    const nextRun = this.calculateNextRun(schedule)
    const delayMs = nextRun.getTime() - Date.now()

    console.log(`[Scheduled Reports] Scheduling ${schedule.name} in ${Math.round(delayMs / 1000)}s`)

    const timeout = setTimeout(async () => {
      try {
        await this.generateAndSendReport(schedule)
      } catch (error) {
        console.error(`[Scheduled Reports] Error generating ${schedule.name}:`, error)
      }

      // Reschedule for next occurrence
      if (schedule.enabled) {
        this.scheduleReport(schedule)
      }
    }, delayMs)

    this.activeSchedules.set(schedule.id, timeout)
  }

  /**
   * Calculate next run time based on schedule frequency
   */
  private calculateNextRun(schedule: ReportSchedule): Date {
    const now = new Date()
    const [hours, minutes] = schedule.sendTime.split(':').map(Number)
    let nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)

    // If the time has already passed today, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }

    // Adjust based on frequency
    switch (schedule.frequency) {
      case 'daily':
        // Already set to tomorrow if needed
        break

      case 'weekly':
        // Schedule for next Monday
        const daysUntilMonday = (1 - nextRun.getDay() + 7) % 7 || 7
        nextRun.setDate(nextRun.getDate() + daysUntilMonday)
        break

      case 'biweekly':
        // Schedule for 14 days from now
        nextRun.setDate(nextRun.getDate() + 14)
        break

      case 'monthly':
        // Schedule for the 1st of next month
        nextRun.setMonth(nextRun.getMonth() + 1)
        nextRun.setDate(1)
        break
    }

    return nextRun
  }

  /**
   * Generate and send report
   */
  private async generateAndSendReport(schedule: ReportSchedule): Promise<void> {
    console.log(`[Scheduled Reports] Generating ${schedule.name}...`)

    const exportService = getPerformanceAnalyticsExportService()
    const endDate = new Date()
    let startDate = new Date()

    // Calculate date range based on frequency
    switch (schedule.frequency) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1)
        break
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'biweekly':
        startDate.setDate(startDate.getDate() - 14)
        break
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1)
        break
    }

    // Generate report
    const report = await exportService.generatePerformanceReport(startDate, endDate)

    // Export to requested format
    let exportedReport
    switch (schedule.format) {
      case 'csv':
        exportedReport = exportService.exportToCSV(report)
        break
      case 'json':
        exportedReport = exportService.exportToJSON(report)
        break
      case 'html':
        exportedReport = exportService.exportToHTML(report)
        break
    }

    // Send email to recipients
    await this.sendReportEmail(schedule, report, exportedReport)

    // Update last sent time
    schedule.lastSent = new Date()
    schedule.nextScheduled = this.calculateNextRun(schedule)

    console.log(`[Scheduled Reports] ${schedule.name} sent successfully`)
  }

  /**
   * Send report via email
   */
  private async sendReportEmail(
    schedule: ReportSchedule,
    report: PerformanceReport,
    exportedReport: any
  ): Promise<void> {
    const emailContent = this.generateEmailContent(report)

    // Send to each recipient
    for (const recipient of schedule.recipients) {
      try {
        // In production, integrate with actual email service
        console.log(`[Scheduled Reports] Sending ${schedule.name} to ${recipient}`)

        // Notify owner through notification system
        await notifyOwner({
          title: `Performance Report: ${schedule.name}`,
          content: `Your ${schedule.name} performance report has been generated.\n\nSummary:\n- Total Verifiers: ${report.summary.totalVerifiers}\n- Documents Processed: ${report.summary.totalDocumentsProcessed}\n- Average Accuracy: ${report.summary.averageAccuracy.toFixed(2)}%\n- Total Bonus Distributed: $${report.summary.totalBonusDistributed.toLocaleString()}`,
        })
      } catch (error) {
        console.error(`[Scheduled Reports] Error sending email to ${recipient}:`, error)
      }
    }
  }

  /**
   * Generate email content from report
   */
  private generateEmailContent(report: PerformanceReport): string {
    return `
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .header { background-color: #4CAF50; color: white; padding: 20px; }
    .section { margin: 20px 0; padding: 15px; border-left: 4px solid #4CAF50; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-value { font-size: 24px; font-weight: bold; color: #4CAF50; }
    .metric-label { font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f0f0f0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Performance Report</h1>
    <p>Generated: ${report.generatedAt.toLocaleString()}</p>
    <p>Period: ${report.period.startDate.toDateString()} - ${report.period.endDate.toDateString()}</p>
  </div>

  <div class="section">
    <h2>Summary Metrics</h2>
    <div class="metric">
      <div class="metric-value">${report.summary.totalVerifiers}</div>
      <div class="metric-label">Total Verifiers</div>
    </div>
    <div class="metric">
      <div class="metric-value">${report.summary.totalDocumentsProcessed.toLocaleString()}</div>
      <div class="metric-label">Documents Processed</div>
    </div>
    <div class="metric">
      <div class="metric-value">${report.summary.averageAccuracy.toFixed(2)}%</div>
      <div class="metric-label">Average Accuracy</div>
    </div>
    <div class="metric">
      <div class="metric-value">$${report.summary.totalBonusDistributed.toLocaleString()}</div>
      <div class="metric-label">Total Bonus</div>
    </div>
  </div>

  <div class="section">
    <h2>Top Performers</h2>
    <table>
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Accuracy</th>
        <th>Documents</th>
        <th>Bonus</th>
      </tr>
      ${report.topPerformers
        .slice(0, 5)
        .map(
          p => `
      <tr>
        <td>${p.rank}</td>
        <td>${p.name}</td>
        <td>${p.accuracy.toFixed(2)}%</td>
        <td>${p.documentsProcessed}</td>
        <td>$${p.bonusEarned.toLocaleString()}</td>
      </tr>
      `
        )
        .join('')}
    </table>
  </div>

  <div class="section">
    <h2>Performance Distribution</h2>
    <ul>
      <li>Excellent (90-100%): ${report.performanceDistribution.excellent}</li>
      <li>Good (75-89%): ${report.performanceDistribution.good}</li>
      <li>Average (60-74%): ${report.performanceDistribution.average}</li>
      <li>Poor (<60%): ${report.performanceDistribution.poor}</li>
    </ul>
  </div>

  <div class="section">
    <h2>Trends</h2>
    <ul>
      <li>Accuracy: ${report.trends.accuracyTrend}</li>
      <li>Volume: ${report.trends.volumeTrend}</li>
      <li>Speed: ${report.trends.speedTrend}</li>
    </ul>
  </div>

  <div class="section">
    <h2>Recommendations</h2>
    <ol>
      ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ol>
  </div>
</body>
</html>
    `
  }

  /**
   * Add a new schedule
   */
  addSchedule(schedule: ReportSchedule): void {
    this.config.schedules.push(schedule)

    if (schedule.enabled) {
      this.scheduleReport(schedule)
    }
  }

  /**
   * Update an existing schedule
   */
  updateSchedule(scheduleId: string, updates: Partial<ReportSchedule>): void {
    const schedule = this.config.schedules.find(s => s.id === scheduleId)

    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`)
    }

    // Clear existing timeout if it exists
    if (this.activeSchedules.has(scheduleId)) {
      clearTimeout(this.activeSchedules.get(scheduleId)!)
      this.activeSchedules.delete(scheduleId)
    }

    // Apply updates
    Object.assign(schedule, updates)

    // Reschedule if enabled
    if (schedule.enabled) {
      this.scheduleReport(schedule)
    }
  }

  /**
   * Remove a schedule
   */
  removeSchedule(scheduleId: string): void {
    const index = this.config.schedules.findIndex(s => s.id === scheduleId)

    if (index !== -1) {
      const schedule = this.config.schedules[index]

      // Clear timeout
      if (this.activeSchedules.has(scheduleId)) {
        clearTimeout(this.activeSchedules.get(scheduleId)!)
        this.activeSchedules.delete(scheduleId)
      }

      // Remove from schedules
      this.config.schedules.splice(index, 1)
    }
  }

  /**
   * Get all schedules
   */
  getSchedules(): ReportSchedule[] {
    return this.config.schedules
  }

  /**
   * Get schedule by ID
   */
  getSchedule(scheduleId: string): ReportSchedule | undefined {
    return this.config.schedules.find(s => s.id === scheduleId)
  }
}

/**
 * Create singleton instance
 */
let reportService: ScheduledReportService | null = null

export function getScheduledReportService(): ScheduledReportService {
  if (!reportService) {
    const config: ScheduledReportConfig = {
      schedules: [
        {
          id: 'daily-report',
          name: 'Daily Performance Report',
          frequency: 'daily',
          enabled: true,
          recipients: [process.env.OWNER_NAME || 'admin@example.com'],
          format: 'html',
          sendTime: '08:00',
        },
        {
          id: 'weekly-report',
          name: 'Weekly Performance Report',
          frequency: 'weekly',
          enabled: true,
          recipients: [process.env.OWNER_NAME || 'admin@example.com'],
          format: 'html',
          sendTime: '09:00',
        },
        {
          id: 'monthly-report',
          name: 'Monthly Performance Report',
          frequency: 'monthly',
          enabled: true,
          recipients: [process.env.OWNER_NAME || 'admin@example.com'],
          format: 'html',
          sendTime: '09:00',
        },
      ],
      emailService: {
        from: 'reports@jordanaviation.com',
        replyTo: 'support@jordanaviation.com',
      },
    }

    reportService = new ScheduledReportService(config)
  }

  return reportService
}
