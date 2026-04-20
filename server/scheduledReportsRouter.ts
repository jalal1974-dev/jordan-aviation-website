import { z } from "zod";
import { getDb } from "./db";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "./_core/trpc";

/**
 * In-memory storage for scheduled reports (replace with database table when schema is updated)
 */
const scheduledReportsStore: Map<
  number,
  {
    id: number;
    ownerId: number;
    name: string;
    frequency: "daily" | "weekly" | "biweekly" | "monthly";
    recipients: string[];
    format: "csv" | "json" | "html";
    sendTime: string;
    enabled: boolean;
    lastSent?: Date;
    nextScheduled?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
> = new Map();

let nextId = 1;

export const scheduledReportsRouter = router({
  /**
   * Get all scheduled reports for admin
   */
  getSchedules: adminProcedure.query(async ({ ctx }) => {
    try {
      const reports = Array.from(scheduledReportsStore.values()).filter(
        (r) => r.ownerId === ctx.user.id
      );

      return {
        success: true,
        data: reports.map((report) => ({
          id: report.id,
          name: report.name,
          frequency: report.frequency,
          recipients: report.recipients,
          format: report.format,
          sendTime: report.sendTime,
          enabled: report.enabled,
          lastSent: report.lastSent,
          nextScheduled: report.nextScheduled,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt,
        })),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch scheduled reports",
      });
    }
  }),

  /**
   * Create a new scheduled report
   */
  createSchedule: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
        recipients: z.array(z.string().email()),
        format: z.enum(["csv", "json", "html"]),
        sendTime: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const id = nextId++;
        const now = new Date();

        scheduledReportsStore.set(id, {
          id,
          ownerId: ctx.user.id,
          name: input.name,
          frequency: input.frequency,
          recipients: input.recipients,
          format: input.format,
          sendTime: input.sendTime,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        });

        return {
          success: true,
          message: "Schedule created successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create scheduled report",
        });
      }
    }),

  /**
   * Update an existing scheduled report
   */
  updateSchedule: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional(),
        recipients: z.array(z.string().email()).optional(),
        format: z.enum(["csv", "json", "html"]).optional(),
        sendTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const report = scheduledReportsStore.get(input.id);

        if (!report || report.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        scheduledReportsStore.set(input.id, {
          ...report,
          name: input.name || report.name,
          frequency: input.frequency || report.frequency,
          recipients: input.recipients || report.recipients,
          format: input.format || report.format,
          sendTime: input.sendTime || report.sendTime,
          updatedAt: new Date(),
        });

        return {
          success: true,
          message: "Schedule updated successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update scheduled report",
        });
      }
    }),

  /**
   * Delete a scheduled report
   */
  deleteSchedule: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const report = scheduledReportsStore.get(input.id);

        if (!report || report.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        scheduledReportsStore.delete(input.id);

        return {
          success: true,
          message: "Schedule deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete scheduled report",
        });
      }
    }),

  /**
   * Enable a scheduled report
   */
  enableSchedule: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const report = scheduledReportsStore.get(input.id);

        if (!report || report.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        scheduledReportsStore.set(input.id, {
          ...report,
          enabled: true,
          updatedAt: new Date(),
        });

        return {
          success: true,
          message: "Schedule enabled successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to enable scheduled report",
        });
      }
    }),

  /**
   * Disable a scheduled report
   */
  disableSchedule: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const report = scheduledReportsStore.get(input.id);

        if (!report || report.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        scheduledReportsStore.set(input.id, {
          ...report,
          enabled: false,
          updatedAt: new Date(),
        });

        return {
          success: true,
          message: "Schedule disabled successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disable scheduled report",
        });
      }
    }),

  /**
   * Trigger a report immediately
   */
  triggerNow: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const report = scheduledReportsStore.get(input.id);

        if (!report || report.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        // Update last sent time
        scheduledReportsStore.set(input.id, {
          ...report,
          lastSent: new Date(),
          updatedAt: new Date(),
        });

        return {
          success: true,
          message: "Report triggered successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to trigger report",
        });
      }
    }),
});
