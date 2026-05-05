/**
 * Notification grouping and categorization utilities
 * Organizes notifications by type, category, and severity
 */

export interface NotificationGroup {
  id: string;
  title: string;
  titleAr: string;
  icon: string;
  color: string;
  count: number;
  notifications: any[];
  isExpanded: boolean;
}

export interface GroupedNotifications {
  [key: string]: NotificationGroup;
}

/**
 * Notification type definitions with display properties
 */
export const NOTIFICATION_TYPES = {
  booking_confirmation: {
    title: "Booking Confirmations",
    titleAr: "تأكيدات الحجز",
    icon: "CheckCircle",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  booking_update: {
    title: "Booking Updates",
    titleAr: "تحديثات الحجز",
    icon: "RefreshCw",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  flight_reminder: {
    title: "Flight Reminders",
    titleAr: "تذكيرات الرحلة",
    icon: "Clock",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  flight_status: {
    title: "Flight Status",
    titleAr: "حالة الرحلة",
    icon: "Plane",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  payment_confirmation: {
    title: "Payment Confirmations",
    titleAr: "تأكيدات الدفع",
    icon: "CreditCard",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  payment_failed: {
    title: "Payment Issues",
    titleAr: "مشاكل الدفع",
    icon: "AlertCircle",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  promotion: {
    title: "Promotions & Offers",
    titleAr: "العروض والترقيات",
    icon: "Gift",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  loyalty_update: {
    title: "Loyalty Program",
    titleAr: "برنامج الولاء",
    icon: "Star",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  document_verification: {
    title: "Document Verification",
    titleAr: "التحقق من الوثائق",
    icon: "FileCheck",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  system_alert: {
    title: "System Alerts",
    titleAr: "تنبيهات النظام",
    icon: "AlertTriangle",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  general_message: {
    title: "General Messages",
    titleAr: "الرسائل العامة",
    icon: "MessageSquare",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
};

/**
 * Group notifications by type
 */
export function groupNotificationsByType(
  notifications: any[]
): GroupedNotifications {
  const grouped: GroupedNotifications = {};

  // Initialize groups for all notification types
  Object.entries(NOTIFICATION_TYPES).forEach(([typeKey, typeConfig]) => {
    grouped[typeKey] = {
      id: typeKey,
      title: typeConfig.title,
      titleAr: typeConfig.titleAr,
      icon: typeConfig.icon,
      color: typeConfig.color,
      count: 0,
      notifications: [],
      isExpanded: true, // Default to expanded
    };
  });

  // Distribute notifications into groups
  notifications.forEach((notification) => {
    const typeKey = notification.type || "general_message";
    if (grouped[typeKey]) {
      grouped[typeKey].notifications.push(notification);
      grouped[typeKey].count++;
    } else {
      // Fallback for unknown types
      if (!grouped.general_message) {
        grouped.general_message = {
          id: "general_message",
          title: NOTIFICATION_TYPES.general_message.title,
          titleAr: NOTIFICATION_TYPES.general_message.titleAr,
          icon: NOTIFICATION_TYPES.general_message.icon,
          color: NOTIFICATION_TYPES.general_message.color,
          count: 0,
          notifications: [],
          isExpanded: true,
        };
      }
      grouped.general_message.notifications.push(notification);
      grouped.general_message.count++;
    }
  });

  // Sort notifications within each group by date (newest first)
  Object.values(grouped).forEach((group) => {
    group.notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  // Filter out empty groups
  return Object.fromEntries(
    Object.entries(grouped).filter(([, group]) => group.count > 0)
  );
}

/**
 * Get total unread count from grouped notifications
 */
export function getTotalUnreadCount(grouped: GroupedNotifications): number {
  return Object.values(grouped).reduce((total, group) => {
    const unreadInGroup = group.notifications.filter(
      (n) => !n.isRead
    ).length;
    return total + unreadInGroup;
  }, 0);
}

/**
 * Toggle group expansion state
 */
export function toggleGroupExpansion(
  grouped: GroupedNotifications,
  groupId: string
): GroupedNotifications {
  return {
    ...grouped,
    [groupId]: {
      ...grouped[groupId],
      isExpanded: !grouped[groupId].isExpanded,
    },
  };
}

/**
 * Expand all groups
 */
export function expandAllGroups(
  grouped: GroupedNotifications
): GroupedNotifications {
  const expanded: GroupedNotifications = {};
  Object.entries(grouped).forEach(([key, group]) => {
    expanded[key] = { ...group, isExpanded: true };
  });
  return expanded;
}

/**
 * Collapse all groups
 */
export function collapseAllGroups(
  grouped: GroupedNotifications
): GroupedNotifications {
  const collapsed: GroupedNotifications = {};
  Object.entries(grouped).forEach(([key, group]) => {
    collapsed[key] = { ...group, isExpanded: false };
  });
  return collapsed;
}
