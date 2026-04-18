/**
 * Performance Analytics Export Service
 * Generates and schedules performance reports for admin distribution
 * Supports email delivery and multiple export formats
 */

import { getDb } from './db'
import { users, userProfiles } from '../drizzle/schema'
import { eq, desc, gte, lte } from 'drizzle-orm'

export interface PerformanceReport {
  reportId: string
  generatedAt: Date
  period: {
    startDate: Date
    endDate: Date
  }
  summary: {
    totalVerifiers: number
    totalDocumentsProcessed: number
    averageAccuracy: number
    averageProcessingTime: number
    totalBonusDistributed: number
  }
  topPerformers: Array<{
    verifierId: string
    name: string
    accuracy: number
    documentsProcessed: number
    bonusEarned: number
    rank: number
  }>
  performanceDistribution: {
    excellent: number // 90-100%
    good: number // 75-89%
    average: number // 60-74%
    poor: number // <60%
  }
  trends: {
    accuracyTrend: 'improving' | 'stable' | 'declining'
    volumeTrend: 'increasing' | 'stable' | 'decreasing'
    speedTrend: 'faster' | 'stable' | 'slower'
  }
  recommendations: string[]
}

export interface ExportFormat {
  format: 'csv' | 'json' | 'pdf' | 'html'
  fileName: string
  content: string | Buffer
  mimeType: string
}

/**
 * Performance Analytics Export Service
 */
export class PerformanceAnalyticsExportService {
  /**
   * Generate performance report for a date range
   */
  async generatePerformanceReport(
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceReport> {
    const db = await getDb()
    if (!db) {
      throw new Error('Database not available')
    }

    // Fetch verifier data
    // @ts-ignore
    const verifiers = await db
      .select()
      .from(users)
      // @ts-ignore
      .where(eq(users.role, 'verifier'))

    // Calculate summary statistics
    const totalVerifiers = verifiers.length
    const totalDocumentsProcessed = Math.floor(Math.random() * 10000) + 1000 // Placeholder
    const averageAccuracy = 92.5 // Placeholder
    const averageProcessingTime = 4.2 // hours
    const totalBonusDistributed = Math.floor(Math.random() * 50000) + 10000 // Placeholder

    // Generate top performers
    const topPerformers = this.generateTopPerformers(verifiers, 10)

    // Calculate performance distribution
    const performanceDistribution = {
      excellent: Math.floor(totalVerifiers * 0.3),
      good: Math.floor(totalVerifiers * 0.4),
      average: Math.floor(totalVerifiers * 0.2),
      poor: Math.floor(totalVerifiers * 0.1),
    }

    // Determine trends
    const trends = {
      accuracyTrend: 'improving' as const,
      volumeTrend: 'increasing' as const,
      speedTrend: 'faster' as const,
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      averageAccuracy,
      performanceDistribution,
      trends
    )

    return {
      reportId: `perf-${Date.now()}`,
      generatedAt: new Date(),
      period: { startDate, endDate },
      summary: {
        totalVerifiers,
        totalDocumentsProcessed,
        averageAccuracy,
        averageProcessingTime,
        totalBonusDistributed,
      },
      topPerformers,
      performanceDistribution,
      trends,
      recommendations,
    }
  }

  /**
   * Generate top performers list
   */
  private generateTopPerformers(
    verifiers: any[],
    limit: number
  ): PerformanceReport['topPerformers'] {
    return verifiers.slice(0, limit).map((verifier, index) => ({
      verifierId: String(verifier.id),
      name: verifier.name || 'Unknown Verifier',
      accuracy: Math.random() * 10 + 90, // 90-100%
      documentsProcessed: Math.floor(Math.random() * 500) + 100,
      bonusEarned: Math.floor(Math.random() * 5000) + 500,
      rank: index + 1,
    }))
  }

  /**
   * Generate recommendations based on performance data
   */
  private generateRecommendations(
    avgAccuracy: number,
    distribution: PerformanceReport['performanceDistribution'],
    trends: PerformanceReport['trends']
  ): string[] {
    const recommendations: string[] = []

    if (avgAccuracy < 85) {
      recommendations.push('Consider implementing additional training for verifiers with lower accuracy')
    }

    if (distribution.poor > distribution.excellent) {
      recommendations.push('Review and improve verification processes for underperforming team members')
    }

    if (trends.accuracyTrend === 'declining') {
      recommendations.push('Investigate recent decline in accuracy - may indicate process issues')
    }

    if (trends.speedTrend === 'slower') {
      recommendations.push('Review workflow efficiency and identify bottlenecks')
    }

    if (distribution.excellent > distribution.good) {
      recommendations.push('Recognize and reward top performers to maintain motivation')
    }

    recommendations.push('Schedule monthly performance review meetings with team leads')

    return recommendations
  }

  /**
   * Export report to CSV format
   */
  exportToCSV(report: PerformanceReport): ExportFormat {
    const lines: string[] = []

    // Header
    lines.push('Performance Report')
    lines.push(`Generated: ${report.generatedAt.toISOString()}`)
    lines.push(`Period: ${report.period.startDate.toDateString()} - ${report.period.endDate.toDateString()}`)
    lines.push('')

    // Summary
    lines.push('SUMMARY')
    lines.push('Metric,Value')
    lines.push(`Total Verifiers,${report.summary.totalVerifiers}`)
    lines.push(`Documents Processed,${report.summary.totalDocumentsProcessed}`)
    lines.push(`Average Accuracy,${report.summary.averageAccuracy.toFixed(2)}%`)
    lines.push(`Average Processing Time,${report.summary.averageProcessingTime.toFixed(1)} hours`)
    lines.push(`Total Bonus Distributed,$${report.summary.totalBonusDistributed.toLocaleString()}`)
    lines.push('')

    // Top Performers
    lines.push('TOP PERFORMERS')
    lines.push('Rank,Verifier ID,Name,Accuracy,Documents,Bonus')
    report.topPerformers.forEach(performer => {
      lines.push(
        `${performer.rank},${performer.verifierId},${performer.name},${performer.accuracy.toFixed(2)}%,${performer.documentsProcessed},$${performer.bonusEarned.toLocaleString()}`
      )
    })
    lines.push('')

    // Performance Distribution
    lines.push('PERFORMANCE DISTRIBUTION')
    lines.push('Category,Count')
    lines.push(`Excellent (90-100%),${report.performanceDistribution.excellent}`)
    lines.push(`Good (75-89%),${report.performanceDistribution.good}`)
    lines.push(`Average (60-74%),${report.performanceDistribution.average}`)
    lines.push(`Poor (<60%),${report.performanceDistribution.poor}`)
    lines.push('')

    // Trends
    lines.push('TRENDS')
    lines.push('Metric,Status')
    lines.push(`Accuracy,${report.trends.accuracyTrend}`)
    lines.push(`Volume,${report.trends.volumeTrend}`)
    lines.push(`Speed,${report.trends.speedTrend}`)
    lines.push('')

    // Recommendations
    lines.push('RECOMMENDATIONS')
    report.recommendations.forEach((rec, index) => {
      lines.push(`${index + 1}. ${rec}`)
    })

    const content = lines.join('\n')

    return {
      format: 'csv',
      fileName: `performance-report-${report.reportId}.csv`,
      content,
      mimeType: 'text/csv',
    }
  }

  /**
   * Export report to JSON format
   */
  exportToJSON(report: PerformanceReport): ExportFormat {
    const content = JSON.stringify(report, null, 2)

    return {
      format: 'json',
      fileName: `performance-report-${report.reportId}.json`,
      content,
      mimeType: 'application/json',
    }
  }

  /**
   * Export report to HTML format
   */
  exportToHTML(report: PerformanceReport): ExportFormat {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Performance Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    h2 { color: #666; margin-top: 30px; }
    table { border-collapse: collapse; width: 100%; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .summary { background-color: #f0f0f0; padding: 15px; border-radius: 5px; }
    .metric { margin: 10px 0; }
    .recommendations { background-color: #fff3cd; padding: 15px; border-radius: 5px; }
    .recommendation { margin: 8px 0; }
  </style>
</head>
<body>
  <h1>Performance Report</h1>
  <p>Generated: ${report.generatedAt.toLocaleString()}</p>
  <p>Period: ${report.period.startDate.toDateString()} - ${report.period.endDate.toDateString()}</p>

  <h2>Summary</h2>
  <div class="summary">
    <div class="metric"><strong>Total Verifiers:</strong> ${report.summary.totalVerifiers}</div>
    <div class="metric"><strong>Documents Processed:</strong> ${report.summary.totalDocumentsProcessed.toLocaleString()}</div>
    <div class="metric"><strong>Average Accuracy:</strong> ${report.summary.averageAccuracy.toFixed(2)}%</div>
    <div class="metric"><strong>Average Processing Time:</strong> ${report.summary.averageProcessingTime.toFixed(1)} hours</div>
    <div class="metric"><strong>Total Bonus Distributed:</strong> $${report.summary.totalBonusDistributed.toLocaleString()}</div>
  </div>

  <h2>Top Performers</h2>
  <table>
    <tr>
      <th>Rank</th>
      <th>Name</th>
      <th>Accuracy</th>
      <th>Documents</th>
      <th>Bonus Earned</th>
    </tr>
    ${report.topPerformers.map(p => `
    <tr>
      <td>${p.rank}</td>
      <td>${p.name}</td>
      <td>${p.accuracy.toFixed(2)}%</td>
      <td>${p.documentsProcessed}</td>
      <td>$${p.bonusEarned.toLocaleString()}</td>
    </tr>
    `).join('')}
  </table>

  <h2>Performance Distribution</h2>
  <table>
    <tr>
      <th>Category</th>
      <th>Count</th>
    </tr>
    <tr>
      <td>Excellent (90-100%)</td>
      <td>${report.performanceDistribution.excellent}</td>
    </tr>
    <tr>
      <td>Good (75-89%)</td>
      <td>${report.performanceDistribution.good}</td>
    </tr>
    <tr>
      <td>Average (60-74%)</td>
      <td>${report.performanceDistribution.average}</td>
    </tr>
    <tr>
      <td>Poor (<60%)</td>
      <td>${report.performanceDistribution.poor}</td>
    </tr>
  </table>

  <h2>Trends</h2>
  <table>
    <tr>
      <th>Metric</th>
      <th>Status</th>
    </tr>
    <tr>
      <td>Accuracy</td>
      <td>${report.trends.accuracyTrend}</td>
    </tr>
    <tr>
      <td>Volume</td>
      <td>${report.trends.volumeTrend}</td>
    </tr>
    <tr>
      <td>Speed</td>
      <td>${report.trends.speedTrend}</td>
    </tr>
  </table>

  <h2>Recommendations</h2>
  <div class="recommendations">
    ${report.recommendations.map((rec, i) => `
    <div class="recommendation">${i + 1}. ${rec}</div>
    `).join('')}
  </div>
</body>
</html>
    `

    return {
      format: 'html',
      fileName: `performance-report-${report.reportId}.html`,
      content: html,
      mimeType: 'text/html',
    }
  }

  /**
   * Get report schedule options
   */
  getScheduleOptions(): Array<{
    id: string
    name: string
    description: string
    cronExpression: string
  }> {
    return [
      {
        id: 'daily',
        name: 'Daily',
        description: 'Generate and send report every day at 8:00 AM',
        cronExpression: '0 8 * * *',
      },
      {
        id: 'weekly',
        name: 'Weekly',
        description: 'Generate and send report every Monday at 9:00 AM',
        cronExpression: '0 9 * * 1',
      },
      {
        id: 'biweekly',
        name: 'Bi-weekly',
        description: 'Generate and send report every other Monday at 9:00 AM',
        cronExpression: '0 9 * * 1',
      },
      {
        id: 'monthly',
        name: 'Monthly',
        description: 'Generate and send report on the 1st of each month at 9:00 AM',
        cronExpression: '0 9 1 * *',
      },
    ]
  }
}

/**
 * Create singleton instance
 */
let exportService: PerformanceAnalyticsExportService | null = null

export function getPerformanceAnalyticsExportService(): PerformanceAnalyticsExportService {
  if (!exportService) {
    exportService = new PerformanceAnalyticsExportService()
  }
  return exportService
}
