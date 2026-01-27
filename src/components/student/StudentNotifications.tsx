import { useEffect, useState } from "react";
import { Bell, CheckCheck, Clock, FileText, Trophy } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion } from "motion/react";
import { toast } from "sonner";
import { notificationsService } from "../../api/services/NotificationsServices";
import type { Notification, NotificationsResponse } from "../../types/ApiTypes";

export function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res: NotificationsResponse = await notificationsService.getNotifications();
      setNotifications(res.items);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else {
        toast.error("Failed to load notifications.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error("Failed to mark as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'Quiz': return FileText;
      case 'Result': return Trophy;
      case 'Reminder': return Clock;
      default: return Bell;
    }
  };

  const getIconColor = (type?: string) => {
    switch (type) {
      case 'Quiz': return 'bg-primary/10 text-primary';
      case 'Result': return 'bg-green-100 text-green-600';
      case 'Reminder': return 'bg-orange-100 text-orange-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1>Notifications</h1>
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount} new</Badge>}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="hover:bg-primary/5 hover:border-primary transition-all"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mb-4">Stay updated with your quizzes and results</p>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notification, index) => {
            const Icon = getIcon(notification.type);
            const iconColor = getIconColor(notification.type);

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:border-primary ${
                    !notification.isRead
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border hover:shadow-md'
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <CardContent className="p-4 flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <h4 className="truncate">{notification.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {notifications.length === 0 && !loading && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2">No notifications</h3>
                <p className="text-muted-foreground text-center">
                  You're all caught up! Check back later for updates.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
