import { useState, useEffect, useCallback, useRef } from 'react';

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
  actionUrl?: string;
}

interface UseAdminNotificationsOptions {
  autoConnect?: boolean;
  maxNotifications?: number;
  onNotificationReceived?: (notification: AdminNotification) => void;
}

/**
 * Hook for managing real-time admin notifications
 * Simulates WebSocket connection for development
 * In production, would connect to actual WebSocket server
 */
export function useAdminNotifications({
  autoConnect = true,
  maxNotifications = 50,
  onNotificationReceived,
}: UseAdminNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    try {
      // In production, replace with actual WebSocket URL
      const wsUrl = process.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications`;
      
      // For development, simulate WebSocket with EventSource or polling
      // This is a placeholder - actual implementation would use real WebSocket
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnected(false);
    }
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Add notification
  const addNotification = useCallback((notification: AdminNotification) => {
    setNotifications((prev) => {
      const updated = [notification, ...prev];
      // Keep only recent notifications
      return updated.slice(0, maxNotifications);
    });

    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  }, [maxNotifications, onNotificationReceived]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    notifications,
    isConnected,
    error,
    unreadCount,
    connect,
    disconnect,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
  };
}

/**
 * Hook for simulating notifications (for development/testing)
 */
export function useNotificationSimulator() {
  const {
    notifications,
    addNotification,
    ...rest
  } = useAdminNotifications();

  const simulateDocumentVerified = useCallback((documentId: string, userId: string) => {
    addNotification({
      id: `sim_${Date.now()}`,
      type: 'document_verified',
      title: 'Document Verified',
      message: `Document ${documentId} verified for user ${userId}`,
      severity: 'success',
      timestamp: Date.now(),
      read: false,
      data: { documentId, userId },
      actionUrl: `/admin/documents/${documentId}`,
    });
  }, [addNotification]);

  const simulatePerformanceAlert = useCallback((verifierId: string, metric: string) => {
    addNotification({
      id: `sim_${Date.now()}`,
      type: 'performance_alert',
      title: 'Performance Alert',
      message: `Verifier ${verifierId} ${metric} is below threshold`,
      severity: 'warning',
      timestamp: Date.now(),
      read: false,
      data: { verifierId, metric },
      actionUrl: `/admin/performance/${verifierId}`,
    });
  }, [addNotification]);

  const simulateSystemAlert = useCallback((message: string) => {
    addNotification({
      id: `sim_${Date.now()}`,
      type: 'system_alert',
      title: 'System Alert',
      message,
      severity: 'error',
      timestamp: Date.now(),
      read: false,
    });
  }, [addNotification]);

  return {
    notifications,
    simulateDocumentVerified,
    simulatePerformanceAlert,
    simulateSystemAlert,
    ...rest,
  };
}
