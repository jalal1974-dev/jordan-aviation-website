import { describe, it, expect } from "vitest";
import {
  applyFilters,
  sortNotifications,
  getFilterStats,
  getDateRangeLabel,
  type Notification,
  type SortBy,
} from "./notificationFilterLogic";
import type { NotificationFilters } from "@/components/NotificationFilters";

// Mock notifications for testing
const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "Booking Confirmed",
    message: "Your flight booking is confirmed",
    category: "booking_confirmation",
    severity: "low",
    isRead: true,
    isPinned: false,
    isArchived: false,
    createdAt: new Date("2026-05-01"),
  },
  {
    id: 2,
    title: "Flight Reminder",
    message: "Your flight departs in 24 hours",
    category: "flight_reminder",
    severity: "high",
    isRead: false,
    isPinned: true,
    isArchived: false,
    createdAt: new Date("2026-05-05"),
  },
  {
    id: 3,
    title: "Document Verification",
    message: "Your document has been verified",
    category: "document_verification",
    severity: "medium",
    isRead: false,
    isPinned: false,
    isArchived: false,
    createdAt: new Date("2026-05-03"),
  },
  {
    id: 4,
    title: "System Alert",
    message: "Critical system maintenance",
    category: "system_alert",
    severity: "critical",
    isRead: true,
    isPinned: false,
    isArchived: true,
    createdAt: new Date("2026-04-28"),
  },
  {
    id: 5,
    title: "Promotional Offer",
    message: "Special discount on flights",
    category: "promotional_offer",
    severity: "low",
    isRead: false,
    isPinned: false,
    isArchived: false,
    createdAt: new Date("2026-05-04"),
  },
];

describe("notificationFilterLogic", () => {
  describe("applyFilters", () => {
    it("should filter by search term", () => {
      const filters: NotificationFilters = {
        searchTerm: "booking",
        readStatus: "all",
        severity: "all",
        category: "",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      };

      const result = applyFilters(mockNotifications, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    it("should filter by read status", () => {
      const filters: NotificationFilters = {
        searchTerm: "",
        readStatus: "unread",
        severity: "all",
        category: "",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      };

      const result = applyFilters(mockNotifications, filters);
      expect(result.length).toBe(3); // IDs 2, 3, 5
      expect(result.every((n) => !n.isRead)).toBe(true);
    });

    it("should filter by severity", () => {
      const filters: NotificationFilters = {
        searchTerm: "",
        readStatus: "all",
        severity: "high",
        category: "",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      };

      const result = applyFilters(mockNotifications, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    it("should filter by category", () => {
      const filters: NotificationFilters = {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "booking_confirmation",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      };

      const result = applyFilters(mockNotifications, filters);
      expect(result.length).toBe(1);
      expect(result[0].category).toBe("booking_confirmation");
    });

    it("should filter by pinned status", () => {
      const filters: NotificationFilters = {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "",
        dateFrom: null,
        dateTo: null,
        isPinned: "pinned",
        isArchived: false,
      };

      const result = applyFilters(mockNotifications, filters);
      expect(result.length).toBe(1);
      expect(result[0].isPinned).toBe(true);
    });

    it("should filter by date range", () => {
      const filters: NotificationFilters = {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "",
        dateFrom: new Date("2026-05-02"),
        dateTo: new Date("2026-05-05"),
        isPinned: "all",
        isArchived: false,
      };

      const result = applyFilters(mockNotifications, filters);
      expect(result.length).toBe(3); // IDs 2, 3, 5
    });

    it("should exclude archived notifications", () => {
      const filters: NotificationFilters = {
        searchTerm: "",
        readStatus: "all",
        severity: "all",
        category: "",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      };

      const result = applyFilters(mockNotifications, filters);
      expect(result.every((n) => !n.isArchived)).toBe(true);
      expect(result.find((n) => n.id === 4)).toBeUndefined();
    });

    it("should apply multiple filters together", () => {
      const filters: NotificationFilters = {
        searchTerm: "",
        readStatus: "unread",
        severity: "all",
        category: "promotional_offer",
        dateFrom: null,
        dateTo: null,
        isPinned: "all",
        isArchived: false,
      };

      const result = applyFilters(mockNotifications, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(5);
    });
  });

  describe("sortNotifications", () => {
    it("should sort by newest first", () => {
      const result = sortNotifications(mockNotifications, "newest");
      expect(result[0].id).toBe(2); // 2026-05-05
      expect(result[result.length - 1].id).toBe(4); // 2026-04-28
    });

    it("should sort by oldest first", () => {
      const result = sortNotifications(mockNotifications, "oldest");
      expect(result[0].id).toBe(4); // 2026-04-28
      expect(result[result.length - 1].id).toBe(2); // 2026-05-05
    });

    it("should sort unread first", () => {
      const result = sortNotifications(mockNotifications, "unread_first");
      expect(result[0].isRead).toBe(false);
      expect(result[result.length - 1].isRead).toBe(true);
    });

    it("should sort pinned first", () => {
      const result = sortNotifications(mockNotifications, "pinned_first");
      expect(result[0].isPinned).toBe(true);
      expect(result[1].isPinned).toBe(false);
    });
  });

  describe("getFilterStats", () => {
    it("should calculate correct statistics", () => {
      const stats = getFilterStats(mockNotifications);

      expect(stats.total).toBe(5);
      expect(stats.unread).toBe(3);
      expect(stats.read).toBe(2);
      expect(stats.pinned).toBe(1);
      expect(stats.critical).toBe(1);
      expect(stats.high).toBe(1);
      expect(stats.medium).toBe(1);
      expect(stats.low).toBe(2);
    });

    it("should count by category", () => {
      const stats = getFilterStats(mockNotifications);

      expect(stats.byCategory["booking_confirmation"]).toBe(1);
      expect(stats.byCategory["flight_reminder"]).toBe(1);
      expect(stats.byCategory["document_verification"]).toBe(1);
      expect(stats.byCategory["promotional_offer"]).toBe(1);
      expect(stats.byCategory["system_alert"]).toBe(1);
    });
  });

  describe("getDateRangeLabel", () => {
    it("should return 'All time' when no dates provided", () => {
      const label = getDateRangeLabel(null, null, "en");
      expect(label).toBe("All time");
    });

    it("should return Arabic 'All time' when language is Arabic", () => {
      const label = getDateRangeLabel(null, null, "ar");
      expect(label).toBe("كل الوقت");
    });

    it("should return date range label", () => {
      const from = new Date("2026-05-01");
      const to = new Date("2026-05-05");
      const label = getDateRangeLabel(from, to, "en");
      expect(label).toContain("to");
    });

    it("should return 'From' label when only from date provided", () => {
      const from = new Date("2026-05-01");
      const label = getDateRangeLabel(from, null, "en");
      expect(label).toContain("From");
    });

    it("should return 'Until' label when only to date provided", () => {
      const to = new Date("2026-05-05");
      const label = getDateRangeLabel(null, to, "en");
      expect(label).toContain("Until");
    });
  });
});
