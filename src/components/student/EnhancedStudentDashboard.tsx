import { useState } from "react";
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

interface EnhancedStudentDashboardProps {
  onNavigate: (page: string) => void;
  onStartQuiz: (quizId: number) => void;
}

const mockQuizzes = [
  {
    id: 1,
    title: 'Introduction to React',
    instructor: 'Jane Smith',
    status: 'active' as const,
    startDate: '2025-10-25',
    deadline: '2025-10-30',
    duration: 45,
  },
  {
    id: 2,
    title: 'Web Security Basics',
    instructor: 'Charlie Brown',
    status: 'active' as const,
    startDate: '2025-10-26',
    deadline: '2025-10-31',
    duration: 30,
  },
  {
    id: 3,
    title: 'Database Design',
    instructor: 'Jane Smith',
    status: 'upcoming' as const,
    startDate: '2025-11-01',
    deadline: '2025-11-05',
    duration: 60,
  },
  {
    id: 4,
    title: 'Advanced TypeScript',
    instructor: 'John Doe',
    status: 'active' as const,
    startDate: '2025-10-27',
    deadline: '2025-11-02',
    duration: 40,
  },
];

const recentNotifications = [
  { id: 1, title: 'New Quiz Available', message: 'Introduction to React quiz is now available', time: '2 hours ago' },
  { id: 2, title: 'Quiz Results Published', message: 'Your results for Web Security Basics: 92%', time: '5 hours ago' },
  { id: 3, title: 'Deadline Reminder', message: 'Database Design quiz deadline in 2 days', time: '1 day ago' },
];

export function EnhancedStudentDashboard({ onNavigate, onStartQuiz }: EnhancedStudentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);

  const toggleExpand = (quizId: number) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const filteredQuizzes = mockQuizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2">Hello, Nasrellah 👋</h1>
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
              value="5"
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
              value="12"
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
              value="82%"
              icon={Clock}
              trend="+7% improvement"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatsCard
              title="Notifications"
              value="3"
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

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {filteredQuizzes.map((quiz) => (
                    <div key={quiz.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary shrink-0" />
                            <h3 className="text-sm font-semibold line-clamp-1">{quiz.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {quiz.status === 'active' ? (
                            <Button
                              size="sm"
                              onClick={() => onStartQuiz(quiz.id)}
                              className="bg-primary hover:bg-primary/90 h-8 px-3"
                            >
                              <Play className="h-3 w-3 mr-1.5" />
                              <span className="text-xs">Start</span>
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="h-8 px-3 text-xs">
                              Soon
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(quiz.id)}
                            className="h-8 w-8 p-0"
                          >
                            {expandedQuiz === quiz.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details for Mobile */}
                      <motion.div
                        initial={false}
                        animate={{
                          height: expandedQuiz === quiz.id ? "auto" : 0,
                          opacity: expandedQuiz === quiz.id ? 1 : 0
                        }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut"
                        }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t space-y-2">
                          <div className="flex items-center gap-2">
                            {quiz.status === 'active' ? (
                              <Badge variant="default" className="bg-green-600">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Upcoming</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-medium">Instructor:</span> {quiz.instructor}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-medium">Deadline:</span> {quiz.deadline}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block rounded-md border">
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
                      {filteredQuizzes.map((quiz) => (
                        <TableRow key={quiz.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-primary" />
                              {quiz.title}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {quiz.instructor}
                          </TableCell>
                          <TableCell>
                            {quiz.status === 'active' ? (
                              <Badge variant="default" className="bg-green-600">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Upcoming</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {quiz.deadline}
                          </TableCell>
                          <TableCell className="text-right">
                            {quiz.status === 'active' ? (
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
                      ))}
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
                  {recentNotifications.map((notif, index) => (
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
                            {notif.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notif.time}
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
