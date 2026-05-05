import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import type { NotificationGroup as NotificationGroupType } from "@/lib/notificationGrouping";
import { NOTIFICATION_TYPES } from "@/lib/notificationGrouping";

interface NotificationGroupProps {
  group: NotificationGroupType;
  onToggle: (groupId: string) => void;
  onNotificationAction?: (notificationId: number, action: string) => void;
}

/**
 * Collapsible notification group component
 */
export function NotificationGroup({
  group,
  onToggle,
  onNotificationAction,
}: NotificationGroupProps) {
  const { language, isRTL } = useLanguage();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const groupTitle =
    language === "en" ? group.title : group.titleAr || group.title;
  const typeConfig = NOTIFICATION_TYPES[group.id as keyof typeof NOTIFICATION_TYPES];

  return (
    <Card className="mb-4 overflow-hidden border-l-4" style={{
      borderLeftColor: typeConfig?.color.replace("text-", "#") || "#gray",
    }}>
      {/* Group Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-transparent hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={() => onToggle(group.id)}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              typeConfig?.bgColor || "bg-gray-50"
            }`}
          >
            <span
              className={`text-lg ${typeConfig?.color || "text-gray-600"}`}
            >
              {group.icon === "CheckCircle" && "✓"}
              {group.icon === "RefreshCw" && "↻"}
              {group.icon === "Clock" && "🕐"}
              {group.icon === "Plane" && "✈"}
              {group.icon === "CreditCard" && "💳"}
              {group.icon === "AlertCircle" && "⚠"}
              {group.icon === "Gift" && "🎁"}
              {group.icon === "Star" && "⭐"}
              {group.icon === "FileCheck" && "📄"}
              {group.icon === "AlertTriangle" && "⚠"}
              {group.icon === "MessageSquare" && "💬"}
            </span>
          </div>

          {/* Title and Count */}
          <div>
            <h3 className="font-semibold text-foreground">{groupTitle}</h3>
            <p className="text-xs text-muted-foreground">
              {group.count} notification{group.count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {group.count}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(group.id);
            }}
          >
            {group.isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Group Content */}
      {group.isExpanded && (
        <div className="divide-y divide-border">
          {group.notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 hover:bg-accent/5 transition-colors"
              onMouseEnter={() => setHoveredId(notification.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Notification Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4
                    className={`font-medium text-foreground ${
                      !notification.isRead ? "font-semibold" : ""
                    }`}
                  >
                    {language === "en"
                      ? notification.title
                      : notification.titleAr || notification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString(
                      language === "en" ? "en-US" : "ar-SA"
                    )}
                  </p>
                </div>

                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-accent ml-2 mt-1 flex-shrink-0" />
                )}
              </div>

              {/* Notification Message */}
              <p className="text-sm text-foreground/80 mb-3">
                {language === "en"
                  ? notification.message
                  : notification.messageAr || notification.message}
              </p>

              {/* Severity Badge */}
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant={
                    notification.severity === "critical"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {notification.severity}
                </Badge>

                {/* Category Badge */}
                {notification.category && (
                  <Badge variant="outline" className="text-xs">
                    {notification.category}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              {hoveredId === notification.id && (
                <div className="flex gap-2 mt-3">
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        onNotificationAction?.(notification.id, "read")
                      }
                    >
                      Mark as Read
                    </Button>
                  )}

                  {notification.isPinned ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        onNotificationAction?.(notification.id, "unpin")
                      }
                    >
                      Unpin
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        onNotificationAction?.(notification.id, "pin")
                      }
                    >
                      Pin
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-destructive"
                    onClick={() =>
                      onNotificationAction?.(notification.id, "delete")
                    }
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/**
 * Multiple notification groups component
 */
interface NotificationGroupsProps {
  groups: Record<string, NotificationGroupType>;
  onToggleGroup: (groupId: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onNotificationAction?: (notificationId: number, action: string) => void;
}

export function NotificationGroups({
  groups,
  onToggleGroup,
  onExpandAll,
  onCollapseAll,
  onNotificationAction,
}: NotificationGroupsProps) {
  const { language } = useLanguage();
  const groupEntries = Object.entries(groups);

  if (groupEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {language === "en" ? "No notifications" : "لا توجد إشعارات"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Expand/Collapse All Controls */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onExpandAll}
          className="text-xs"
        >
          {language === "en" ? "Expand All" : "توسيع الكل"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCollapseAll}
          className="text-xs"
        >
          {language === "en" ? "Collapse All" : "طي الكل"}
        </Button>
      </div>

      {/* Notification Groups */}
      <div>
        {groupEntries.map(([groupId, group]) => (
          <NotificationGroup
            key={groupId}
            group={group}
            onToggle={onToggleGroup}
            onNotificationAction={onNotificationAction}
          />
        ))}
      </div>
    </div>
  );
}
