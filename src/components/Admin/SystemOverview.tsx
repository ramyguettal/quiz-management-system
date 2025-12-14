import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatsCard } from "../StatsCard";
import { Users, BookOpen, FileText } from "lucide-react";

const userGrowthData = [
  { month: 'Jun', users: 820 },
  { month: 'Jul', users: 950 },
  { month: 'Aug', users: 1050 },
  { month: 'Sep', users: 1150 },
  { month: 'Oct', users: 1234 },
];

const quizActivityData = [
  { day: 'Mon', quizzes: 12 },
  { day: 'Tue', quizzes: 19 },
  { day: 'Wed', quizzes: 15 },
  { day: 'Thu', quizzes: 22 },
  { day: 'Fri', quizzes: 18 },
  { day: 'Sat', quizzes: 8 },
  { day: 'Sun', quizzes: 5 },
];

const userDistributionData = [
  { name: 'Students', value: 980 },
  { name: 'Instructors', value: 234 },
  { name: 'Admins', value: 20 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

export function SystemOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your quiz platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Users"
          value="1,234"
          icon={Users}
          trend="+12% from last month"
        />
        <StatsCard
          title="Active Quizzes"
          value="89"
          icon={BookOpen}
          trend="+5 new this week"
        />
        <StatsCard
          title="Total Submissions"
          value="4,567"
          icon={FileText}
          trend="+23% increase"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#1e40af" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Quiz Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quizActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="quizzes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm">New quiz created by Jane Smith</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm">25 new user registrations</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm">Quiz "Advanced JavaScript" completed</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm">System backup completed successfully</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
