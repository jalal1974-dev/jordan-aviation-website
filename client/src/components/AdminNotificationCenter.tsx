import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface AdminNotificationCenterProps {
  notifications: AdminNotification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (notificationId: string) => void;
  onActionClick?: (notification: AdminNotification) => void;
}

export function AdminNotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onActionClick,
}: AdminNotificationCenterProps) {
  const { language, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return language === 'en' ? 'Just now' : 'للتو';
    if (minutes < 60) return `${minutes}m ${language === 'en' ? 'ago' : 'مضت'}`;
    if (hours < 24) return `${hours}h ${language === 'en' ? 'ago' : 'مضت'}`;
    if (days < 7) return `${days}d ${language === 'en' ? 'ago' : 'مضت'}`;

    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={`relative ${isRTL ? 'ml-4' : 'mr-4'}`}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          className={`absolute ${isRTL ? 'right-0' : 'left-0'} mt-2 w-96 bg-white border border-border rounded-lg shadow-lg z-50`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-lg">
              {language === 'en' ? 'Notifications' : 'الإخطارات'}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="text-xs"
                >
                  {language === 'en' ? 'Mark all read' : 'تحديد الكل كمقروء'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {language === 'en' ? 'No notifications' : 'لا توجد إخطارات'}
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-border hover:bg-muted/50 transition cursor-pointer ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      onMarkAsRead(notification.id);
                    }
                    if (notification.actionUrl && onActionClick) {
                      onActionClick(notification);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(notification.severity)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityBadgeVariant(notification.severity)}>
                            {notification.severity}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismiss(notification.id);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border text-center">
              <Button variant="outline" size="sm" className="w-full text-xs">
                {language === 'en' ? 'View all notifications' : 'عرض جميع الإخطارات'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Notification Toast Component for immediate alerts
 */
interface NotificationToastProps {
  notification: AdminNotification;
  onDismiss: () => void;
  autoClose?: number;
}

export function NotificationToast({
  notification,
  onDismiss,
  autoClose = 5000,
}: NotificationToastProps) {
  const { language } = useLanguage();

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onDismiss, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }[notification.severity];

  const textColor = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900',
  }[notification.severity];

  return (
    <Card className={`${bgColor} border ${textColor} p-4 mb-4 flex items-start justify-between gap-4`}>
      <div className="flex items-start gap-3">
        {getSeverityIcon(notification.severity)}
        <div>
          <p className="font-semibold text-sm">{notification.title}</p>
          <p className="text-sm mt-1">{notification.message}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDismiss}
        className="h-6 w-6 p-0 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </Card>
  );
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
}
