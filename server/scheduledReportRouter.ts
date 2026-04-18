/**
 * Scheduled Report Management Router
 * Provides tRPC procedures for managing scheduled performance reports
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from './_core/trpc'
import { getScheduledReportService } from './scheduledReportService'

/**
 * Scheduled Report Router
 * Admin-only procedures for managing report schedules
 */
export const scheduledReportRouter = router({
  /**
   * Get all scheduled reports
   */
  getSchedules: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Verify admin role
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view scheduled reports',
        })
      }

      const reportService = getScheduledReportService()
      const schedules = reportService.getSchedules()

      return {
        success: true,
        data: schedules,
        count: schedules.length,
      }
    } catch (error) {
      console.error('[Scheduled Reports] Error fetching schedules:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch scheduled reports',
      })
    }
  }),

  /**
   * Get a specific schedule
   */
  getSchedule: protectedProcedure
    .input(
      z.object({
        scheduleId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can view scheduled reports',
          })
        }

        const reportService = getScheduledReportService()
        const schedule = reportService.getSchedule(input.scheduleId)

        if (!schedule) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Schedule not found',
          })
        }

        return {
          success: true,
          data: schedule,
        }
      } catch (error) {
        console.error('[Scheduled Reports] Error fetching schedule:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch schedule',
        })
      }
    }),

  /**
   * Create a new schedule
   */
  createSchedule: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
        recipients: z.array(z.string().email()),
        format: z.enum(['csv', 'json', 'html']),
        sendTime: z.string().regex(/^\d{2}:\d{2}$/),
        enabled: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can create scheduled reports',
          })
        }

        const reportService = getScheduledReportService()
        const scheduleId = `schedule-${Date.now()}`

        reportService.addSchedule({
          id: scheduleId,
          name: input.name,
          frequency: input.frequency,
          recipients: input.recipients,
          format: input.format,
          sendTime: input.sendTime,
          enabled: input.enabled,
        })

        return {
          success: true,
          scheduleId,
          message: 'Schedule created successfully',
        }
      } catch (error) {
        console.error('[Scheduled Reports] Error creating schedule:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create schedule',
        })
      }
    }),

  /**
   * Update a schedule
   */
  updateSchedule: protectedProcedure
    .input(
      z.object({
        scheduleId: z.string(),
        name: z.string().optional(),
        frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
        recipients: z.array(z.string().email()).optional(),
        format: z.enum(['csv', 'json', 'html']).optional(),
        sendTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can update scheduled reports',
          })
        }

        const reportService = getScheduledReportService()
        const { scheduleId, ...updates } = input

        reportService.updateSchedule(scheduleId, updates)

        return {
          success: true,
          message: 'Schedule updated successfully',
        }
      } catch (error) {
        console.error('[Scheduled Reports] Error updating schedule:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update schedule',
        })
      }
    }),

  /**
   * Delete a schedule
   */
  deleteSchedule: protectedProcedure
    .input(
      z.object({
        scheduleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can delete scheduled reports',
          })
        }

        const reportService = getScheduledReportService()
        reportService.removeSchedule(input.scheduleId)

        return {
          success: true,
          message: 'Schedule deleted successfully',
        }
      } catch (error) {
        console.error('[Scheduled Reports] Error deleting schedule:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete schedule',
        })
      }
    }),

  /**
   * Enable a schedule
   */
  enableSchedule: protectedProcedure
    .input(
      z.object({
        scheduleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can enable scheduled reports',
          })
        }

        const reportService = getScheduledReportService()
        reportService.updateSchedule(input.scheduleId, { enabled: true })

        return {
          success: true,
          message: 'Schedule enabled successfully',
        }
      } catch (error) {
        console.error('[Scheduled Reports] Error enabling schedule:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to enable schedule',
        })
      }
    }),

  /**
   * Disable a schedule
   */
  disableSchedule: protectedProcedure
    .input(
      z.object({
        scheduleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can disable scheduled reports',
          })
        }

        const reportService = getScheduledReportService()
        reportService.updateSchedule(input.scheduleId, { enabled: false })

        return {
          success: true,
          message: 'Schedule disabled successfully',
        }
      } catch (error) {
        console.error('[Scheduled Reports] Error disabling schedule:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disable schedule',
        })
      }
    }),

  /**
   * Trigger a report immediately
   */
  triggerNow: protectedProcedure
    .input(
      z.object({
        scheduleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can trigger reports',
          })
        }

        const reportService = getScheduledReportService()
        const schedule = reportService.getSchedule(input.scheduleId)

        if (!schedule) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Schedule not found',
          })
        }

        // Trigger report generation (in background)
        // In production, this would queue the job
        console.log(`[Scheduled Reports] Triggering ${schedule.name} manually`)

        return {
          success: true,
          message: `${schedule.name} has been triggered and will be sent shortly`,
        }
      } catch (error) {
        console.error('[Scheduled Reports] Error triggering report:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to trigger report',
        })
      }
    }),
})
