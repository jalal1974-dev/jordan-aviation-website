import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  pinNotification,
  unpinNotification,
  deleteNotification,
  getNotificationStats,
} from "./notificationDb";
import type { InsertUserNotification } from "../drizzle/schema";

describe("Notification Center", () => {
  const testUserId = 1;
  let testNotificationId: number;

  beforeAll(async () => {
    // Create a test notification
    const testNotification: InsertUserNotification = {
      userId: testUserId,
      title: "Test Notification",
      titleAr: "إشعار اختبار",
      message: "This is a test notification",
      messageAr: "هذا إشعار اختبار",
      type: "booking_confirmation",
      category: "booking",
      severity: "medium",
      isRead: false,
      isArchived: false,
      isPinned: false,
      emailSent: false,
      smsSent: false,
      pushSent: false,
    };

    const result = await createNotification(testNotification);
    testNotificationId = result.insertId as number;
  });

  describe("Notification Retrieval", () => {
    it("should get user notifications with default pagination", async () => {
      const notifications = await getUserNotifications(testUserId);
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeGreaterThan(0);
    });

    it("should get unread notification count", async () => {
      const count = await getUnreadNotificationCount(testUserId);
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should get notification by ID", async () => {
      const notification = await getNotificationById(testNotificationId, testUserId);
      expect(notification).toBeDefined();
      expect(notification?.id).toBe(testNotificationId);
      expect(notification?.userId).toBe(testUserId);
    });

    it("should return null for non-existent notification", async () => {
      const notification = await getNotificationById(99999, testUserId);
      expect(notification).toBeNull();
    });

    it("should filter notifications by category", async () => {
      const notifications = await getUserNotifications(testUserId, {
        category: "booking",
      });
      expect(Array.isArray(notifications)).toBe(true);
      notifications.forEach((notif: any) => {
        expect(notif.category).toBe("booking");
      });
    });

    it("should filter notifications by severity", async () => {
      const notifications = await getUserNotifications(testUserId, {
        severity: "medium",
      });
      expect(Array.isArray(notifications)).toBe(true);
      notifications.forEach((notif: any) => {
        expect(notif.severity).toBe("medium");
      });
    });

    it("should filter unread notifications", async () => {
      const notifications = await getUserNotifications(testUserId, {
        isRead: false,
      });
      expect(Array.isArray(notifications)).toBe(true);
      notifications.forEach((notif: any) => {
        expect(notif.isRead).toBe(false);
      });
    });

    it("should respect pagination limit", async () => {
      const notifications = await getUserNotifications(testUserId, {
        limit: 5,
      });
      expect(notifications.length).toBeLessThanOrEqual(5);
    });
  });

  describe("Notification Management", () => {
    it("should mark notification as read", async () => {
      await markNotificationAsRead(testNotificationId, testUserId);
      const notification = await getNotificationById(testNotificationId, testUserId);
      expect(notification?.isRead).toBe(true);
      expect(notification?.readAt).toBeDefined();
    });

    it("should mark all notifications as read", async () => {
      // Create another unread notification
      const testNotification: InsertUserNotification = {
        userId: testUserId,
        title: "Another Test",
        titleAr: "اختبار آخر",
        message: "Another test notification",
        messageAr: "إشعار اختبار آخر",
        type: "flight_reminder",
        category: "flight",
        severity: "low",
        isRead: false,
        isArchived: false,
        isPinned: false,
        emailSent: false,
        smsSent: false,
        pushSent: false,
      };

      await createNotification(testNotification);
      await markAllNotificationsAsRead(testUserId);

      const notifications = await getUserNotifications(testUserId, {
        isRead: false,
      });
      expect(notifications.length).toBe(0);
    });

    it("should archive notification", async () => {
      // Create a new notification to archive
      const testNotification: InsertUserNotification = {
        userId: testUserId,
        title: "Archive Test",
        titleAr: "اختبار الأرشفة",
        message: "Test archiving",
        messageAr: "اختبار الأرشفة",
        type: "system_alert",
        category: "system",
        severity: "high",
        isRead: false,
        isArchived: false,
        isPinned: false,
        emailSent: false,
        smsSent: false,
        pushSent: false,
      };

      const result = await createNotification(testNotification);
      const archiveId = result.insertId as number;

      await archiveNotification(archiveId, testUserId);
      const notification = await getNotificationById(archiveId, testUserId);
      expect(notification?.isArchived).toBe(true);
      expect(notification?.archivedAt).toBeDefined();
    });

    it("should pin notification", async () => {
      await pinNotification(testNotificationId, testUserId);
      const notification = await getNotificationById(testNotificationId, testUserId);
      expect(notification?.isPinned).toBe(true);
    });

    it("should unpin notification", async () => {
      await unpinNotification(testNotificationId, testUserId);
      const notification = await getNotificationById(testNotificationId, testUserId);
      expect(notification?.isPinned).toBe(false);
    });

    it("should delete notification", async () => {
      // Create a notification to delete
      const testNotification: InsertUserNotification = {
        userId: testUserId,
        title: "Delete Test",
        titleAr: "اختبار الحذف",
        message: "Test deletion",
        messageAr: "اختبار الحذف",
        type: "general_message",
        category: "system",
        severity: "low",
        isRead: false,
        isArchived: false,
        isPinned: false,
        emailSent: false,
        smsSent: false,
        pushSent: false,
      };

      const result = await createNotification(testNotification);
      const deleteId = result.insertId as number;

      await deleteNotification(deleteId, testUserId);
      const notification = await getNotificationById(deleteId, testUserId);
      expect(notification).toBeNull();
    });
  });

  describe("Notification Statistics", () => {
    it("should get notification statistics", async () => {
      const stats = await getNotificationStats(testUserId);
      expect(stats).toBeDefined();
      expect(typeof stats.unreadCount).toBe("number");
      expect(typeof stats.totalCount).toBe("number");
      expect(typeof stats.byCategory).toBe("object");
      expect(typeof stats.bySeverity).toBe("object");
    });

    it("statistics should have correct structure", async () => {
      const stats = await getNotificationStats(testUserId);
      expect(stats.unreadCount).toBeGreaterThanOrEqual(0);
      expect(stats.totalCount).toBeGreaterThanOrEqual(stats.unreadCount);
      expect(Object.keys(stats.byCategory).length).toBeGreaterThanOrEqual(0);
      expect(Object.keys(stats.bySeverity).length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Notification Creation", () => {
    it("should create notification with all fields", async () => {
      const testNotification: InsertUserNotification = {
        userId: testUserId,
        title: "Full Test",
        titleAr: "اختبار كامل",
        message: "Complete notification test",
        messageAr: "اختبار الإشعار الكامل",
        type: "payment_confirmation",
        category: "payment",
        severity: "critical",
        relatedEntityType: "booking",
        relatedEntityId: 123,
        actionUrl: "https://example.com/action",
        isRead: false,
        isArchived: false,
        isPinned: false,
        metadata: { key: "value" },
        emailSent: true,
        smsSent: false,
        pushSent: true,
      };

      const result = await createNotification(testNotification);
      expect(result.insertId).toBeDefined();

      const notification = await getNotificationById(result.insertId as number, testUserId);
      expect(notification?.title).toBe(testNotification.title);
      expect(notification?.titleAr).toBe(testNotification.titleAr);
      expect(notification?.type).toBe(testNotification.type);
      expect(notification?.category).toBe(testNotification.category);
      expect(notification?.severity).toBe(testNotification.severity);
    });
  });

  afterAll(async () => {
    // Cleanup - delete test notifications
    try {
      await deleteNotification(testNotificationId, testUserId);
    } catch (error) {
      // Notification might already be deleted
    }
  });
});
