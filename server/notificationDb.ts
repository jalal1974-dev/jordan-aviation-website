import { eq, desc, and, lt } from "drizzle-orm";
import { getDb } from "./db";
import { userNotifications } from "../drizzle/schema";
import type { InsertUserNotification } from "../drizzle/schema";

/**
 * Get user's notifications with optional filtering
 */
export async function getUserNotifications(
  userId: number,
  options?: {
    limit?: number;
    offset?: number;
    isRead?: boolean;
    isArchived?: boolean;
    category?: string;
    type?: string;
    severity?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { limit = 20, offset = 0, isRead, isArchived = false, category, type, severity } = options || {};

  const conditions = [
    eq(userNotifications.userId, userId),
    eq(userNotifications.isArchived, isArchived),
  ];

  if (isRead !== undefined) {
    conditions.push(eq(userNotifications.isRead, isRead));
  }

  if (category) {
    conditions.push(eq(userNotifications.category, category as any));
  }

  if (type) {
    conditions.push(eq(userNotifications.type, type as any));
  }

  if (severity) {
    conditions.push(eq(userNotifications.severity, severity as any));
  }

  return db
    .select()
    .from(userNotifications)
    .where(and(...conditions))
    .orderBy(desc(userNotifications.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get unread notification count for user
 */
export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false),
        eq(userNotifications.isArchived, false)
      )
    );

  return result.length;
}

/**
 * Get notification by ID
 */
export async function getNotificationById(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );

  return result[0] || null;
}

/**
 * Create a new notification
 */
export async function createNotification(data: InsertUserNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(userNotifications).values(data);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(userNotifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );
}

/**
 * Mark all notifications as read for user
 */
export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(userNotifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false)
      )
    );
}

/**
 * Archive notification
 */
export async function archiveNotification(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(userNotifications)
    .set({
      isArchived: true,
      archivedAt: new Date(),
    })
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );
}

/**
 * Unarchive notification
 */
export async function unarchiveNotification(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(userNotifications)
    .set({
      isArchived: false,
      archivedAt: null,
    })
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );
}

/**
 * Pin notification
 */
export async function pinNotification(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(userNotifications)
    .set({ isPinned: true })
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );
}

/**
 * Unpin notification
 */
export async function unpinNotification(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(userNotifications)
    .set({ isPinned: false })
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .delete(userNotifications)
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );
}

/**
 * Get notification statistics for user
 */
export async function getNotificationStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const unread = await db
    .select()
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false),
        eq(userNotifications.isArchived, false)
      )
    );

  const total = await db
    .select()
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isArchived, false)
      )
    );

  const byCategory = await db
    .select({
      category: userNotifications.category,
    })
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isArchived, false)
      )
    )
    .groupBy(userNotifications.category);

  const bySeverity = await db
    .select({
      severity: userNotifications.severity,
    })
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isArchived, false)
      )
    )
    .groupBy(userNotifications.severity);

  return {
    unreadCount: unread.length,
    totalCount: total.length,
    byCategory: byCategory.reduce(
      (acc: Record<string, number>, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    bySeverity: bySeverity.reduce(
      (acc: Record<string, number>, item: any) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}

/**
 * Archive old notifications (older than specified days)
 */
export async function archiveOldNotifications(userId: number, daysOld: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return db
    .update(userNotifications)
    .set({
      isArchived: true,
      archivedAt: new Date(),
    })
    .where(
      and(
        eq(userNotifications.userId, userId),
        lt(userNotifications.createdAt, cutoffDate),
        eq(userNotifications.isArchived, false)
      )
    );
}

/**
 * Delete archived notifications older than specified days
 */
export async function deleteOldArchivedNotifications(userId: number, daysOld: number = 90) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return db
    .delete(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isArchived, true),
        lt(userNotifications.createdAt, cutoffDate)
      )
    );
}
