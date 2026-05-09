import { AdminNotification } from './websocketNotificationService';

/**
 * Notification Persistence Service
 * Handles storing and retrieving notifications from database
 * In production, this would use a database (MySQL, PostgreSQL, etc.)
 * For now, using in-memory storage with file backup
 */

interface StoredNotification extends AdminNotification {
  adminId: string;
  createdAt: number;
  expiresAt: number;
}

class NotificationPersistenceService {
  private notifications: Map<string, StoredNotification[]> = new Map();
  private maxNotificationsPerAdmin = 500;
  private notificationTTL = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * Store notification for persistence
   */
  async storeNotification(adminId: string, notification: AdminNotification): Promise<void> {
    // DISABLED: Notification storage temporarily disabled
    console.log("[Persistence] Storage disabled - notification would have been:", notification);
    return;
    
    try {
      if (!this.notifications.has(adminId)) {
        this.notifications.set(adminId, []);
      }

      const stored: StoredNotification = {
        ...notification,
        adminId,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.notificationTTL,
      };

      const notifications = this.notifications.get(adminId)!;
      notifications.push(stored);

      // Keep only recent notifications
      if (notifications.length > this.maxNotificationsPerAdmin) {
        notifications.shift();
      }

      // In production, would save to database here
      // await db.notifications.create(stored);
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  /**
   * Retrieve notifications for admin
   */
  async getNotifications(
    adminId: string,
    options: {
      limit?: number;
      offset?: number;
      type?: string;
      severity?: string;
      unreadOnly?: boolean;
    } = {}
  ): Promise<StoredNotification[]> {
    try {
      const { limit = 50, offset = 0, type, severity, unreadOnly = false } = options;

      let notifications = this.notifications.get(adminId) || [];

      // Filter by type
      if (type) {
        notifications = notifications.filter(n => n.type === type);
      }

      // Filter by severity
      if (severity) {
        notifications = notifications.filter(n => n.severity === severity);
      }

      // Filter unread only
      if (unreadOnly) {
        notifications = notifications.filter(n => !n.read);
      }

      // Remove expired notifications
      notifications = notifications.filter(n => n.expiresAt > Date.now());

      // Sort by timestamp descending
      notifications.sort((a, b) => b.timestamp - a.timestamp);

      // Apply pagination
      return notifications.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error retrieving notifications:', error);
      return [];
    }
  }

  /**
   * Update notification read status
   */
  async updateNotificationStatus(
    adminId: string,
    notificationId: string,
    read: boolean
  ): Promise<boolean> {
    try {
      const notifications = this.notifications.get(adminId);
      if (!notifications) return false;

      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return false;

      notification.read = read;

      // In production, would update in database here
      // await db.notifications.update({ id: notificationId }, { read });

      return true;
    } catch (error) {
      console.error('Error updating notification status:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(adminId: string, notificationId: string): Promise<boolean> {
    try {
      const notifications = this.notifications.get(adminId);
      if (!notifications) return false;

      const index = notifications.findIndex(n => n.id === notificationId);
      if (index === -1) return false;

      notifications.splice(index, 1);

      // In production, would delete from database here
      // await db.notifications.delete({ id: notificationId });

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Delete all notifications for admin
   */
  async deleteAllNotifications(adminId: string): Promise<boolean> {
    try {
      this.notifications.delete(adminId);

      // In production, would delete from database here
      // await db.notifications.deleteMany({ adminId });

      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  }

  /**
   * Get notification statistics
   */
  async getStatistics(adminId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    try {
      const notifications = this.notifications.get(adminId) || [];

      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        byType: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
      };

      for (const notification of notifications) {
        // Count by type
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;

        // Count by severity
        stats.bySeverity[notification.severity] = (stats.bySeverity[notification.severity] || 0) + 1;
      }

      return stats;
    } catch (error) {
      console.error('Error getting notification statistics:', error);
      return { total: 0, unread: 0, byType: {}, bySeverity: {} };
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      let cleanedCount = 0;

      for (const [adminId, notifications] of Array.from(this.notifications.entries())) {
        const initialLength = notifications.length;
        const filtered = notifications.filter((n: StoredNotification) => n.expiresAt > Date.now());
        this.notifications.set(adminId, filtered);
        cleanedCount += initialLength - filtered.length;
      }

      // In production, would delete from database here
      // await db.notifications.deleteMany({ expiresAt: { $lt: Date.now() } });

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }

  /**
   * Archive old notifications (for long-term storage)
   */
  async archiveOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = Date.now() - daysOld * 24 * 60 * 60 * 1000;
      let archivedCount = 0;

      for (const [adminId, notifications] of Array.from(this.notifications.entries())) {
        const oldNotifications = notifications.filter((n: StoredNotification) => n.timestamp < cutoffDate);
        archivedCount += oldNotifications.length;

        // In production, would move to archive table
        // await db.notificationArchive.insertMany(oldNotifications);
        // await db.notifications.deleteMany({ timestamp: { $lt: cutoffDate } });
      }

      return archivedCount;
    } catch (error) {
      console.error('Error archiving old notifications:', error);
      return 0;
    }
  }

  /**
   * Search notifications
   */
  async searchNotifications(
    adminId: string,
    query: string,
    options: { limit?: number } = {}
  ): Promise<StoredNotification[]> {
    try {
      const { limit = 50 } = options;
      const notifications = this.notifications.get(adminId) || [];
      const lowerQuery = query.toLowerCase();

      const results = notifications.filter(
        n =>
          n.title.toLowerCase().includes(lowerQuery) ||
          n.message.toLowerCase().includes(lowerQuery) ||
          n.type.toLowerCase().includes(lowerQuery)
      );

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching notifications:', error);
      return [];
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(
    adminId: string,
    notificationId: string
  ): Promise<StoredNotification | null> {
    try {
      const notifications = this.notifications.get(adminId);
      if (!notifications) return null;

      return notifications.find(n => n.id === notificationId) || null;
    } catch (error) {
      console.error('Error getting notification by ID:', error);
      return null;
    }
  }

  /**
   * Batch update notification status
   */
  async batchUpdateStatus(
    adminId: string,
    notificationIds: string[],
    read: boolean
  ): Promise<number> {
    try {
      const notifications = this.notifications.get(adminId);
      if (!notifications) return 0;

      let updatedCount = 0;
      for (const notificationId of notificationIds) {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = read;
          updatedCount++;
        }
      }

      return updatedCount;
    } catch (error) {
      console.error('Error batch updating notification status:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const notificationPersistenceService = new NotificationPersistenceService();
