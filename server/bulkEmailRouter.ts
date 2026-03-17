import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

// Create admin procedure
const adminProcedure = protectedProcedure.use(async ({ ctx, next }: any) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
import { z } from "zod";
import {
  sendPendingDocumentReminders,
  sendExpiringDocumentReminders,
  sendAllReminderCampaigns,
  getPendingDocumentReminders,
  getExpiringDocumentReminders,
} from "./bulkEmailCampaignService";

/**
 * Bulk Email Campaigns Router
 * Admin-only procedures for managing email campaigns
 */

export const bulkEmailRouter = router({
  /**
   * Get pending document reminders (preview before sending)
   */
  getPendingReminders: adminProcedure
    .input(
      z.object({
        minDaysWaiting: z.number().min(1).max(30).default(3),
      })
    )
    .query(async ({ input }: any) => {
      const reminders = await getPendingDocumentReminders(input.minDaysWaiting);
      return {
        success: true,
        data: reminders,
        count: reminders.length,
      };
    }),

  /**
   * Get expiring document reminders (preview before sending)
   */
  getExpiringReminders: adminProcedure
    .input(
      z.object({
        daysUntilExpiry: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ input }: any) => {
      const reminders = await getExpiringDocumentReminders(input.daysUntilExpiry);
      return {
        success: true,
        data: reminders,
        count: reminders.length,
      };
    }),

  /**
   * Send pending document reminder emails
   */
  sendPendingReminders: adminProcedure
    .input(
      z.object({
        minDaysWaiting: z.number().min(1).max(30).default(3),
      })
    )
    .mutation(async ({ input }: any) => {
      const result = await sendPendingDocumentReminders();
      return {
        success: true,
        message: `Sent ${result.emailsSent} reminder emails (${result.emailsFailed} failed)`,
        data: result,
      };
    }),

  /**
   * Send expiring document reminder emails
   */
  sendExpiringReminders: adminProcedure
    .input(
      z.object({
        daysUntilExpiry: z.number().min(1).max(90).default(30),
      })
    )
    .mutation(async ({ input }: any) => {
      const result = await sendExpiringDocumentReminders();
      return {
        success: true,
        message: `Sent ${result.emailsSent} reminder emails (${result.emailsFailed} failed)`,
        data: result,
      };
    }),

  /**
   * Send all reminder campaigns at once
   */
  sendAllCampaigns: adminProcedure.mutation(async () => {
    const results = await sendAllReminderCampaigns();
    
    const totalSent = results.reduce((sum, r) => sum + r.emailsSent, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.emailsFailed, 0);
    
    return {
      success: true,
      message: `Sent ${totalSent} total emails (${totalFailed} failed) across ${results.length} campaigns`,
      data: results,
    };
  }),

  /**
   * Get campaign statistics
   */
  getCampaignStats: adminProcedure.query(async () => {
    // Get pending and expiring counts
    const pendingReminders = await getPendingDocumentReminders(3);
    const expiringReminders = await getExpiringDocumentReminders(30);
    
    return {
      success: true,
      data: {
        pendingDocumentsCount: pendingReminders.length,
        expiringDocumentsCount: expiringReminders.length,
        totalRemindersNeeded: pendingReminders.length + expiringReminders.length,
        lastCampaignRun: null,
        nextScheduledRun: null,
      },
    };
  }),
});
