import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Filter, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export interface NotificationFilters {
  searchTerm: string;
  readStatus: "all" | "read" | "unread";
  severity: "all" | "low" | "medium" | "high" | "critical";
  category: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  isPinned: "all" | "pinned" | "unpinned";
  isArchived: boolean;
}

interface NotificationFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: NotificationFilters) => void;
  onApply: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

const PRESET_RANGES = [
  { label: "Today", days: 0 },
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
];

const NOTIFICATION_CATEGORIES = [
  "booking_confirmation",
  "flight_reminder",
  "flight_update",
  "booking_update",
  "promotional_offer",
  "loyalty_update",
  "document_verification",
  "payment_confirmation",
  "system_alert",
  "general_message",
];

/**
 * Advanced notification filter component with date range, read status, severity, and category filters
 */
export function NotificationFilters({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  isLoading = false,
}: NotificationFiltersProps) {
  const { language, isRTL } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleReadStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      readStatus: value as "all" | "read" | "unread",
    });
  };

  const handleSeverityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      severity: value as "all" | "low" | "medium" | "high" | "critical",
    });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value });
  };

  const handlePinnedChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isPinned: value as "all" | "pinned" | "unpinned",
    });
  };

  const handlePresetRange = (days: number) => {
    const today = new Date();
    const from = days === 0 ? startOfDay(today) : subDays(today, days);
    const to = endOfDay(today);

    onFiltersChange({
      ...filters,
      dateFrom: from,
      dateTo: to,
    });
  };

  const handleCustomDateFrom = (value: string) => {
    if (!value) {
      onFiltersChange({ ...filters, dateFrom: null });
      return;
    }
    const date = new Date(value);
    onFiltersChange({ ...filters, dateFrom: startOfDay(date) });
  };

  const handleCustomDateTo = (value: string) => {
    if (!value) {
      onFiltersChange({ ...filters, dateTo: null });
      return;
    }
    const date = new Date(value);
    onFiltersChange({ ...filters, dateTo: endOfDay(date) });
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.readStatus !== "all" ||
    filters.severity !== "all" ||
    filters.category ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.isPinned !== "all";

  const dateFromStr = filters.dateFrom
    ? format(filters.dateFrom, "yyyy-MM-dd")
    : "";
  const dateToStr = filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : "";

  return (
    <div className={`space-y-4 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Quick Filters Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">
              {language === "en" ? "Filters" : "المرشحات"}
            </h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {language === "en" ? "Active" : "نشط"}
              </Badge>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary hover:text-primary/80"
          >
            {isExpanded
              ? language === "en"
                ? "Hide"
                : "إخفاء"
              : language === "en"
                ? "Show"
                : "عرض"}
          </button>
        </div>

        {/* Quick Search */}
        <div className="mb-4">
          <Input
            placeholder={
              language === "en"
                ? "Search notifications..."
                : "ابحث عن الإشعارات..."
            }
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filters.readStatus === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => handleReadStatusChange("unread")}
          >
            {language === "en" ? "Unread" : "غير مقروء"}
          </Button>
          <Button
            variant={filters.readStatus === "read" ? "default" : "outline"}
            size="sm"
            onClick={() => handleReadStatusChange("read")}
          >
            {language === "en" ? "Read" : "مقروء"}
          </Button>
          <Button
            variant={filters.isPinned === "pinned" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePinnedChange("pinned")}
          >
            {language === "en" ? "Pinned" : "مثبت"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReset()}
            className="ml-auto"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            {language === "en" ? "Reset" : "إعادة تعيين"}
          </Button>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border">
            {/* Read Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Read Status" : "حالة القراءة"}
              </label>
              <Select value={filters.readStatus} onValueChange={handleReadStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "en" ? "All" : "الكل"}
                  </SelectItem>
                  <SelectItem value="read">
                    {language === "en" ? "Read" : "مقروء"}
                  </SelectItem>
                  <SelectItem value="unread">
                    {language === "en" ? "Unread" : "غير مقروء"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Severity" : "الخطورة"}
              </label>
              <Select value={filters.severity} onValueChange={handleSeverityChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "en" ? "All" : "الكل"}
                  </SelectItem>
                  <SelectItem value="low">
                    {language === "en" ? "Low" : "منخفضة"}
                  </SelectItem>
                  <SelectItem value="medium">
                    {language === "en" ? "Medium" : "متوسطة"}
                  </SelectItem>
                  <SelectItem value="high">
                    {language === "en" ? "High" : "عالية"}
                  </SelectItem>
                  <SelectItem value="critical">
                    {language === "en" ? "Critical" : "حرجة"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Category" : "الفئة"}
              </label>
              <Select value={filters.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    {language === "en" ? "All Categories" : "جميع الفئات"}
                  </SelectItem>
                  {NOTIFICATION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pinned Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Pin Status" : "حالة التثبيت"}
              </label>
              <Select value={filters.isPinned} onValueChange={handlePinnedChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "en" ? "All" : "الكل"}
                  </SelectItem>
                  <SelectItem value="pinned">
                    {language === "en" ? "Pinned" : "مثبت"}
                  </SelectItem>
                  <SelectItem value="unpinned">
                    {language === "en" ? "Unpinned" : "غير مثبت"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Presets */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Date Range Presets" : "نطاقات التاريخ المسبقة"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_RANGES.map((preset) => (
                  <Button
                    key={preset.days}
                    variant={
                      filters.dateFrom &&
                      filters.dateTo &&
                      filters.dateFrom.getTime() ===
                        subDays(new Date(), preset.days).getTime()
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handlePresetRange(preset.days)}
                  >
                    {language === "en" ? preset.label : `آخر ${preset.days} يوم`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "From Date" : "من التاريخ"}
                </label>
                <Input
                  type="date"
                  value={dateFromStr}
                  onChange={(e) => handleCustomDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "To Date" : "إلى التاريخ"}
                </label>
                <Input
                  type="date"
                  value={dateToStr}
                  onChange={(e) => handleCustomDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Apply Button */}
            <Button
              onClick={onApply}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading
                ? language === "en"
                  ? "Applying..."
                  : "جاري التطبيق..."
                : language === "en"
                  ? "Apply Filters"
                  : "تطبيق المرشحات"}
            </Button>
          </div>
        )}
      </Card>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.searchTerm}
              <button
                onClick={() => handleSearchChange("")}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.readStatus !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.readStatus}
              <button
                onClick={() => handleReadStatusChange("all")}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.severity !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.severity}
              <button
                onClick={() => handleSeverityChange("all")}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.category}
              <button
                onClick={() => handleCategoryChange("")}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.isPinned !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.isPinned}
              <button
                onClick={() => handlePinnedChange("all")}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {format(filters.dateFrom, "MMM d")}
              <button
                onClick={() => onFiltersChange({ ...filters, dateFrom: null })}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {format(filters.dateTo, "MMM d")}
              <button
                onClick={() => onFiltersChange({ ...filters, dateTo: null })}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
