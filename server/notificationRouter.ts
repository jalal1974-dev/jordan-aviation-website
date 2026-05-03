import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  unarchiveNotification,
  pinNotification,
  unpinNotification,
  deleteNotification,
  getNotificationStats,
  archiveOldNotifications,
  deleteOldArchivedNotifications,
} from "./notificationDb";

/**
 * Notification Center Router
 * Handles all notification-related operations for users
 */
export const notificationRouter = router({
  // ============================================================================
  // NOTIFICATION RETRIEVAL
  // ============================================================================

  /**
   * Get user's notifications with filtering
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        isRead: z.boolean().optional(),
        isArchived: z.boolean().default(false),
        category: z.string().optional(),
        type: z.string().optional(),
        severity: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const notifications = await getUserNotifications(ctx.user.id, {
          limit: input.limit,
          offset: input.offset,
          isRead: input.isRead,
          isArchived: input.isArchived,
          category: input.category,
          type: input.type,
          severity: input.severity,
        });

        return {
          success: true,
          data: notifications,
        };
      } catch (error) {
        console.error("Error fetching notifications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch notifications",
        });
      }
    }),

  /**
   * Get unread notification count
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    try {
      const count = await getUnreadNotificationCount(ctx.user.id);
      return {
        success: true,
        count,
      };
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch unread count",
      });
    }
  }),

  /**
   * Get notification statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const stats = await getNotificationStats(ctx.user.id);
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch notification statistics",
      });
    }
  }),

  /**
   * Get single notification by ID
   */
  getNotification: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const notification = await getNotificationById(input.notificationId, ctx.user.id);

        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notification not found",
          });
        }

        return {
          success: true,
          data: notification,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch notification",
        });
      }
    }),

  // ============================================================================
  // NOTIFICATION MANAGEMENT
  // ============================================================================

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const notification = await getNotificationById(input.notificationId, ctx.user.id);
        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notification not found",
          });
        }

        await markNotificationAsRead(input.notificationId, ctx.user.id);

        return {
          success: true,
          message: "Notification marked as read",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error marking notification as read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notification as read",
        });
      }
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await markAllNotificationsAsRead(ctx.user.id);

      return {
        success: true,
        message: "All notifications marked as read",
      };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to mark all notifications as read",
      });
    }
  }),

  /**
   * Archive notification
   */
  archive: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const notification = await getNotificationById(input.notificationId, ctx.user.id);
        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notification not found",
          });
        }

        await archiveNotification(input.notificationId, ctx.user.id);

        return {
          success: true,
          message: "Notification archived",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error archiving notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to archive notification",
        });
      }
    }),

  /**
   * Unarchive notification
   */
  unarchive: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const notification = await getNotificationById(input.notificationId, ctx.user.id);
        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notification not found",
          });
        }

        await unarchiveNotification(input.notificationId, ctx.user.id);

        return {
          success: true,
          message: "Notification unarchived",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error unarchiving notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unarchive notification",
        });
      }
    }),

  /**
   * Pin notification
   */
  pin: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const notification = await getNotificationById(input.notificationId, ctx.user.id);
        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notification not found",
          });
        }

        await pinNotification(input.notificationId, ctx.user.id);

        return {
          success: true,
          message: "Notification pinned",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error pinning notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to pin notification",
        });
      }
    }),

  /**
   * Unpin notification
   */
  unpin: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const notification = await getNotificationById(input.notificationId, ctx.user.id);
        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notification not found",
          });
        }

        await unpinNotification(input.notificationId, ctx.user.id);

        return {
          success: true,
          message: "Notification unpinned",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error unpinning notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unpin notification",
        });
      }
    }),

  /**
   * Delete notification
   */
  delete: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const notification = await getNotificationById(input.notificationId, ctx.user.id);
        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notification not found",
          });
        }

        await deleteNotification(input.notificationId, ctx.user.id);

        return {
          success: true,
          message: "Notification deleted",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete notification",
        });
      }
    }),

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Archive old notifications
   */
  archiveOld: protectedProcedure
    .input(z.object({ daysOld: z.number().default(30) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await archiveOldNotifications(ctx.user.id, input.daysOld);

        return {
          success: true,
          message: "Old notifications archived",
        };
      } catch (error) {
        console.error("Error archiving old notifications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to archive old notifications",
        });
      }
    }),

  /**
   * Delete old archived notifications
   */
  deleteOldArchived: protectedProcedure
    .input(z.object({ daysOld: z.number().default(90) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await deleteOldArchivedNotifications(ctx.user.id, input.daysOld);

        return {
          success: true,
          message: "Old archived notifications deleted",
        };
      } catch (error) {
        console.error("Error deleting old archived notifications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete old archived notifications",
        });
      }
    }),
});
