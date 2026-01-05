import { useState } from "react";
import { Bell, CheckCheck, Clock, FileText, Trophy } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion } from "motion/react";

interface Notification {
  id: number;
  title: string;
  message: string;
  sender: string;
  timestamp: string;
  type: 'quiz' | 'result' | 'reminder';
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'New Quiz Available',
    message: 'Introduction to React quiz is now available. Deadline: Oct 30, 2025',
    sender: 'Jane Smith',
    timestamp: '2 hours ago',
    type: 'quiz',
    isRead: false
  },
  {
    id: 2,
    title: 'Quiz Results Published',
    message: 'Your results for "Web Security Basics" have been published. Score: 92%',
    sender: 'Charlie Brown',
    timestamp: '5 hours ago',
    type: 'result',
    isRead: false
  },
  {
    id: 3,
    title: 'Deadline Reminder',
    message: 'Database Design quiz deadline is approaching in 2 days',
    sender: 'System',
    timestamp: '1 day ago',
    type: 'reminder',
    isRead: false
  },
  {
    id: 4,
    title: 'Quiz Completed',
    message: 'You successfully completed "Advanced JavaScript" quiz',
    sender: 'System',
    timestamp: '2 days ago',
    type: 'result',
    isRead: true
  },
  {
    id: 5,
    title: 'New Quiz Assigned',
    message: 'Your instructor has assigned a new quiz on CSS Fundamentals',
    sender: 'Jane Smith',
    timestamp: '3 days ago',
    type: 'quiz',
    isRead: true
  },
];

export function StudentNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return FileText;
      case 'result':
        return Trophy;
      case 'reminder':
        return Clock;
      default:
        return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'bg-primary/10 text-primary';
      case 'result':
        return 'bg-green-100 text-green-600';
      case 'reminder':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          {/* Make header stack on very small screens but keep row on sm+ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 sm:gap-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1>Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} new</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="hover:bg-primary/5 hover:border-primary transition-all"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">Stay updated with your quizzes and results</p>
        </div>

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
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    {/* Stack vertically on mobile, row on sm+ */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h4 className="flex items-center gap-2 min-w-0">
                            {/* Truncate long titles to prevent overflow on small screens */}
                            <span className="truncate">{notification.title}</span>
                            {!notification.isRead && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </h4>
                          {/* Allow timestamp to wrap on very small screens, but keep nowrap on sm+ */}
                          <span className="text-sm text-muted-foreground whitespace-normal sm:whitespace-nowrap">
                            {notification.timestamp}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 break-words">
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-muted-foreground">
                          From: {notification.sender}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {notifications.length === 0 && (
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
  );
}
