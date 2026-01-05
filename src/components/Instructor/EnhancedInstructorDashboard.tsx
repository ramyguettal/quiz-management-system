import { BookOpen, FileText, Clock, Bell, Plus, Eye, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { dashboardService } from '@/api/services/DashboardServices';
import { quizService } from '@/api/services/QuizzServices';
import { notificationsService } from '@/api/services/NotificationsServices';
import { useEffect, useState } from 'react';
import type { CourseListItem, Notification } from '@/types/ApiTypes';

interface EnhancedInstructorDashboardProps {
  instructorName: string;
  instructorId: string;
  onNavigate: (page: string, data?: any) => void;
}

export default function EnhancedInstructorDashboard({
  instructorName,
  onNavigate
}: EnhancedInstructorDashboardProps) {
  const [instructorCourses, setInstructorCourses] = useState<CourseListItem[]>([]);
  const [instructoroverview, setInstructoroverview] = useState<any>(null);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchstats = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardService.getInstructorStats();
        setInstructoroverview(data);
        setInstructorCourses(data.courseResponses);
      } catch (error) {
        console.error('Failed to fetch instructor courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await notificationsService.getNotifications();
        // Filter to show only unread notifications and limit to 3
        const unreadNotifications = response.items.filter(n => !n.isRead).slice(0, 3);
        setRecentNotifications(unreadNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchstats();
    fetchNotifications();
      
  }, []);
  const stats = [
    {
      title: 'Total Courses',
      value: instructoroverview?.totalCourses || 0,
      icon: BookOpen,
      color: 'bg-blue-600',
      description: ''
    },
    {
      title: 'Active Quizzes',
      value: instructoroverview?.publishedQuizzes || 0,
      icon: FileText,
      color: 'bg-purple-600',
      description: ''
    },
    {
      title: 'Draft Quizzes',
      value: instructoroverview?.draftQuizzes || 0,
      icon: Clock,
      color: 'bg-orange-600',
      description: 'Awaiting review'
    },
    {
      title: 'Total Students',
      value: instructoroverview?.totalStudents || 0,
      icon: Users,
      color: 'bg-green-600',
      description: 'Across all courses'
    }
  ];

  const courses = instructorCourses;

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
      <div className="p-6 space-y-6 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl mb-2">Welcome back, {instructorName} 👋</h1>
        <p className="text-blue-100">
          Here's what's happening with your courses today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-white text-3xl mb-1">{stat.value}</p>
                  <p className="text-slate-500 text-xs">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses Table */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">My Courses</CardTitle>
                <CardDescription className="text-slate-400">
                  Quick overview of your active courses
                </CardDescription>
              </div>
              <Button
                onClick={() => onNavigate('courses')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-400">Course</TableHead>
                    <TableHead className="text-slate-400">Students</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white">
                        <div>
                          <p>{course.title}</p>
                          <p className="text-xs text-slate-500">Year {course.academicYearNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{course.studentCount || 0}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-600 text-white">Active</Badge>
                      </TableCell>

                      <TableCell>
                        <Button
                          onClick={() => onNavigate('course-detail', { courseId: course.id, course })}
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => onNavigate('create-quiz')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
              >
                <Plus size={18} className="mr-2" />
                Create New Quiz
              </Button>
              <Button
                onClick={() => onNavigate('courses')}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white justify-start"
              >
                <BookOpen size={18} className="mr-2" />
                View All Courses
              </Button>
              <Button
                onClick={() => onNavigate('analytics')}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white justify-start"
              >
                <BarChart3 size={18} className="mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Notifications</CardTitle>
                <CardDescription className="text-slate-400">Latest updates</CardDescription>
              </div>
              <Button
                onClick={() => onNavigate('notifications')}
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentNotifications.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm">No unread notifications</p>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 rounded-lg border transition-colors cursor-pointer bg-blue-900/20 border-blue-600/50"
                  >
                    <div className="flex items-start gap-3">
                      <Bell size={16} className="text-blue-400" />
                      <div className="flex-1">
                        <p className="text-sm mb-1 text-white">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-400 mb-1">{notification.body}</p>
                        <p className="text-xs text-slate-500">{formatTimestamp(notification.createdUtc)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
