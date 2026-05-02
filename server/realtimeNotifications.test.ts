import { describe, it, expect, beforeEach } from 'vitest';
import { websocketNotificationService, AdminNotification } from './websocketNotificationService';
import { notificationPersistenceService } from './notificationPersistenceService';

describe('Real-time Notification System', () => {
  beforeEach(() => {
    // Clear notifications before each test
    websocketNotificationService.clearHistory('admin1');
    websocketNotificationService.clearHistory('admin2');
  });

  describe('WebSocket Notification Service', () => {
    it('should subscribe admin to notifications', () => {
      let receivedNotification: AdminNotification | null = null;

      const unsubscribe = websocketNotificationService.subscribe(
        'user1',
        'admin1',
        (notification) => {
          receivedNotification = notification;
        }
      );

      expect(websocketNotificationService.getSubscriberCount('admin1')).toBe(1);

      unsubscribe();
      expect(websocketNotificationService.getSubscriberCount('admin1')).toBe(0);
    });

    it('should broadcast document verified notification', () => {
      let receivedNotification: AdminNotification | null = null;

      websocketNotificationService.subscribe('user1', 'admin1', (notification) => {
        receivedNotification = notification;
      });

      websocketNotificationService.notifyDocumentVerified('admin1', 'doc123', 'user456', 'passport');

      expect(receivedNotification).not.toBeNull();
      expect(receivedNotification?.type).toBe('document_verified');
      expect(receivedNotification?.severity).toBe('success');
      expect(receivedNotification?.data?.documentId).toBe('doc123');
    });

    it('should broadcast document rejected notification', () => {
      let receivedNotification: AdminNotification | null = null;

      websocketNotificationService.subscribe('user1', 'admin1', (notification) => {
        receivedNotification = notification;
      });

      websocketNotificationService.notifyDocumentRejected('admin1', 'doc123', 'user456', 'Invalid format');

      expect(receivedNotification).not.toBeNull();
      expect(receivedNotification?.type).toBe('document_rejected');
      expect(receivedNotification?.severity).toBe('warning');
      expect(receivedNotification?.data?.reason).toBe('Invalid format');
    });

    it('should broadcast performance alert notification', () => {
      let receivedNotification: AdminNotification | null = null;

      websocketNotificationService.subscribe('user1', 'admin1', (notification) => {
        receivedNotification = notification;
      });

      websocketNotificationService.notifyPerformanceAlert('admin1', 'verifier123', 'accuracy', 0.75, 0.85);

      expect(receivedNotification).not.toBeNull();
      expect(receivedNotification?.type).toBe('performance_alert');
      expect(receivedNotification?.data?.value).toBe(0.75);
      expect(receivedNotification?.data?.threshold).toBe(0.85);
    });

    it('should track notification history', () => {
      websocketNotificationService.notifyDocumentVerified('admin1', 'doc1', 'user1', 'passport');
      websocketNotificationService.notifyDocumentVerified('admin1', 'doc2', 'user2', 'visa');

      const history = websocketNotificationService.getHistory('admin1');
      expect(history.length).toBe(2);
      expect(history[0].data?.documentId).toBe('doc1');
      expect(history[1].data?.documentId).toBe('doc2');
    });

    it('should mark notification as read', () => {
      websocketNotificationService.notifyDocumentVerified('admin1', 'doc1', 'user1', 'passport');

      let history = websocketNotificationService.getHistory('admin1');
      const notificationId = history[0].id;
      expect(history[0].read).toBe(false);

      websocketNotificationService.markAsRead('admin1', notificationId);

      history = websocketNotificationService.getHistory('admin1');
      expect(history[0].read).toBe(true);
    });

    it('should mark all notifications as read', () => {
      websocketNotificationService.notifyDocumentVerified('admin1', 'doc1', 'user1', 'passport');
      websocketNotificationService.notifyDocumentVerified('admin1', 'doc2', 'user2', 'visa');

      let history = websocketNotificationService.getHistory('admin1');
      expect(history.every(n => !n.read)).toBe(true);

      websocketNotificationService.markAllAsRead('admin1');

      history = websocketNotificationService.getHistory('admin1');
      expect(history.every(n => n.read)).toBe(true);
    });

    it('should get unread count', () => {
      websocketNotificationService.notifyDocumentVerified('admin1', 'doc1', 'user1', 'passport');
      websocketNotificationService.notifyDocumentVerified('admin1', 'doc2', 'user2', 'visa');

      expect(websocketNotificationService.getUnreadCount('admin1')).toBe(2);

      const history = websocketNotificationService.getHistory('admin1');
      websocketNotificationService.markAsRead('admin1', history[0].id);

      expect(websocketNotificationService.getUnreadCount('admin1')).toBe(1);
    });

    it('should broadcast to multiple admins', () => {
      let admin1Notification: AdminNotification | null = null;
      let admin2Notification: AdminNotification | null = null;

      websocketNotificationService.subscribe('user1', 'admin1', (notification) => {
        admin1Notification = notification;
      });

      websocketNotificationService.subscribe('user2', 'admin2', (notification) => {
        admin2Notification = notification;
      });

      const notification: AdminNotification = {
        id: 'test123',
        type: 'system_alert',
        title: 'System Alert',
        message: 'System maintenance scheduled',
        severity: 'info',
        timestamp: Date.now(),
        read: false,
      };

      websocketNotificationService.broadcast(notification, ['admin1', 'admin2']);

      expect(admin1Notification).not.toBeNull();
      expect(admin2Notification).not.toBeNull();
      expect(admin1Notification?.message).toBe('System maintenance scheduled');
      expect(admin2Notification?.message).toBe('System maintenance scheduled');
    });

    it('should send bonus calculation complete notification', () => {
      let receivedNotification: AdminNotification | null = null;

      websocketNotificationService.subscribe('user1', 'admin1', (notification) => {
        receivedNotification = notification;
      });

      websocketNotificationService.notifyBonusCalculationComplete('admin1', 'calc123', 5000, 50);

      expect(receivedNotification?.type).toBe('bonus_calculation_complete');
      expect(receivedNotification?.data?.totalBonus).toBe(5000);
      expect(receivedNotification?.data?.verifierCount).toBe(50);
    });

    it('should send scheduled report sent notification', () => {
      let receivedNotification: AdminNotification | null = null;

      websocketNotificationService.subscribe('user1', 'admin1', (notification) => {
        receivedNotification = notification;
      });

      websocketNotificationService.notifyScheduledReportSent('admin1', 'report123', 5);

      expect(receivedNotification?.type).toBe('scheduled_report_sent');
      expect(receivedNotification?.data?.recipients).toBe(5);
    });

    it('should send VRS sync complete notification', () => {
      let receivedNotification: AdminNotification | null = null;

      websocketNotificationService.subscribe('user1', 'admin1', (notification) => {
        receivedNotification = notification;
      });

      websocketNotificationService.notifyVRSSyncComplete('admin1', 'sync123', 100, 95, 5);

      expect(receivedNotification?.type).toBe('vrs_sync_complete');
      expect(receivedNotification?.data?.documentsProcessed).toBe(100);
      expect(receivedNotification?.data?.successCount).toBe(95);
      expect(receivedNotification?.data?.failureCount).toBe(5);
    });
  });

  describe('Notification Persistence Service', () => {
    it('should store notification', async () => {
      const notification: AdminNotification = {
        id: 'test123',
        type: 'document_verified',
        title: 'Document Verified',
        message: 'Document verified successfully',
        severity: 'success',
        timestamp: Date.now(),
        read: false,
      };

      await notificationPersistenceService.storeNotification('admin1', notification);

      const stored = await notificationPersistenceService.getNotifications('admin1');
      expect(stored.length).toBe(1);
      expect(stored[0].id).toBe('test123');
    });

    it('should retrieve notifications with pagination', async () => {
      for (let i = 0; i < 10; i++) {
        const notification: AdminNotification = {
          id: `test${i}`,
          type: 'document_verified',
          title: 'Document Verified',
          message: `Document ${i} verified`,
          severity: 'success',
          timestamp: Date.now() + i * 1000,
          read: false,
        };

        await notificationPersistenceService.storeNotification('admin1', notification);
      }

      const page1 = await notificationPersistenceService.getNotifications('admin1', { limit: 5, offset: 0 });
      const page2 = await notificationPersistenceService.getNotifications('admin1', { limit: 5, offset: 5 });

      expect(page1.length).toBe(5);
      expect(page2.length).toBe(5);
    });

    it('should filter notifications by type', async () => {
      const notif1: AdminNotification = {
        id: 'test1',
        type: 'document_verified',
        title: 'Document Verified',
        message: 'Document verified',
        severity: 'success',
        timestamp: Date.now(),
        read: false,
      };

      const notif2: AdminNotification = {
        id: 'test2',
        type: 'performance_alert',
        title: 'Performance Alert',
        message: 'Performance alert',
        severity: 'warning',
        timestamp: Date.now(),
        read: false,
      };

      await notificationPersistenceService.storeNotification('admin1', notif1);
      await notificationPersistenceService.storeNotification('admin1', notif2);

      const verified = await notificationPersistenceService.getNotifications('admin1', { type: 'document_verified' });
      const alerts = await notificationPersistenceService.getNotifications('admin1', { type: 'performance_alert' });

      expect(verified.length).toBe(1);
      expect(verified[0].type).toBe('document_verified');
      expect(alerts.length).toBe(1);
      expect(alerts[0].type).toBe('performance_alert');
    });

    it('should filter unread notifications only', async () => {
      const notification: AdminNotification = {
        id: 'test1',
        type: 'document_verified',
        title: 'Document Verified',
        message: 'Document verified',
        severity: 'success',
        timestamp: Date.now(),
        read: false,
      };

      await notificationPersistenceService.storeNotification('admin1', notification);

      let unread = await notificationPersistenceService.getNotifications('admin1', { unreadOnly: true });
      expect(unread.length).toBe(1);

      await notificationPersistenceService.updateNotificationStatus('admin1', 'test1', true);

      unread = await notificationPersistenceService.getNotifications('admin1', { unreadOnly: true });
      expect(unread.length).toBe(0);
    });

    it('should get notification statistics', async () => {
      const notif1: AdminNotification = {
        id: 'test1',
        type: 'document_verified',
        title: 'Document Verified',
        message: 'Document verified',
        severity: 'success',
        timestamp: Date.now(),
        read: false,
      };

      const notif2: AdminNotification = {
        id: 'test2',
        type: 'performance_alert',
        title: 'Performance Alert',
        message: 'Performance alert',
        severity: 'warning',
        timestamp: Date.now(),
        read: false,
      };

      await notificationPersistenceService.storeNotification('admin1', notif1);
      await notificationPersistenceService.storeNotification('admin1', notif2);

      const stats = await notificationPersistenceService.getStatistics('admin1');

      expect(stats.total).toBe(2);
      expect(stats.unread).toBe(2);
      expect(stats.byType['document_verified']).toBe(1);
      expect(stats.byType['performance_alert']).toBe(1);
      expect(stats.bySeverity['success']).toBe(1);
      expect(stats.bySeverity['warning']).toBe(1);
    });

    it('should search notifications', async () => {
      const notif1: AdminNotification = {
        id: 'test1',
        type: 'document_verified',
        title: 'Passport Verified',
        message: 'Passport document verified successfully',
        severity: 'success',
        timestamp: Date.now(),
        read: false,
      };

      const notif2: AdminNotification = {
        id: 'test2',
        type: 'document_rejected',
        title: 'Visa Rejected',
        message: 'Visa document rejected',
        severity: 'error',
        timestamp: Date.now(),
        read: false,
      };

      await notificationPersistenceService.storeNotification('admin1', notif1);
      await notificationPersistenceService.storeNotification('admin1', notif2);

      const results = await notificationPersistenceService.searchNotifications('admin1', 'passport');

      expect(results.length).toBe(1);
      expect(results[0].id).toBe('test1');
    });

    it('should batch update notification status', async () => {
      for (let i = 0; i < 3; i++) {
        const notification: AdminNotification = {
          id: `test${i}`,
          type: 'document_verified',
          title: 'Document Verified',
          message: `Document ${i} verified`,
          severity: 'success',
          timestamp: Date.now(),
          read: false,
        };

        await notificationPersistenceService.storeNotification('admin1', notification);
      }

      const updated = await notificationPersistenceService.batchUpdateStatus(
        'admin1',
        ['test0', 'test1', 'test2'],
        true
      );

      expect(updated).toBe(3);

      const notifications = await notificationPersistenceService.getNotifications('admin1');
      expect(notifications.every(n => n.read)).toBe(true);
    });
  });

  describe('Notification Integration', () => {
    it('should handle complete notification workflow', async () => {
      let receivedNotification: AdminNotification | null = null;

      // Subscribe to notifications
      websocketNotificationService.subscribe('user1', 'admin1', (notification) => {
        receivedNotification = notification;
      });

      // Send document verified notification
      websocketNotificationService.notifyDocumentVerified('admin1', 'doc123', 'user456', 'passport');

      // Verify notification was received
      expect(receivedNotification).not.toBeNull();
      expect(receivedNotification?.type).toBe('document_verified');

      // Store notification for persistence
      if (receivedNotification) {
        await notificationPersistenceService.storeNotification('admin1', receivedNotification);
      }

      // Retrieve from storage
      const stored = await notificationPersistenceService.getNotifications('admin1');
      expect(stored.length).toBe(1);

      // Mark as read
      if (receivedNotification) {
        await notificationPersistenceService.updateNotificationStatus('admin1', receivedNotification.id, true);
      }

      // Verify read status
      const updated = await notificationPersistenceService.getNotifications('admin1');
      expect(updated[0].read).toBe(true);
    });
  });
});
