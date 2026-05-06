import type { NotificationFilters } from "@/components/NotificationFilters";
import { subDays, startOfDay, endOfDay } from "date-fns";

/**
 * Predefined filter presets for quick access
 */
export interface FilterPreset {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  filters: NotificationFilters;
  icon?: string;
}

/**
 * Get all available filter presets
 */
export function getFilterPresets(): FilterPreset[] {
  const today = new Date();

  return [
    {
      id: "unread",
      name: "Unread Only",
      nameAr: "غير المقروءة فقط",
      description: "Show all unread notifications",
      descriptionAr: "عرض جميع الإشعارات غير المقروءة",
      filters: {
        searchTerm: "",
        readStatus: "unread",
        severity: "all",
        category: "",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      },
      icon: "Mail",
    },
    {
      id: "pinned",
      name: "Pinned Only",
      nameAr: "المثبتة فقط",
      description: "Show only pinned notifications",
      descriptionAr: "عرض الإشعارات المثبتة فقط",
      filters: {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "",
        dateFrom: null,
        dateTo: null,
        isPinned: "pinned",
        isArchived: false,
      },
      icon: "Pin",
    },
    {
      id: "critical",
      name: "Critical Alerts",
      nameAr: "التنبيهات الحرجة",
      description: "Show critical severity notifications",
      descriptionAr: "عرض الإشعارات ذات الخطورة الحرجة",
      filters: {
        searchTerm: "",
        readStatus: "all",
        severity: "critical",
        category: "",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      },
      icon: "AlertTriangle",
    },
    {
      id: "today",
      name: "Today",
      nameAr: "اليوم",
      description: "Notifications from today",
      descriptionAr: "الإشعارات من اليوم",
      filters: {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "",
        dateFrom: startOfDay(today),
        dateTo: endOfDay(today),
        isPinned: "all",
        isArchived: false,
      },
      icon: "Calendar",
    },
    {
      id: "week",
      name: "This Week",
      nameAr: "هذا الأسبوع",
      description: "Notifications from the last 7 days",
      descriptionAr: "الإشعارات من آخر 7 أيام",
      filters: {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "",
        dateFrom: subDays(today, 7),
        dateTo: endOfDay(today),
        isPinned: "all",
        isArchived: false,
      },
      icon: "Calendar",
    },
    {
      id: "month",
      name: "This Month",
      nameAr: "هذا الشهر",
      description: "Notifications from the last 30 days",
      descriptionAr: "الإشعارات من آخر 30 يوم",
      filters: {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "",
        dateFrom: subDays(today, 30),
        dateTo: endOfDay(today),
        isPinned: "all",
        isArchived: false,
      },
      icon: "Calendar",
    },
    {
      id: "bookings",
      name: "Booking Notifications",
      nameAr: "إشعارات الحجز",
      description: "All booking-related notifications",
      descriptionAr: "جميع الإشعارات المتعلقة بالحجز",
      filters: {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "booking_confirmation",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      },
      icon: "Plane",
    },
    {
      id: "flights",
      name: "Flight Updates",
      nameAr: "تحديثات الرحلات",
      description: "Flight reminders and updates",
      descriptionAr: "تذكيرات الرحلات والتحديثات",
      filters: {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "flight_update",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      },
      icon: "Plane",
    },
    {
      id: "promotions",
      name: "Promotions",
      nameAr: "العروض الترويجية",
      description: "Promotional offers and deals",
      descriptionAr: "العروض الترويجية والصفقات",
      filters: {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "promotional_offer",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      },
      icon: "Gift",
    },
    {
      id: "documents",
      name: "Document Verification",
      nameAr: "التحقق من المستندات",
      description: "Document verification status updates",
      descriptionAr: "تحديثات حالة التحقق من المستندات",
      filters: {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "document_verification",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      },
      icon: "FileCheck",
    },
  ];
}

/**
 * Save filter preset to local storage
 */
export function saveFilterPreset(
  presetName: string,
  filters: NotificationFilters
): void {
  const presets = getCustomPresets();
  const newPreset: FilterPreset = {
    id: `custom_${Date.now()}`,
    name: presetName,
    nameAr: presetName,
    description: "Custom filter preset",
    descriptionAr: "مرشح مخصص",
    filters,
  };

  presets.push(newPreset);
  localStorage.setItem("notification_filter_presets", JSON.stringify(presets));
}

/**
 * Get custom filter presets from local storage
 */
export function getCustomPresets(): FilterPreset[] {
  try {
    const stored = localStorage.getItem("notification_filter_presets");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Delete custom filter preset
 */
export function deleteFilterPreset(presetId: string): void {
  const presets = getCustomPresets();
  const filtered = presets.filter((p) => p.id !== presetId);
  localStorage.setItem("notification_filter_presets", JSON.stringify(filtered));
}

/**
 * Get all presets (built-in + custom)
 */
export function getAllPresets(): FilterPreset[] {
  return [...getFilterPresets(), ...getCustomPresets()];
}

/**
 * Apply preset filters
 */
export function applyPreset(presetId: string): NotificationFilters | null {
  const allPresets = getAllPresets();
  const preset = allPresets.find((p) => p.id === presetId);
  return preset ? preset.filters : null;
}
