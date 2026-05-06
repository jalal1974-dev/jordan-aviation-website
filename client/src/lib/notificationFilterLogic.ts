import type { NotificationFilters } from "@/components/NotificationFilters";

/**
 * Notification type for filtering
 */
export interface Notification {
  id: number;
  title: string;
  message: string;
  category?: string;
  severity: "low" | "medium" | "high" | "critical";
  isRead: boolean;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/**
 * Apply all active filters to notifications
 */
export function applyFilters(
  notifications: Notification[],
  filters: NotificationFilters
): Notification[] {
  return notifications.filter((notification) => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Read status filter
    if (filters.readStatus !== "all") {
      if (filters.readStatus === "read" && !notification.isRead) return false;
      if (filters.readStatus === "unread" && notification.isRead) return false;
    }

    // Severity filter
    if (filters.severity !== "all") {
      if (notification.severity !== filters.severity) return false;
    }

    // Category filter
    if (filters.category) {
      if (notification.category !== filters.category) return false;
    }

    // Pinned status filter
    if (filters.isPinned !== "all") {
      if (filters.isPinned === "pinned" && !notification.isPinned) return false;
      if (filters.isPinned === "unpinned" && notification.isPinned) return false;
    }

    // Archive filter (always exclude archived unless specifically requested)
    if (notification.isArchived) return false;

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const notificationDate = new Date(notification.createdAt);

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (notificationDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (notificationDate > toDate) return false;
      }
    }

    return true;
  });
}

/**
 * Sort notifications by various criteria
 */
export type SortBy = "newest" | "oldest" | "unread_first" | "pinned_first";

export function sortNotifications(
  notifications: Notification[],
  sortBy: SortBy
): Notification[] {
  const sorted = [...notifications];

  switch (sortBy) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    case "unread_first":
      return sorted.sort((a, b) => {
        if (a.isRead === b.isRead) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return a.isRead ? 1 : -1;
      });

    case "pinned_first":
      return sorted.sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return a.isPinned ? -1 : 1;
      });

    default:
      return sorted;
  }
}

/**
 * Get filter statistics
 */
export interface FilterStats {
  total: number;
  unread: number;
  read: number;
  pinned: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byCategory: Record<string, number>;
}

export function getFilterStats(notifications: Notification[]): FilterStats {
  const stats: FilterStats = {
    total: notifications.length,
    unread: 0,
    read: 0,
    pinned: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    byCategory: {},
  };

  notifications.forEach((notif) => {
    if (notif.isRead) stats.read++;
    else stats.unread++;

    if (notif.isPinned) stats.pinned++;

    // Severity counts
    if (notif.severity === "critical") stats.critical++;
    else if (notif.severity === "high") stats.high++;
    else if (notif.severity === "medium") stats.medium++;
    else if (notif.severity === "low") stats.low++;

    // Category counts
    if (notif.category) {
      stats.byCategory[notif.category] =
        (stats.byCategory[notif.category] || 0) + 1;
    }
  });

  return stats;
}

/**
 * Export filtered notifications to CSV
 */
export function exportToCSV(
  notifications: Notification[],
  filename = "notifications.csv"
): void {
  const headers = [
    "ID",
    "Title",
    "Message",
    "Category",
    "Severity",
    "Status",
    "Created Date",
  ];

  const rows = notifications.map((notif) => [
    notif.id,
    `"${notif.title.replace(/"/g, '""')}"`,
    `"${notif.message.replace(/"/g, '""')}"`,
    notif.category || "N/A",
    notif.severity,
    notif.isRead ? "Read" : "Unread",
    new Date(notif.createdAt).toLocaleString(),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export filtered notifications to JSON
 */
export function exportToJSON(
  notifications: Notification[],
  filename = "notifications.json"
): void {
  const json = JSON.stringify(notifications, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get date range label
 */
export function getDateRangeLabel(
  dateFrom: Date | null,
  dateTo: Date | null,
  language: "en" | "ar"
): string {
  if (!dateFrom && !dateTo) {
    return language === "en" ? "All time" : "كل الوقت";
  }

  if (dateFrom && dateTo) {
    const from = new Date(dateFrom).toLocaleDateString(
      language === "en" ? "en-US" : "ar-SA"
    );
    const to = new Date(dateTo).toLocaleDateString(
      language === "en" ? "en-US" : "ar-SA"
    );
    return language === "en" ? `${from} to ${to}` : `من ${from} إلى ${to}`;
  }

  if (dateFrom) {
    const from = new Date(dateFrom).toLocaleDateString(
      language === "en" ? "en-US" : "ar-SA"
    );
    return language === "en" ? `From ${from}` : `من ${from}`;
  }

  if (dateTo) {
    const to = new Date(dateTo).toLocaleDateString(
      language === "en" ? "en-US" : "ar-SA"
    );
    return language === "en" ? `Until ${to}` : `حتى ${to}`;
  }

  return "";
}
