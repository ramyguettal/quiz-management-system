import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatsCard } from "../StatsCard";
import { Users, BookOpen } from "lucide-react";
import { userService } from "../../api/services/UserServices";
import apiClient from "../../api/Client";
import { ENDPOINTS } from "../../api/Routes";
import type { UserResponse } from "../../types/ApiTypes";

interface QuizItem {
  id: string;
  title: string;
  status: string;
  courseName: string;
  courseId: string;
  createdAtUtc: string;
}

interface WeeklyActivity {
  day: string;
  quizzes: number;
}

interface QuizListResponse {
  items: QuizItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

interface CourseQuizCount {
  courseName: string;
  quizCount: number;
}

export function SystemOverview() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [activeQuizzesCount, setActiveQuizzesCount] = useState<number>(0);
  const [topCourses, setTopCourses] = useState<CourseQuizCount[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch users and quizzes in parallel
        const [usersData, quizzesData] = await Promise.all([
          userService.getUsers(),
          apiClient.get<QuizListResponse>(ENDPOINTS.quizzes.list)
        ]);
        setUsers(usersData);
        // Count published (active) quizzes
        const publishedCount = quizzesData.items.filter(
          (quiz) => quiz.status.toLowerCase() === 'published'
        ).length;
        setActiveQuizzesCount(publishedCount);

        // Calculate top courses by quiz count
        const courseQuizMap = new Map<string, { name: string; count: number }>();
        quizzesData.items.forEach((quiz) => {
          const existing = courseQuizMap.get(quiz.courseId);
          if (existing) {
            existing.count += 1;
          } else {
            courseQuizMap.set(quiz.courseId, { name: quiz.courseName, count: 1 });
          }
        });
        const sortedCourses = Array.from(courseQuizMap.values())
          .map((c) => ({ courseName: c.name, quizCount: c.count }))
          .sort((a, b) => b.quizCount - a.quizCount)
          .slice(0, 5);
        setTopCourses(sortedCourses);

        // Calculate weekly quiz activity (quizzes created in the last 7 days)
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const weekActivityMap = new Map<string, number>();
        
        // Initialize all days of the week with 0
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dayName = dayNames[date.getDay()];
          weekActivityMap.set(dayName, 0);
        }
        
        // Count quizzes created in the last 7 days
        quizzesData.items.forEach((quiz) => {
          const createdDate = new Date(quiz.createdAtUtc);
          const diffTime = today.getTime() - createdDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays < 7) {
            const dayName = dayNames[createdDate.getDay()];
            weekActivityMap.set(dayName, (weekActivityMap.get(dayName) || 0) + 1);
          }
        });
        
        // Convert to array in order (last 7 days)
        const weeklyActivityArray: WeeklyActivity[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dayName = dayNames[date.getDay()];
          weeklyActivityArray.push({
            day: dayName,
            quizzes: weekActivityMap.get(dayName) || 0
          });
        }
        setWeeklyActivity(weeklyActivityArray);
      } catch (error) {
        // Handle error (could show a toast)
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Calculate statistics
  const totalUsers = users.length;

  // User distribution by role
  const userDistributionData = [
    { name: 'Students', value: users.filter(u => u.role.toLowerCase() === 'student').length },
    { name: 'Instructors', value: users.filter(u => u.role.toLowerCase() === 'instructor').length },
    { name: 'Admins', value: users.filter(u => u.role.toLowerCase() === 'admin').length },
  ];
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your quiz platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <StatsCard
          title="Total Users"
          value={isLoading ? "..." : totalUsers.toLocaleString()}
          icon={Users}
          trend=""
        />
        <StatsCard
          title="Active Quizzes"
          value={isLoading ? "..." : activeQuizzesCount.toLocaleString()}
          icon={BookOpen}
          trend=""
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Quiz Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="quizzes" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : topCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses with quizzes found.</p>
              ) : (
                topCourses.map((course, index) => (
                  <div key={course.courseName} className={`flex items-center justify-between ${index < topCourses.length - 1 ? 'pb-3 border-b' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                      </div>
                      <p className="text-sm font-medium">{course.courseName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{course.quizCount} {course.quizCount === 1 ? 'quiz' : 'quizzes'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
