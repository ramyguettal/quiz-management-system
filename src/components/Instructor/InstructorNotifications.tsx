import { useState } from 'react';
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

interface InstructorNotificationsProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function InstructorNotifications({ onNavigate }: InstructorNotificationsProps) {
  const [filterType, setFilterType] = useState('all');
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'submission',
      title: 'New Quiz Submissions',
      message: '15 students completed "Database Normalization Quiz" in CS501',
      course: 'Advanced Database Systems',
      timestamp: '10 minutes ago',
      unread: true,
      actionable: true
    },
    {
      id: 2,
      type: 'deadline',
      title: 'Quiz Deadline Approaching',
      message: 'Web Development Midterm closes in 2 hours',
      course: 'Web Development Fundamentals',
      timestamp: '1 hour ago',
      unread: true,
      actionable: false
    },
    {
      id: 3,
      type: 'enrollment',
      title: 'New Course Enrollments',
      message: '5 new students enrolled in your course',
      course: 'Advanced Database Systems',
      timestamp: '3 hours ago',
      unread: true,
      actionable: false
    },
    {
      id: 4,
      type: 'submission',
      title: 'Pending Reviews',
      message: '8 short-answer submissions awaiting manual grading',
      course: 'Software Engineering',
      timestamp: '5 hours ago',
      unread: false,
      actionable: true
    },
    {
      id: 5,
      type: 'system',
      title: 'Quiz Published Successfully',
      message: 'Your quiz "NoSQL Databases" has been published',
      course: 'Advanced Database Systems',
      timestamp: '1 day ago',
      unread: false,
      actionable: false
    },
    {
      id: 6,
      type: 'deadline',
      title: 'Quiz Closed',
      message: 'Data Structures Quiz is now closed. 48/51 students submitted',
      course: 'Data Structures & Algorithms',
      timestamp: '1 day ago',
      unread: false,
      actionable: true
    },
    {
      id: 7,
      type: 'submission',
      title: 'High Performance Alert',
      message: 'Student Ahmed Ali scored 98% on recent quiz',
      course: 'Advanced Database Systems',
      timestamp: '2 days ago',
      unread: false,
      actionable: false
    },
    {
      id: 8,
      type: 'system',
      title: 'Course Material Updated',
      message: 'Quiz settings for CS301 have been updated',
      course: 'Data Structures & Algorithms',
      timestamp: '3 days ago',
      unread: false,
      actionable: false
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  const unreadCount = notifications.filter(n => n.unread).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return '📝';
      case 'deadline':
        return '⏰';
      case 'enrollment':
        return '👥';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'submission':
        return 'bg-blue-600';
      case 'deadline':
        return 'bg-orange-600';
      case 'enrollment':
        return 'bg-green-600';
      case 'system':
        return 'bg-purple-600';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-white text-3xl">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-600 text-white">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <p className="text-slate-400">Stay updated with course activities and submissions</p>
      </div>

      {/* Filter Bar */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Filter className="text-slate-500" size={18} />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 bg-slate-900/50 border-slate-600 text-white">
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
              <span className="text-slate-400 text-sm">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </span>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
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
                notification.unread
                  ? 'bg-blue-900/20 border-blue-600/50 hover:border-blue-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`${getNotificationColor(notification.type)} p-3 rounded-lg text-2xl shrink-0`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`${notification.unread ? 'text-white' : 'text-slate-300'}`}>
                            {notification.title}
                          </h3>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            {notification.course}
                          </Badge>
                          <span className="text-slate-500">{notification.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {notification.actionable && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    {notification.unread && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-red-400 hover:bg-slate-700"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-slate-800 border-slate-700 p-12">
            <div className="text-center">
              <Bell className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-white text-xl mb-2">No notifications found</h3>
              <p className="text-slate-400">
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
