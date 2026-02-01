import { useEffect, useState } from "react";
import { Send, Users, Trash2, CheckCheck, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { notificationsService } from "@/api/services/NotificationsServices";
import type { Notification } from "@/types/ApiTypes";

export function Notifications() {
  const [recipient, setRecipient] = useState('all-students');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notification sent successfully!");
    setSubject('');
    setMessage('');
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await notificationsService.getNotifications();
        setNotifications(response.items);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

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
    if (unreadCount === 0) {
      toast.error("No unread notifications");
      return;
    }

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


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipients</Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger id="recipient">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-students">All Students</SelectItem>
                  <SelectItem value="react-quiz">Students in React Quiz</SelectItem>
                  <SelectItem value="js-quiz">Students in JavaScript Quiz</SelectItem>
                  <SelectItem value="css-quiz">Students in CSS Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter notification subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 transition-all">
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CardTitle>Recent Notifications</CardTitle>
              {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
            </div>
            <div className="flex flex-wrap gap-2">
              {!selectionMode ? (
                <>
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
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
                      size="sm"
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
                    Delete ({selectedIds.length})
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
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification, index) => {
                const isSelected = selectedIds.includes(notification.id);
                
                return (
                  <div key={notification.id}>
                    <div 
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                        selectionMode 
                          ? `cursor-pointer ${isSelected ? 'bg-destructive/10 border border-destructive' : 'hover:bg-destructive/5'}`
                          : `${!notification.isRead ? 'bg-primary/5 border border-primary/30' : ''}`
                      }`}
                      onClick={() => selectionMode && toggleSelection(notification.id)}
                    >
                      {selectionMode && (
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(notification.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">{notification.title}</p>
                              {!notification.isRead && (
                                <Badge variant="default" className="text-xs">Unread</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-400">{notification.body}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{notification.type}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatTimestamp(notification.createdAt)}
                            </span>
                            {!selectionMode && !notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs h-7"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator className="mt-4" />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
