import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Archive,
  Trash2,
  Check,
  Pin,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  BookOpen,
  Plane,
  Gift,
  CreditCard,
  User,
  Zap,
} from "lucide-react";
import { NotificationGroups } from "@/components/NotificationGroup";
import {
  groupNotificationsByType,
  expandAllGroups,
  collapseAllGroups,
  toggleGroupExpansion,
  type GroupedNotifications,
} from "@/lib/notificationGrouping";
import { NotificationFilters as NotificationFiltersComponent } from "@/components/NotificationFilters";
import { applyFilters, sortNotifications, getFilterStats, exportToJSON, exportToCSV } from "@/lib/notificationFilterLogic";
import type { NotificationFilters as FilterType } from "@/components/NotificationFilters";

const NOTIFICATION_TYPES = {
  booking_confirmation: { label: "Booking Confirmation", icon: BookOpen },
  flight_reminder: { label: "Flight Reminder", icon: Plane },
  flight_update: { label: "Flight Update", icon: Plane },
  booking_update: { label: "Booking Update", icon: BookOpen },
  promotional_offer: { label: "Promotional Offer", icon: Gift },
  loyalty_update: { label: "Loyalty Update", icon: Gift },
  document_verification: { label: "Document Verification", icon: CheckCircle },
  payment_confirmation: { label: "Payment Confirmation", icon: CreditCard },
  system_alert: { label: "System Alert", icon: AlertCircle },
  general_message: { label: "General Message", icon: Info },
};

const SEVERITY_COLORS = {
  low: "bg-blue-100 text-blue-800 border-blue-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

const SEVERITY_ICONS = {
  low: Info,
  medium: AlertTriangle,
  high: AlertCircle,
  critical: AlertTriangle,
};

export default function NotificationCenter() {
  const { user } = useAuth();
  const { language, t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterSeverity, setFilterSeverity] = useState<string>("");
  const [filterRead, setFilterRead] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [groupedNotifications, setGroupedNotifications] = useState<GroupedNotifications>({});
  const [filters, setFilters] = useState<FilterType>({
    searchTerm: "",
    readStatus: "all",
    severity: "all",
    category: "",
    dateFrom: null,
    dateTo: null,
    isPinned: "all",
    isArchived: false,
  });
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "unread_first" | "pinned_first">("newest");
  const pageSize = 50; // Increased for grouping

  // Queries
  const notificationsQuery = trpc.notification.getNotifications.useQuery({
    limit: pageSize,
    offset: currentPage * pageSize,
    isRead: filterRead === "" ? undefined : filterRead === "read",
    isArchived: false,
    category: filterCategory || undefined,
    severity: filterSeverity || undefined,
  });

  const unreadCountQuery = trpc.notification.getUnreadCount.useQuery();
  const statsQuery = trpc.notification.getStats.useQuery();

  // Mutations
  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
      unreadCountQuery.refetch();
      statsQuery.refetch();
    },
  });

  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
      unreadCountQuery.refetch();
      statsQuery.refetch();
    },
  });

  const archiveMutation = trpc.notification.archive.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
      statsQuery.refetch();
    },
  });

  const deleteMutation = trpc.notification.delete.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
      statsQuery.refetch();
    },
  });

  const pinMutation = trpc.notification.pin.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
    },
  });

  const unpinMutation = trpc.notification.unpin.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
    },
  });

  const notifications = notificationsQuery.data?.data || [];
  const unreadCount = unreadCountQuery.data?.count || 0;
  const stats = statsQuery.data?.data;

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate({ notificationId });
  };

  const handleArchive = (notificationId: number) => {
    archiveMutation.mutate({ notificationId });
  };

  const handleDelete = (notificationId: number) => {
    deleteMutation.mutate({ notificationId });
  };

  const handlePin = (notificationId: number) => {
    pinMutation.mutate({ notificationId });
  };

  const handleUnpin = (notificationId: number) => {
    unpinMutation.mutate({ notificationId });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const filteredNotifications = notifications.filter((notif: any) =>
    notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notif.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-primary">
                {language === "en" ? "Notification Center" : "مركز الإشعارات"}
              </h1>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                {unreadCount} {language === "en" ? "Unread" : "غير مقروءة"}
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                {language === "en" ? "Mark All as Read" : "وضع علامة على الكل كمقروء"}
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mb-8">
          <NotificationFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onApply={() => setCurrentPage(0)}
            onReset={() => {
              setFilters({
                searchTerm: "",
                readStatus: "all",
                severity: "all",
                category: "",
                dateFrom: null,
                dateTo: null,
                isPinned: "all",
                isArchived: false,
              });
              setCurrentPage(0);
            }}
            isLoading={notificationsQuery.isLoading}
          />
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">
                {language === "en" ? "Total" : "الإجمالي"}
              </div>
              <div className="text-3xl font-bold text-primary">
                {stats.totalCount}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">
                {language === "en" ? "Unread" : "غير مقروءة"}
              </div>
              <div className="text-3xl font-bold text-red-500">
                {stats.unreadCount}
              </div>
            </Card>
            {Object.entries(stats.bySeverity).map(([severity, count]: any) => (
              <Card key={severity} className="p-4">
                <div className="text-sm text-muted-foreground mb-1 capitalize">
                  {language === "en" ? severity : severity}
                </div>
                <div className="text-3xl font-bold text-primary">{count}</div>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === "en" ? "Search" : "بحث"}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={language === "en" ? "Search notifications..." : "ابحث عن الإشعارات..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === "en" ? "Category" : "الفئة"}
              </label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={language === "en" ? "All Categories" : "جميع الفئات"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "en" ? "All Categories" : "جميع الفئات"}
                  </SelectItem>
                  <SelectItem value="booking">
                    {language === "en" ? "Booking" : "الحجز"}
                  </SelectItem>
                  <SelectItem value="flight">
                    {language === "en" ? "Flight" : "الرحلة"}
                  </SelectItem>
                  <SelectItem value="loyalty">
                    {language === "en" ? "Loyalty" : "الولاء"}
                  </SelectItem>
                  <SelectItem value="payment">
                    {language === "en" ? "Payment" : "الدفع"}
                  </SelectItem>
                  <SelectItem value="account">
                    {language === "en" ? "Account" : "الحساب"}
                  </SelectItem>
                  <SelectItem value="promotion">
                    {language === "en" ? "Promotion" : "العرض الترويجي"}
                  </SelectItem>
                  <SelectItem value="system">
                    {language === "en" ? "System" : "النظام"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === "en" ? "Severity" : "الخطورة"}
              </label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={language === "en" ? "All Levels" : "جميع المستويات"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "en" ? "All Severities" : "جميع مستويات الخطورة"}
                  </SelectItem>
                  <SelectItem value="low">
                    {language === "en" ? "Low" : "منخفض"}
                  </SelectItem>
                  <SelectItem value="medium">
                    {language === "en" ? "Medium" : "متوسط"}
                  </SelectItem>
                  <SelectItem value="high">
                    {language === "en" ? "High" : "عالي"}
                  </SelectItem>
                  <SelectItem value="critical">
                    {language === "en" ? "Critical" : "حرج"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Read Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === "en" ? "Status" : "الحالة"}
              </label>
              <Select value={filterRead} onValueChange={setFilterRead}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={language === "en" ? "All Notifications" : "جميع الإشعارات"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "en" ? "All Statuses" : "جميع الحالات"}
                  </SelectItem>
                  <SelectItem value="unread">
                    {language === "en" ? "Unread" : "غير مقروءة"}
                  </SelectItem>
                  <SelectItem value="read">
                    {language === "en" ? "Read" : "مقروءة"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {notificationsQuery.isLoading ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                {language === "en" ? "Loading notifications..." : "جاري تحميل الإشعارات..."}
              </div>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <div className="text-muted-foreground">
                {language === "en"
                  ? "No notifications found"
                  : "لم يتم العثور على إشعارات"}
              </div>
            </Card>
          ) : (
            filteredNotifications.map((notification: any) => {
              const SeverityIcon = SEVERITY_ICONS[notification.severity as keyof typeof SEVERITY_ICONS];
              const title = language === "en" ? notification.title : notification.titleAr;
              const message = language === "en" ? notification.message : notification.messageAr;

              return (
                <Card
                  key={notification.id}
                  className={`p-4 border-l-4 transition-all ${
                    notification.isRead
                      ? "border-l-gray-300 opacity-75"
                      : "border-l-primary bg-primary/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <SeverityIcon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        <Badge
                          className={`${SEVERITY_COLORS[notification.severity as keyof typeof SEVERITY_COLORS]}`}
                        >
                          {notification.severity}
                        </Badge>
                        {!notification.isRead && (
                          <Badge className="bg-red-500 text-white">
                            {language === "en" ? "New" : "جديد"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {message}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString(
                          language === "en" ? "en-US" : "ar-EG"
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title={language === "en" ? "Mark as read" : "وضع علامة كمقروء"}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          notification.isPinned
                            ? handleUnpin(notification.id)
                            : handlePin(notification.id)
                        }
                        title={
                          notification.isPinned
                            ? language === "en"
                              ? "Unpin"
                              : "إزالة التثبيت"
                            : language === "en"
                            ? "Pin"
                            : "تثبيت"
                        }
                      >
                        <Pin
                          className={`w-4 h-4 ${
                            notification.isPinned ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArchive(notification.id)}
                        title={language === "en" ? "Archive" : "أرشفة"}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(notification.id)}
                        title={language === "en" ? "Delete" : "حذف"}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {filteredNotifications.length > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              {language === "en" ? "Previous" : "السابق"}
            </Button>
            <div className="flex items-center gap-2 px-4">
              {language === "en"
                ? `Page ${currentPage + 1}`
                : `الصفحة ${currentPage + 1}`}
            </div>
            <Button
              variant="outline"
              disabled={filteredNotifications.length < pageSize}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              {language === "en" ? "Next" : "التالي"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
