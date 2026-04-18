/**
 * Performance Export Router
 * Provides tRPC procedures for generating and exporting performance reports
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from './_core/trpc'
import { getPerformanceAnalyticsExportService } from './performanceAnalyticsExportService'

/**
 * Performance Export Router
 */
export const performanceExportRouter = router({
  /**
   * Generate performance report for date range
   */
  generateReport: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can generate performance reports',
          })
        }

        const exportService = getPerformanceAnalyticsExportService()
        const report = await exportService.generatePerformanceReport(
          new Date(input.startDate),
          new Date(input.endDate)
        )

        return {
          success: true,
          reportId: report.reportId,
          summary: report.summary,
          generatedAt: report.generatedAt,
        }
      } catch (error) {
        console.error('[Performance Export] Error generating report:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate performance report',
        })
      }
    }),

  /**
   * Export report to specific format
   */
  exportReport: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        format: z.enum(['csv', 'json', 'html']),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can export performance reports',
          })
        }

        const exportService = getPerformanceAnalyticsExportService()
        const report = await exportService.generatePerformanceReport(
          new Date(input.startDate),
          new Date(input.endDate)
        )

        let exportedReport
        switch (input.format) {
          case 'csv':
            exportedReport = exportService.exportToCSV(report)
            break
          case 'json':
            exportedReport = exportService.exportToJSON(report)
            break
          case 'html':
            exportedReport = exportService.exportToHTML(report)
            break
          default:
            throw new Error('Invalid export format')
        }

        return {
          success: true,
          fileName: exportedReport.fileName,
          format: exportedReport.format,
          mimeType: exportedReport.mimeType,
          content: exportedReport.content,
        }
      } catch (error) {
        console.error('[Performance Export] Error exporting report:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export performance report',
        })
      }
    }),

  /**
   * Get available schedule options
   */
  getScheduleOptions: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Verify admin role
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view schedule options',
        })
      }

      const exportService = getPerformanceAnalyticsExportService()
      const options = exportService.getScheduleOptions()

      return {
        success: true,
        options,
      }
    } catch (error) {
      console.error('[Performance Export] Error getting schedule options:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get schedule options',
      })
    }
  }),

  /**
   * Get quick report (last 7 days)
   */
  getQuickReport: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Verify admin role
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view quick reports',
        })
      }

      const exportService = getPerformanceAnalyticsExportService()
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago

      const report = await exportService.generatePerformanceReport(startDate, endDate)

      return {
        success: true,
        report,
      }
    } catch (error) {
      console.error('[Performance Export] Error generating quick report:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate quick report',
      })
    }
  }),

  /**
   * Get monthly report
   */
  getMonthlyReport: protectedProcedure
    .input(
      z.object({
        year: z.number().int().min(2020).max(2100),
        month: z.number().int().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can view monthly reports',
          })
        }

        const exportService = getPerformanceAnalyticsExportService()
        const startDate = new Date(input.year, input.month - 1, 1)
        const endDate = new Date(input.year, input.month, 0)

        const report = await exportService.generatePerformanceReport(startDate, endDate)

        return {
          success: true,
          report,
        }
      } catch (error) {
        console.error('[Performance Export] Error generating monthly report:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate monthly report',
        })
      }
    }),

  /**
   * Get year-to-date report
   */
  getYearToDateReport: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Verify admin role
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view YTD reports',
        })
      }

      const exportService = getPerformanceAnalyticsExportService()
      const now = new Date()
      const startDate = new Date(now.getFullYear(), 0, 1)
      const endDate = now

      const report = await exportService.generatePerformanceReport(startDate, endDate)

      return {
        success: true,
        report,
      }
    } catch (error) {
      console.error('[Performance Export] Error generating YTD report:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate year-to-date report',
      })
    }
  }),
})
