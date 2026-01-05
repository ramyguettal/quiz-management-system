import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { notificationsService } from '@/api/services/NotificationsServices';
import type { Notification } from '@/types/ApiTypes';

interface InstructorNotificationsProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function InstructorNotifications({ onNavigate }: InstructorNotificationsProps) {
  const [filterType, setFilterType] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await notificationsService.getNotifications();
        setNotifications(response.items);
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error);
        setError(error?.message || 'Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsService.deleteNotifications([id]);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(n => n.type.toLowerCase() === filterType.toLowerCase());

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'submission':
        return '📝';
      case 'deadline':
        return '⏰';
      case 'enrollment':
      case 'familyinvitation':
        return '👥';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'submission':
        return 'bg-blue-600';
      case 'deadline':
        return 'bg-orange-600';
      case 'enrollment':
      case 'familyinvitation':
        return 'bg-green-600';
      case 'system':
        return 'bg-purple-600';
      default:
        return 'bg-slate-600';
    }
  };

  const formatTimestamp = (utcDate: string): string => {
    const date = new Date(utcDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="text-slate-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-900 min-h-screen max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h1 className="text-white text-2xl md:text-3xl lg:text-4xl">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-600 text-white text-xs sm:text-sm">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <p className="text-slate-400 text-sm md:text-base">Stay updated with course activities and submissions</p>
      </div>

      {/* Filter Bar */}
      <Card className="bg-slate-800 border-slate-700 mb-4 md:mb-6">
        <CardContent className="p-3 md:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4 flex-1">
              <Filter className="text-slate-500 shrink-0" size={18} />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48 md:w-56 lg:w-64 bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="submission">Submissions</SelectItem>
                  <SelectItem value="deadline">Deadlines</SelectItem>
                  <SelectItem value="enrollment">Enrollments</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-slate-400 text-xs sm:text-sm md:text-base whitespace-nowrap">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </span>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white w-full sm:w-auto text-sm md:text-base px-4 md:px-6"
              >
                <CheckCheck size={16} className="mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border transition-all cursor-pointer ${
                !notification.isRead
                  ? 'bg-blue-900/20 border-blue-600/50 hover:border-blue-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Icon */}
                  <div className={`${getNotificationColor(notification.type)} p-3 rounded-lg text-2xl shrink-0`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`${!notification.isRead ? 'text-white' : 'text-slate-300'} text-base md:text-lg font-semibold`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-400 text-sm md:text-base mb-2">{notification.body}</p>
                        <div className="flex items-center gap-3 text-xs md:text-sm flex-wrap">
                          <Badge variant="outline" className="border-slate-600 text-slate-400 px-2 py-1">
                            {notification.type}
                          </Badge>
                          <span className="text-slate-500">{formatTimestamp(notification.createdUtc)}</span>
                        </div>
                      </div>

                      {/* Action Buttons - Desktop */}
                      <div className="hidden sm:flex gap-2 shrink-0">
                        {!notification.isRead && (
                          <Button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 w-8 p-0"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </Button>
                        )}
                        <Button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-400 hover:bg-slate-700 h-8 w-8 p-0"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {/* Action Buttons - Mobile */}
                      <div className="flex sm:hidden gap-2 w-full">
                        {!notification.isRead && (
                          <Button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-700 flex-1"
                            title="Mark as read"
                          >
                            <Check size={16} className="mr-2" />
                            Mark Read
                          </Button>
                        )}
                        <Button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-400 hover:bg-slate-700 flex-1"
                          title="Delete"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-slate-800 border-slate-700 p-8 md:p-12 lg:p-16">
            <div className="text-center">
              <Bell className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-white text-xl md:text-2xl mb-2">No notifications found</h3>
              <p className="text-slate-400 md:text-lg">
                {filterType === 'all'
                  ? "You're all caught up!"
                  : 'Try selecting a different filter'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
