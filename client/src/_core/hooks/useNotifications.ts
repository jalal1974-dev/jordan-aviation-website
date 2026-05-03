import { useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook for managing real-time notifications
 * Automatically refetches notifications at intervals and handles WebSocket updates
 */
export function useNotifications(enabled: boolean = true) {
  const notificationsQuery = trpc.notification.getNotifications.useQuery(
    {
      limit: 20,
      offset: 0,
      isArchived: false,
    },
    {
      enabled,
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: true,
    }
  );

  const unreadCountQuery = trpc.notification.getUnreadCount.useQuery(
    undefined,
    {
      enabled,
      refetchInterval: 30000,
      refetchOnWindowFocus: true,
    }
  );

  const statsQuery = trpc.notification.getStats.useQuery(
    undefined,
    {
      enabled,
      refetchInterval: 60000, // Refetch every minute
      refetchOnWindowFocus: true,
    }
  );

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Connect to WebSocket for real-time updates
  const connectWebSocket = useCallback(() => {
    if (!enabled) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const wsUrl = `${protocol}://${window.location.host}/api/notifications/ws`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("[Notifications] WebSocket connected");
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "notification") {
            // Refetch notifications when new one arrives
            void notificationsQuery.refetch();
            void unreadCountQuery.refetch();
            void statsQuery.refetch();
          } else if (message.type === "notification_read") {
            // Update unread count when notification is read
            void unreadCountQuery.refetch();
            void statsQuery.refetch();
          } else if (message.type === "notification_archived") {
            // Refetch when notification is archived
            void notificationsQuery.refetch();
            void statsQuery.refetch();
          }
        } catch (error) {
          console.error("[Notifications] Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("[Notifications] WebSocket error:", error);
      };

      wsRef.current.onclose = () => {
        console.log("[Notifications] WebSocket disconnected");
        // Attempt to reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          void connectWebSocket();
        }, 5000);
      };
    } catch (error) {
      console.error("[Notifications] Error connecting to WebSocket:", error);
    }
  }, [enabled, notificationsQuery, unreadCountQuery, statsQuery]);

  // Connect on mount
  useEffect(() => {
    if (enabled) {
      void connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, connectWebSocket]);

  // Manual refetch functions
  const refetchNotifications = useCallback(() => {
    void notificationsQuery.refetch();
  }, [notificationsQuery]);

  const refetchUnreadCount = useCallback(() => {
    void unreadCountQuery.refetch();
  }, [unreadCountQuery]);

  const refetchStats = useCallback(() => {
    void statsQuery.refetch();
  }, [statsQuery]);

  const refetchAll = useCallback(() => {
    void notificationsQuery.refetch();
    void unreadCountQuery.refetch();
    void statsQuery.refetch();
  }, [notificationsQuery, unreadCountQuery, statsQuery]);

  return {
    notifications: notificationsQuery.data?.data || [],
    unreadCount: unreadCountQuery.data?.count || 0,
    stats: statsQuery.data?.data,
    isLoading:
      notificationsQuery.isLoading ||
      unreadCountQuery.isLoading ||
      statsQuery.isLoading,
    isError:
      notificationsQuery.isError ||
      unreadCountQuery.isError ||
      statsQuery.isError,
    refetchNotifications,
    refetchUnreadCount,
    refetchStats,
    refetchAll,
    wsConnected: (wsRef.current?.readyState ?? null) === WebSocket.OPEN,
  };
}
