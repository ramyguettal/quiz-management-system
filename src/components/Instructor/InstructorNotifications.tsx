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
                notification.unread
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
                          <h3 className={`${notification.unread ? 'text-white' : 'text-slate-300'} text-base md:text-lg font-semibold`}>
                            {notification.title}
                          </h3>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-400 text-sm md:text-base mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3 text-xs md:text-sm flex-wrap">
                          <Badge variant="outline" className="border-slate-600 text-slate-400 px-2 py-1">
                            {notification.course}
                          </Badge>
                          <span className="text-slate-500">{notification.timestamp}</span>
                        </div>
                      </div>

                      {/* Action Buttons - Desktop */}
                      <div className="hidden sm:flex gap-2 shrink-0">
                        {notification.unread && (
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
                      {notification.actionable && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View Details
                        </Button>
                      )}
                      
                      {/* Action Buttons - Mobile */}
                      <div className="flex sm:hidden gap-2 w-full">
                        {notification.unread && (
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
