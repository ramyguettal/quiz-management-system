import { useState, useEffect } from "react";
import { BookOpen, Clock, Trophy, Bell, Play, Eye, Calendar, Filter, Search, BarChart3, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { StatsCard } from "../StatsCard";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { motion } from "motion/react";
import { studentService } from "@/api/services/studentService";
import { notificationsService } from "@/api/services/NotificationsServices";
import { authService } from "@/api/services/AuthService";
import type { StudentDashboard, DashboardQuiz, Notification } from "@/types/ApiTypes";
import { toast } from "sonner";

interface EnhancedStudentDashboardProps {
  onNavigate: (page: string) => void;
  onStartQuiz: (quizId: string) => void;
}

export function EnhancedStudentDashboard({ onNavigate, onStartQuiz }: EnhancedStudentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<DashboardQuiz[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userName, setUserName] = useState<string>("Student");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        
        // Fetch user info, dashboard, and notifications in parallel
        const [userData, dashboardData, notifData] = await Promise.all([
          authService.getCurrentUser(),
          studentService.getDashboard(),
          notificationsService.getNotifications()
        ]);
        
        // Set user name
        if (userData.fullName) {
          setUserName(userData.fullName);
        }
        
        setDashboard(dashboardData);
        setQuizzes(dashboardData.availableQuizzes);
        setNotifications(notifData.items.slice(0, 3)); // Get top 3
      } catch (error: any) {
        console.error('Failed to fetch dashboard:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
        } else {
          toast.error('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const toggleExpand = (quizId: string) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.status === 'Published' && (
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2">Hello, {userName} 👋</h1>
          <p className="text-muted-foreground">Welcome back to your learning dashboard</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatsCard
              title="Active Quizzes"
              value={dashboard?.stats.activeQuizzes.toString() || "0"}
              icon={BookOpen}
              description="Ready to take"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatsCard
              title="Completed Quizzes"
              value={dashboard?.stats.completedQuizzes.toString() || "0"}
              icon={Trophy}
              description="Total attempts"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatsCard
              title="Average Score"
              value={`${dashboard?.stats.averageScore || 0}%`}
              icon={Clock}
              trend={dashboard?.stats.averageScoreChange || "No change"}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatsCard
              title="Notifications"
              value={dashboard?.stats.unreadNotifications.toString() || "0"}
              icon={Bell}
              description="Unread messages"
            />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Available Quizzes Table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2>Available Quizzes</h2>
                  <Button
                    variant="link"
                    onClick={() => onNavigate('available-quizzes')}
                    className="text-primary"
                  >
                    View All
                  </Button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search quizzes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Quizzes Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuizzes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            {searchQuery ? 'No quizzes found matching your search.' : 'No quizzes available.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredQuizzes.map((quiz) => (
                          <TableRow key={quiz.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span className="font-medium">{quiz.title}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {quiz.instructorName}
                            </TableCell>
                            <TableCell>
                              {quiz.status === 'Active' ? (
                                <Badge variant="default" className="bg-green-600">Active</Badge>
                              ) : (
                                <Badge variant="secondary">{quiz.status}</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(quiz.deadline).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {quiz.canStart ? (
                                <Button
                                  size="sm"
                                  onClick={() => onStartQuiz(quiz.id)}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Start
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" disabled>
                                  Coming Soon
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3>Recent Notifications</h3>
                  <Button
                    variant="link"
                    onClick={() => onNavigate('notifications')}
                    className="text-primary text-sm"
                  >
                    View All
                  </Button>
                </div>

                <div className="space-y-3">
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="p-3 rounded-lg border border-border hover:border-primary transition-all cursor-pointer"
                      onClick={() => onNavigate('notifications')}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-1">{notif.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notif.body}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex flex-wrap gap-4"
        >
          <Button
            onClick={() => onNavigate('available-quizzes')}
            className="bg-primary hover:bg-primary/90"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Browse All Quizzes
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('history')}
            className="hover:bg-primary/5 hover:border-primary"
          >
            <Trophy className="h-4 w-4 mr-2" />
            View Quiz History
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('statistics')}
            className="hover:bg-primary/5 hover:border-primary"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Statistics
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
