import { EventEmitter } from 'events';

export type NotificationType = 
  | 'document_verified'
  | 'document_rejected'
  | 'document_uploaded'
  | 'verification_started'
  | 'performance_alert'
  | 'threshold_breach'
  | 'system_alert'
  | 'bonus_calculation_complete'
  | 'scheduled_report_sent'
  | 'vrs_sync_complete';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
  actionUrl?: string;
}

export interface NotificationSubscriber {
  userId: string;
  adminId: string;
  callback: (notification: AdminNotification) => void;
}

class WebSocketNotificationService extends EventEmitter {
  private subscribers: Map<string, NotificationSubscriber[]> = new Map();
  private notificationHistory: Map<string, AdminNotification[]> = new Map();
  private maxHistoryPerAdmin = 100;

  /**
   * Subscribe admin to real-time notifications
   */
  subscribe(userId: string, adminId: string, callback: (notification: AdminNotification) => void): () => void {
    if (!this.subscribers.has(adminId)) {
      this.subscribers.set(adminId, []);
    }

    const subscriber: NotificationSubscriber = { userId, adminId, callback };
    this.subscribers.get(adminId)!.push(subscriber);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(adminId);
      if (subs) {
        const index = subs.indexOf(subscriber);
        if (index > -1) {
          subs.splice(index, 1);
        }
      }
    };
  }

  /**
   * Broadcast notification to all subscribers
   */
  broadcast(notification: AdminNotification, targetAdminIds?: string[]): void {
    // DISABLED: Notification broadcasting temporarily disabled
    console.log("[WebSocket] Broadcasting disabled - notification would have been:", notification);
    return;
    
    const adminIds = targetAdminIds || Array.from(this.subscribers.keys());

    for (const adminId of adminIds) {
      const subscribers = this.subscribers.get(adminId) || [];
      
      // Store in history
      if (!this.notificationHistory.has(adminId)) {
        this.notificationHistory.set(adminId, []);
      }
      const history = this.notificationHistory.get(adminId)!;
      history.push(notification);
      
      // Keep only recent notifications
      if (history.length > this.maxHistoryPerAdmin) {
        history.shift();
      }

      // Send to all subscribers
      for (const subscriber of subscribers) {
        try {
          subscriber.callback(notification);
        } catch (error) {
          console.error(`Error sending notification to admin ${adminId}:`, error);
        }
      }

      // Emit event for logging/tracking
      this.emit('notification_sent', { adminId, notification });
    }
  }

  /**
   * Send document verification notification
   */
  notifyDocumentVerified(adminId: string, documentId: string, userId: string, documentType: string): void {
    const notification: AdminNotification = {
      id: `doc_verified_${Date.now()}_${Math.random()}`,
      type: 'document_verified',
      title: 'Document Verified',
      message: `Document ${documentId} (${documentType}) verified for user ${userId}`,
      severity: 'success',
      timestamp: Date.now(),
      read: false,
      data: { documentId, userId, documentType },
      actionUrl: `/admin/documents/${documentId}`,
    };

    this.broadcast(notification, [adminId]);
  }

  /**
   * Send document rejection notification
   */
  notifyDocumentRejected(adminId: string, documentId: string, userId: string, reason: string): void {
    const notification: AdminNotification = {
      id: `doc_rejected_${Date.now()}_${Math.random()}`,
      type: 'document_rejected',
      title: 'Document Rejected',
      message: `Document ${documentId} rejected: ${reason}`,
      severity: 'warning',
      timestamp: Date.now(),
      read: false,
      data: { documentId, userId, reason },
      actionUrl: `/admin/documents/${documentId}`,
    };

    this.broadcast(notification, [adminId]);
  }

  /**
   * Send document upload notification
   */
  notifyDocumentUploaded(adminId: string, documentId: string, userId: string, documentType: string): void {
    const notification: AdminNotification = {
      id: `doc_uploaded_${Date.now()}_${Math.random()}`,
      type: 'document_uploaded',
      title: 'New Document Uploaded',
      message: `New ${documentType} document uploaded by user ${userId}`,
      severity: 'info',
      timestamp: Date.now(),
      read: false,
      data: { documentId, userId, documentType },
      actionUrl: `/admin/documents/${documentId}`,
    };

    this.broadcast(notification, [adminId]);
  }

  /**
   * Send performance alert notification
   */
  notifyPerformanceAlert(adminId: string, verifierId: string, metric: string, value: number, threshold: number): void {
    const notification: AdminNotification = {
      id: `perf_alert_${Date.now()}_${Math.random()}`,
      type: 'performance_alert',
      title: 'Performance Alert',
      message: `Verifier ${verifierId} ${metric} is ${value.toFixed(2)} (threshold: ${threshold.toFixed(2)})`,
      severity: value < threshold ? 'error' : 'warning',
      timestamp: Date.now(),
      read: false,
      data: { verifierId, metric, value, threshold },
      actionUrl: `/admin/performance/${verifierId}`,
    };

    this.broadcast(notification, [adminId]);
  }

  /**
   * Send threshold breach notification
   */
  notifyThresholdBreach(adminId: string, thresholdType: string, currentValue: number, threshold: number): void {
    const notification: AdminNotification = {
      id: `threshold_${Date.now()}_${Math.random()}`,
      type: 'threshold_breach',
      title: 'Threshold Breach Alert',
      message: `${thresholdType} threshold breached: ${currentValue.toFixed(2)} > ${threshold.toFixed(2)}`,
      severity: 'error',
      timestamp: Date.now(),
      read: false,
      data: { thresholdType, currentValue, threshold },
    };

    this.broadcast(notification, [adminId]);
  }

  /**
   * Send system alert notification
   */
  notifySystemAlert(adminId: string, alertMessage: string, severity: 'info' | 'warning' | 'error' = 'warning'): void {
    const notification: AdminNotification = {
      id: `system_alert_${Date.now()}_${Math.random()}`,
      type: 'system_alert',
      title: 'System Alert',
      message: alertMessage,
      severity,
      timestamp: Date.now(),
      read: false,
    };

    this.broadcast(notification, [adminId]);
  }

  /**
   * Send bonus calculation complete notification
   */
  notifyBonusCalculationComplete(adminId: string, calculationId: string, totalBonus: number, verifierCount: number): void {
    const notification: AdminNotification = {
      id: `bonus_calc_${Date.now()}_${Math.random()}`,
      type: 'bonus_calculation_complete',
      title: 'Bonus Calculation Complete',
      message: `Bonus calculation ${calculationId} complete: ${verifierCount} verifiers, total bonus: $${totalBonus.toFixed(2)}`,
      severity: 'success',
      timestamp: Date.now(),
      read: false,
      data: { calculationId, totalBonus, verifierCount },
      actionUrl: `/admin/bonus-simulator`,
    };

    this.broadcast(notification, [adminId]);
  }

  /**
   * Send scheduled report sent notification
   */
  notifyScheduledReportSent(adminId: string, reportId: string, recipients: number): void {
    const notification: AdminNotification = {
      id: `report_sent_${Date.now()}_${Math.random()}`,
      type: 'scheduled_report_sent',
      title: 'Scheduled Report Sent',
      message: `Performance report ${reportId} sent to ${recipients} recipient(s)`,
      severity: 'success',
      timestamp: Date.now(),
      read: false,
      data: { reportId, recipients },
      actionUrl: `/admin/scheduled-reports`,
    };

    this.broadcast(notification, [adminId]);
  }

  /**
   * Send VRS sync complete notification
   */
  notifyVRSSyncComplete(adminId: string, syncId: string, documentsProcessed: number, successCount: number, failureCount: number): void {
    const notification: AdminNotification = {
      id: `vrs_sync_${Date.now()}_${Math.random()}`,
      type: 'vrs_sync_complete',
      title: 'VRS Sync Complete',
      message: `VRS sync ${syncId}: ${successCount}/${documentsProcessed} successful, ${failureCount} failed`,
      severity: failureCount > 0 ? 'warning' : 'success',
      timestamp: Date.now(),
      read: false,
      data: { syncId, documentsProcessed, successCount, failureCount },
    };

    this.broadcast(notification, [adminId]);
  }

  /**
   * Get notification history for admin
   */
  getHistory(adminId: string, limit: number = 50): AdminNotification[] {
    const history = this.notificationHistory.get(adminId) || [];
    return history.slice(-limit);
  }

  /**
   * Mark notification as read
   */
  markAsRead(adminId: string, notificationId: string): void {
    const history = this.notificationHistory.get(adminId);
    if (history) {
      const notification = history.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }
  }

  /**
   * Mark all notifications as read for admin
   */
  markAllAsRead(adminId: string): void {
    const history = this.notificationHistory.get(adminId);
    if (history) {
      history.forEach(n => n.read = true);
    }
  }

  /**
   * Clear notification history for admin
   */
  clearHistory(adminId: string): void {
    this.notificationHistory.delete(adminId);
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(adminId: string): number {
    const history = this.notificationHistory.get(adminId) || [];
    return history.filter(n => !n.read).length;
  }

  /**
   * Get active subscriber count
   */
  getSubscriberCount(adminId: string): number {
    return (this.subscribers.get(adminId) || []).length;
  }

  /**
   * Get all active admins
   */
  getActiveAdmins(): string[] {
    return Array.from(this.subscribers.keys());
  }
}

// Export singleton instance
export const websocketNotificationService = new WebSocketNotificationService();
