import { useEffect, useState } from "react";
import { Bell, CheckCheck, Clock, FileText, Trophy, Trash2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion } from "motion/react";
import { toast } from "sonner";
import { notificationsService } from "../../api/services/NotificationsServices";
import type { Notification, NotificationsResponse } from "../../types/ApiTypes";
import { Checkbox } from "../ui/checkbox";

export function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

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
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to mark as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("No notifications selected");
      return;
    }

    try {
      await notificationsService.deleteNotifications(selectedIds);
      setNotifications(notifications.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      setSelectionMode(false);
      toast.success(`${selectedIds.length} notification${selectedIds.length > 1 ? 's' : ''} deleted`);
    } catch {
      toast.error("Failed to delete notifications.");
    }
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) {
      toast.error("No notifications to delete");
      return;
    }

    try {
      await notificationsService.deleteAllNotifications();
      setNotifications([]);
      setSelectedIds([]);
      setSelectionMode(false);
      toast.success("All notifications deleted");
    } catch {
      toast.error("Failed to delete all notifications.");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
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
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1>Notifications</h1>
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount} new</Badge>}
          </div>
          <div className="flex flex-wrap gap-2">
            {!selectionMode ? (
              <>
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
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectionMode(true)}
                    className="hover:bg-destructive/5 hover:border-destructive transition-all"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                >
                  {selectedIds.length === notifications.length ? "Deselect All" : "Select All"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedIds.length})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAll}
                >
                  Delete All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedIds([]);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mb-4">Stay updated with your quizzes and results</p>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notification, index) => {
            const Icon = getIcon(notification.type);
            const iconColor = getIconColor(notification.type);
            const isSelected = selectedIds.includes(notification.id);

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`transition-all ${
                    selectionMode 
                      ? `cursor-pointer ${isSelected ? 'border-destructive bg-destructive/5' : 'hover:border-destructive/50'}`
                      : `cursor-pointer hover:border-primary ${
                          !notification.isRead
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-border hover:shadow-md'
                        }`
                  }`}
                  onClick={() => selectionMode ? toggleSelection(notification.id) : handleMarkAsRead(notification.id)}
                >
                  <CardContent className="p-4 flex gap-4">
                    {selectionMode && (
                      <div className="flex items-center">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(notification.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <h4 className="truncate">{notification.title}</h4>
                        <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
                      {!notification.isRead && !selectionMode && (
                        <Badge variant="default" className="mt-2 text-xs">Unread</Badge>
                      )}
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
