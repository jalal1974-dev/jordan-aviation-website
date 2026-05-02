import { router, protectedProcedure, adminProcedure } from './_core/trpc';
import { z } from 'zod';
import { websocketNotificationService } from './websocketNotificationService';

/**
 * Notification Integration Router
 * Handles notification events triggered by document verification workflow
 */
export const notificationIntegrationRouter = router({
  /**
   * Notify admin when document is verified
   */
  notifyDocumentVerified: adminProcedure
    .input(z.object({
      documentId: z.string(),
      userId: z.string(),
      documentType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        websocketNotificationService.notifyDocumentVerified(
          String(ctx.user.id),
          input.documentId,
          input.userId,
          input.documentType
        );

        return { success: true, message: 'Notification sent' };
      } catch (error) {
        console.error('Error sending document verified notification:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),

  /**
   * Notify admin when document is rejected
   */
  notifyDocumentRejected: adminProcedure
    .input(z.object({
      documentId: z.string(),
      userId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        websocketNotificationService.notifyDocumentRejected(
          String(ctx.user.id),
          input.documentId,
          input.userId,
          input.reason
        );

        return { success: true, message: 'Notification sent' };
      } catch (error) {
        console.error('Error sending document rejected notification:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),

  /**
   * Notify admin when document is uploaded
   */
  notifyDocumentUploaded: adminProcedure
    .input(z.object({
      documentId: z.string(),
      userId: z.string(),
      documentType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        websocketNotificationService.notifyDocumentUploaded(
          String(ctx.user.id),
          input.documentId,
          input.userId,
          input.documentType
        );

        return { success: true, message: 'Notification sent' };
      } catch (error) {
        console.error('Error sending document uploaded notification:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),

  /**
   * Notify admin of performance alert
   */
  notifyPerformanceAlert: adminProcedure
    .input(z.object({
      verifierId: z.string(),
      metric: z.string(),
      value: z.number(),
      threshold: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        websocketNotificationService.notifyPerformanceAlert(
          String(ctx.user.id),
          input.verifierId,
          input.metric,
          input.value,
          input.threshold
        );

        return { success: true, message: 'Notification sent' };
      } catch (error) {
        console.error('Error sending performance alert notification:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),

  /**
   * Notify admin of threshold breach
   */
  notifyThresholdBreach: adminProcedure
    .input(z.object({
      thresholdType: z.string(),
      currentValue: z.number(),
      threshold: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        websocketNotificationService.notifyThresholdBreach(
          String(ctx.user.id),
          input.thresholdType,
          input.currentValue,
          input.threshold
        );

        return { success: true, message: 'Notification sent' };
      } catch (error) {
        console.error('Error sending threshold breach notification:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),

  /**
   * Notify admin of system alert
   */
  notifySystemAlert: adminProcedure
    .input(z.object({
      message: z.string(),
      severity: z.enum(['info', 'warning', 'error']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        websocketNotificationService.notifySystemAlert(
          String(ctx.user.id),
          input.message,
          input.severity || 'warning'
        );

        return { success: true, message: 'Notification sent' };
      } catch (error) {
        console.error('Error sending system alert notification:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),

  /**
   * Get notification history for admin
   */
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
    }))
    .query(({ input, ctx }: any) => {
      try {
        const history = websocketNotificationService.getHistory(ctx.user.id, input.limit);
        return { success: true, data: history };
      } catch (error) {
        console.error('Error fetching notification history:', error);
        return { success: false, error: 'Failed to fetch history', data: [] };
      }
    }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({
      notificationId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        websocketNotificationService.markAsRead(String(ctx.user.id), input.notificationId);
        return { success: true, message: 'Notification marked as read' };
      } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error: 'Failed to mark as read' };
      }
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        websocketNotificationService.markAllAsRead(String(ctx.user.id));
        return { success: true, message: 'All notifications marked as read' };
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false, error: 'Failed to mark all as read' };
      }
    }),

  /**
   * Get unread notification count
   */
  getUnreadCount: protectedProcedure
    .query(({ ctx }) => {
      try {
        const count = websocketNotificationService.getUnreadCount(String(ctx.user.id));
        return { success: true, data: count };
      } catch (error) {
        console.error('Error getting unread count:', error);
        return { success: false, error: 'Failed to get unread count', data: 0 };
      }
    }),

  /**
   * Clear notification history
   */
  clearHistory: protectedProcedure
    .mutation(async ({ ctx }: any) => {
      try {
        websocketNotificationService.clearHistory(String(ctx.user.id));
        return { success: true, message: 'Notification history cleared' };
      } catch (error) {
        console.error('Error clearing notification history:', error);
        return { success: false, error: 'Failed to clear history' };
      }
    }),

  /**
   * Notify bonus calculation complete
   */
  notifyBonusCalculationComplete: adminProcedure
    .input(z.object({
      calculationId: z.string(),
      totalBonus: z.number(),
      verifierCount: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        websocketNotificationService.notifyBonusCalculationComplete(
          String(ctx.user.id),
          input.calculationId,
          input.totalBonus,
          input.verifierCount
        );

        return { success: true, message: 'Notification sent' };
      } catch (error) {
        console.error('Error sending bonus calculation notification:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),

  /**
   * Notify scheduled report sent
   */
  notifyScheduledReportSent: adminProcedure
    .input(z.object({
      reportId: z.string(),
      recipients: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        websocketNotificationService.notifyScheduledReportSent(
          String(ctx.user.id),
          input.reportId,
          input.recipients
        );

        return { success: true, message: 'Notification sent' };
      } catch (error) {
        console.error('Error sending report sent notification:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),

  /**
   * Notify VRS sync complete
   */
  notifyVRSSyncComplete: adminProcedure
    .input(z.object({
      syncId: z.string(),
      documentsProcessed: z.number(),
      successCount: z.number(),
      failureCount: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        websocketNotificationService.notifyVRSSyncComplete(
          String(ctx.user.id),
          input.syncId,
          input.documentsProcessed,
          input.successCount,
          input.failureCount
        );

        return { success: true, message: 'Notification sent' };
      } catch (error) {
        console.error('Error sending VRS sync notification:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),
});
