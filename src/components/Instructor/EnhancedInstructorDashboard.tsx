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

interface EnhancedInstructorDashboardProps {
  instructorName?: string;
  onNavigate: (page: string, data?: any) => void;
}

export default function EnhancedInstructorDashboard({
  instructorName = "Dr. Fatima",
  onNavigate
}: EnhancedInstructorDashboardProps) {
  const stats = [
    {
      title: 'Total Courses',
      value: '8',
      icon: BookOpen,
      color: 'bg-blue-600',
      description: '3 active this semester'
    },
    {
      title: 'Active Quizzes',
      value: '24',
      icon: FileText,
      color: 'bg-purple-600',
      description: '12 published, 12 draft'
    },
    {
      title: 'Pending Submissions',
      value: '47',
      icon: Clock,
      color: 'bg-orange-600',
      description: 'Awaiting review'
    },
    {
      title: 'Total Students',
      value: '186',
      icon: Users,
      color: 'bg-green-600',
      description: 'Across all courses'
    }
  ];

  const courses = [
    {
      id: 1,
      name: 'Advanced Database Systems',
      code: 'CS501',
      enrolledStudents: 42,
      quizzes: 6,
      activeQuiz: true
    },
    {
      id: 2,
      name: 'Web Development Fundamentals',
      code: 'CS201',
      enrolledStudents: 58,
      quizzes: 8,
      activeQuiz: true
    },
    {
      id: 3,
      name: 'Data Structures & Algorithms',
      code: 'CS301',
      enrolledStudents: 51,
      quizzes: 7,
      activeQuiz: false
    },
    {
      id: 4,
      name: 'Software Engineering',
      code: 'CS401',
      enrolledStudents: 35,
      quizzes: 5,
      activeQuiz: true
    }
  ];

  const recentNotifications = [
    {
      id: 1,
      title: 'New quiz submission',
      message: '12 students completed "Midterm Database Quiz"',
      time: '15 mins ago',
      unread: true
    },
    {
      id: 2,
      title: 'Submission deadline approaching',
      message: 'Web Development Quiz closes in 2 hours',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      title: 'Course enrollment',
      message: '3 new students enrolled in CS501',
      time: '3 hours ago',
      unread: false
    }
  ];

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
                    <TableHead className="text-slate-400">Quizzes</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white">
                        <div>
                          <p>{course.name}</p>
                          <p className="text-xs text-slate-500">{course.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{course.enrolledStudents}</TableCell>
                      <TableCell className="text-slate-300">{course.quizzes}</TableCell>
                      <TableCell>
                        {course.activeQuiz ? (
                          <Badge className="bg-green-600 text-white">Active Quiz</Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-600 text-slate-400">No Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => onNavigate('course-detail', { courseId: course.id })}
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
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    notification.unread
                      ? 'bg-blue-900/20 border-blue-600/50'
                      : 'bg-slate-700/50 border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Bell size={16} className={notification.unread ? 'text-blue-400' : 'text-slate-500'} />
                    <div className="flex-1">
                      <p className={`text-sm mb-1 ${notification.unread ? 'text-white' : 'text-slate-300'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-400 mb-1">{notification.message}</p>
                      <p className="text-xs text-slate-500">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
