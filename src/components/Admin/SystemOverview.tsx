import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatsCard } from "../StatsCard";
import { Users, BookOpen, Activity, UserPlus, FileText, Settings } from "lucide-react";
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

interface RecentActivityItem {
  id: string;
  activityType: string;
  activityTypeName: string;
  description: string;
  performedById: string;
  performedByName: string;
  performedByRole: string;
  targetEntityId: string;
  targetEntityType: string;
  targetEntityName: string;
  createdAtUtc: string;
  timeAgo: string;
}

interface RecentActivitiesResponse {
  items: RecentActivityItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export function SystemOverview() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [activeQuizzesCount, setActiveQuizzesCount] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch users, quizzes, and recent activities in parallel
        const [usersData, quizzesData, activitiesData] = await Promise.all([
          userService.getUsers(),
          apiClient.get<QuizListResponse>(ENDPOINTS.quizzes.list),
          apiClient.get<RecentActivitiesResponse>(`${ENDPOINTS.RecentActivities.list}?pageSize=5`)
        ]);
        setUsers(usersData);
        setRecentActivities(activitiesData.items);
        // Count published (active) quizzes
        const publishedCount = quizzesData.items.filter(
          (quiz) => quiz.status.toLowerCase() === 'published'
        ).length;
        setActiveQuizzesCount(publishedCount);

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

  // Helper functions for activity icons
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'StudentCreated':
      case 'InstructorCreated':
      case 'AdminCreated':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'QuizCreated':
      case 'QuizPublished':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'CourseCreated':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityIconBg = (activityType: string) => {
    switch (activityType) {
      case 'StudentCreated':
      case 'InstructorCreated':
      case 'AdminCreated':
        return 'bg-green-500/10';
      case 'QuizCreated':
      case 'QuizPublished':
        return 'bg-blue-500/10';
      case 'CourseCreated':
        return 'bg-purple-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

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
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activities found.</p>
              ) : (
                recentActivities.map((activity, index) => (
                  <div key={activity.id} className={`flex items-start gap-3 ${index < recentActivities.length - 1 ? 'pb-3 border-b' : ''}`}>
                    <div className={`p-2 rounded-lg ${getActivityIconBg(activity.activityType)}`}>
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">by {activity.performedByName}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{activity.timeAgo}</span>
                      </div>
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
