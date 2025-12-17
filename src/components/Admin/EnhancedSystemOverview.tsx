import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Users, BookOpen, FileText, TrendingUp, Activity, Database } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

export function EnhancedSystemOverview() {
  const [outerRadius, setOuterRadius] = useState(80);

  useEffect(() => {
    const handleResize = () => {
      setOuterRadius(window.innerWidth < 640 ? 60 : 80);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: Users,
      color: 'bg-blue-600',
      description: '+12% from last month',
      change: '+142'
    },
    {
      title: 'Active Quizzes',
      value: '89',
      icon: BookOpen,
      color: 'bg-purple-600',
      description: '+5 new this week',
      change: '+5'
    },
    {
      title: 'Total Submissions',
      value: '4,567',
      icon: FileText,
      color: 'bg-green-600',
      description: '+23% increase',
      change: '+856'
    },
    {
      title: 'System Uptime',
      value: '99.8%',
      icon: TrendingUp,
      color: 'bg-orange-600',
      description: 'This month',
      change: 'Excellent'
    }
  ];

  return (
    <div className="space-y-6 bg-background">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">System Overview 📊</h1>
        <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
          Monitor your platform's performance and statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.title}</p>
                  <p className="text-foreground text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-muted-foreground text-xs">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* User Growth Chart */}
        <Card className="bg-card hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">User Growth</CardTitle>
            <CardDescription className="mt-1.5">Monthly user registration trends</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Activity Chart */}
        <Card className="bg-card hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Quiz Activity</CardTitle>
            <CardDescription className="mt-1.5">Weekly quiz creation activity</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizActivityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9ca3af" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar 
                    dataKey="quizzes" 
                    fill="#8b5cf6" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* User Distribution */}
        <Card className="bg-card hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">User Distribution</CardTitle>
            <CardDescription className="mt-1.5">User roles breakdown</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={outerRadius}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="bg-blue-600 p-2 rounded-lg shrink-0">
                  <Users className="text-white" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium text-sm sm:text-base">142 new users registered</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">In the last 30 days</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">Today</span>
              </div>
              <div className="flex items-start gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="bg-purple-600 p-2 rounded-lg shrink-0">
                  <BookOpen className="text-white" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium text-sm sm:text-base">5 new quizzes created</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">This week across all courses</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">This week</span>
              </div>
              <div className="flex items-start gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="bg-green-600 p-2 rounded-lg shrink-0">
                  <FileText className="text-white" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium text-sm sm:text-base">856 new submissions</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">23% increase from last period</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">This month</span>
              </div>
              <div className="flex items-start gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="bg-orange-600 p-2 rounded-lg shrink-0">
                  <Activity className="text-white" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium text-sm sm:text-base">Database backup completed</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">All systems operational</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">1 hour ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
