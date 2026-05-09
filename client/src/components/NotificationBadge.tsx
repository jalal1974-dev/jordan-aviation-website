import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";

interface NotificationBadgeProps {
  className?: string;
  showZero?: boolean;
}

/**
 * Real-time notification badge component
 * Displays unread notification count with auto-refresh
 * Uses tRPC polling for reliable real-time updates
 */
export function NotificationBadge({
  className = "",
  showZero = false,
}: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Query for unread count with polling
  // Polls every 10 seconds for real-time feel
  const { data: countData } = trpc.notification.getUnreadCount.useQuery(
    undefined,
    {
      refetchInterval: 10000, // Poll every 10 seconds for real-time updates
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    }
  );

  // Update local state when query data changes
  useEffect(() => {
    if (countData?.count !== undefined) {
      setUnreadCount(countData.count);
    }
  }, [countData?.count]);

  // Don't show badge if count is 0 and showZero is false
  if (unreadCount === 0 && !showZero) {
    return null;
  }

  return (
    <Badge
      className={`
        absolute -top-2 -right-2 h-6 w-6 p-0 
        flex items-center justify-center text-xs font-bold
        bg-red-500 text-white border-2 border-white
        shadow-lg animate-pulse
        ${className}
      `}
      title={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </Badge>
  );
}

/**
 * Notification bell icon with badge
 * Use this component in navigation for consistent styling
 */
export function NotificationBellWithBadge({
  onClick,
  className = "",
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={onClick}
        className="relative p-2 text-foreground hover:text-primary transition-colors"
        title="Notifications"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>
      <NotificationBadge className="top-0 right-0" />
    </div>
  );
}
