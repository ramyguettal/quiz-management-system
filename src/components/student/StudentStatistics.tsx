import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { motion } from "motion/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  CheckCircle2,
  Clock,
  BarChart3,
  Trophy,
} from "lucide-react";

// Mock data for charts
const performanceTrendData = [
  { date: "Week 1", score: 75, courseA: 75, courseB: 70, courseC: 80 },
  { date: "Week 2", score: 78, courseA: 80, courseB: 72, courseC: 82 },
  { date: "Week 3", score: 82, courseA: 85, courseB: 75, courseC: 86 },
  { date: "Week 4", score: 85, courseA: 88, courseB: 78, courseC: 89 },
  { date: "Week 5", score: 88, courseA: 90, courseB: 82, courseC: 92 },
  { date: "Week 6", score: 86, courseA: 87, courseB: 80, courseC: 91 },
  { date: "Week 7", score: 90, courseA: 92, courseB: 85, courseC: 93 },
  { date: "Week 8", score: 92, courseA: 95, courseB: 88, courseC: 94 },
];

const comparativeData = [
  {
    category: "Overall",
    myScore: 87,
    yearAverage: 75,
    groupAverage: 82,
  },
  {
    category: "Mathematics",
    myScore: 92,
    yearAverage: 78,
    groupAverage: 85,
  },
  {
    category: "Physics",
    myScore: 85,
    yearAverage: 72,
    groupAverage: 80,
  },
  {
    category: "Chemistry",
    myScore: 88,
    yearAverage: 76,
    groupAverage: 83,
  },
  {
    category: "Programming",
    myScore: 95,
    yearAverage: 80,
    groupAverage: 88,
  },
];

const gradeDistributionData = [
  { name: "A (90-100%)", value: 12, color: "#10b981" },
  { name: "B (80-89%)", value: 8, color: "#3b82f6" },
  { name: "C (70-79%)", value: 5, color: "#f59e0b" },
  { name: "D (60-69%)", value: 2, color: "#f97316" },
  { name: "F (<60%)", value: 1, color: "#ef4444" },
];

const recentActivities = [
  {
    id: 1,
    action: "Completed Quiz",
    quiz: "Calculus Final Exam",
    course: "Mathematics",
    score: 95,
    timestamp: "2 hours ago",
    isNew: true,
  },
  {
    id: 2,
    action: "Completed Quiz",
    quiz: "Quantum Mechanics Test",
    course: "Physics",
    score: 88,
    timestamp: "1 day ago",
    isNew: false,
  },
  {
    id: 3,
    action: "Completed Quiz",
    quiz: "Organic Chemistry Quiz",
    course: "Chemistry",
    score: 92,
    timestamp: "2 days ago",
    isNew: false,
  },
  {
    id: 4,
    action: "Completed Quiz",
    quiz: "Data Structures Assignment",
    course: "Programming",
    score: 98,
    timestamp: "3 days ago",
    isNew: false,
  },
  {
    id: 5,
    action: "Missed Quiz",
    quiz: "Linear Algebra Quiz",
    course: "Mathematics",
    score: null,
    timestamp: "5 days ago",
    isNew: false,
  },
];

export default function StudentStatistics() {
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [timeRange, setTimeRange] = useState("semester");
  const [comparisonType, setComparisonType] = useState<"year" | "group">("year");
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // Calculate overall statistics
  const totalQuizzes = gradeDistributionData.reduce((sum, item) => sum + item.value, 0);
  const overallGPA = 87.5;
  const completionRate = ((totalQuizzes - 1) / totalQuizzes) * 100; // Minus missed quizzes
  const trend = performanceTrendData[performanceTrendData.length - 1].score - performanceTrendData[0].score;

  // Custom tooltip for line chart
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-4 rounded-lg shadow-lg border border-border">
          <p className="font-semibold mb-2">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const myScore = data.myScore;
      const compareScore = comparisonType === "year" ? data.yearAverage : data.groupAverage;
      const diff = myScore - compareScore;
      return (
        <div className="bg-card p-4 rounded-lg shadow-lg border border-border">
          <p className="font-semibold mb-2">{data.category}</p>
          <p className="text-sm text-primary">Your Score: {myScore}%</p>
          <p className="text-sm text-muted-foreground">
            {comparisonType === "year" ? "Year" : "Group"} Average: {compareScore}%
          </p>
          <p className={`text-sm mt-1 ${diff > 0 ? "text-green-600" : "text-red-600"}`}>
            {diff > 0 ? "+" : ""}{diff}% {diff > 0 ? "above" : "below"} average
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-foreground mb-2">Personal Statistics</h1>
          <p className="text-muted-foreground">
            Track your performance, compare with peers, and analyze your learning progress
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-wrap gap-4"
        >
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="semester">This Semester</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Overall Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="relative overflow-hidden border-l-4 border-l-[#1e40af] hover:shadow-lg transition-shadow duration-250">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Overall GPA</CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-foreground" style={{ fontSize: "48px" }}>
                      {overallGPA}
                    </span>
                    <span className="text-muted-foreground">/ 100</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+{trend}% this period</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="relative overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-shadow duration-250">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Total Quizzes</CardTitle>
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-foreground" style={{ fontSize: "48px" }}>
                      {totalQuizzes}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="text-sm">{totalQuizzes - 1} completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="relative overflow-hidden border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow duration-250">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Completion Rate</CardTitle>
                  <div className="p-2 bg-chart-2/10 rounded-lg">
                    <Target className="h-5 w-5 text-chart-2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-foreground" style={{ fontSize: "48px" }}>
                      {completionRate.toFixed(0)}
                    </span>
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-chart-2 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="relative overflow-hidden border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow duration-250">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Average Score</CardTitle>
                  <div className="p-2 bg-chart-4/10 rounded-lg">
                    <Award className="h-5 w-5 text-chart-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-foreground" style={{ fontSize: "48px" }}>
                      {performanceTrendData[performanceTrendData.length - 1].score}
                    </span>
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Trending upward</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="hover:shadow-lg transition-shadow duration-250">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#1e40af]" />
                  Performance Trend
                </CardTitle>
                <CardDescription>Track your grade progression over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overall" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overall">Overall</TabsTrigger>
                    <TabsTrigger value="bycourse">By Course</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overall" className="flex-1 outline-none">
                    <div style={{ width: '100%', height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis domain={[0, 100]} stroke="#6b7280" />
                        <Tooltip content={<CustomLineTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#1e40af"
                          strokeWidth={3}
                          dot={{ fill: "#1e40af", r: 5 }}
                          activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff" }}
                          name="Your Score"
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  <TabsContent value="bycourse" className="flex-1 outline-none">
                    <div style={{ width: '100%', height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis domain={[0, 100]} stroke="#6b7280" />
                        <Tooltip content={<CustomLineTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="courseA"
                          stroke="#1e40af"
                          strokeWidth={2}
                          dot={{ fill: "#1e40af", r: 4 }}
                          name="Mathematics"
                          animationDuration={1000}
                        />
                        <Line
                          type="monotone"
                          dataKey="courseB"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981", r: 4 }}
                          name="Physics"
                          animationDuration={1000}
                          animationBegin={200}
                        />
                        <Line
                          type="monotone"
                          dataKey="courseC"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ fill: "#f59e0b", r: 4 }}
                          name="Chemistry"
                          animationDuration={1000}
                          animationBegin={400}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Grade Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-250">
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Breakdown by grade category</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: '300px' }} className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradeDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                        onMouseLeave={() => setActivePieIndex(null)}
                      >
                        {gradeDistributionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            style={{
                              transform: activePieIndex === index ? "scale(1.05)" : "scale(1)",
                              transformOrigin: "center",
                              transition: "transform 0.2s ease",
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length && payload[0]?.value) {
                            const value = Number(payload[0].value);
                            return (
                              <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
                                <p className="font-semibold">{payload[0].name}</p>
                                <p className="text-sm">
                                  {value} quizzes (
                                  {((value / totalQuizzes) * 100).toFixed(1)}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {gradeDistributionData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Comparative Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-250">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Comparative Analysis</CardTitle>
                  <CardDescription className="mt-2">Compare your performance with peers</CardDescription>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setComparisonType("year")}
                    className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-colors ${
                      comparisonType === "year"
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Year Average
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setComparisonType("group")}
                    className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-colors ${
                      comparisonType === "group"
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Group Average
                  </motion.button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparativeData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" />
                    <YAxis domain={[0, 100]} stroke="#6b7280" />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="myScore"
                      fill="#1e40af"
                      radius={[8, 8, 0, 0]}
                      name="Your Score"
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey={comparisonType === "year" ? "yearAverage" : "groupAverage"}
                      fill={comparisonType === "year" ? "#93c5fd" : "#86efac"}
                      radius={[8, 8, 0, 0]}
                      name={comparisonType === "year" ? "Year Average" : "Group Average"}
                      animationDuration={1000}
                      animationBegin={200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-250">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#1e40af]" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest quiz attempts and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      activity.isNew ? "bg-primary/10 border-primary/30" : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          activity.score !== null
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {activity.score !== null ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={activity.isNew ? "font-semibold" : ""}>
                            {activity.quiz}
                          </p>
                          {activity.isNew && (
                            <Badge className="bg-[#1e40af] text-white">NEW</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.course}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                    {activity.score !== null ? (
                      <div className="text-right">
                        <div
                          className={`text-xl font-semibold ${
                            activity.score >= 90
                              ? "text-green-600"
                              : activity.score >= 80
                              ? "text-primary"
                              : activity.score >= 70
                              ? "text-yellow-600"
                              : "text-orange-600"
                          }`}
                        >
                          {activity.score}%
                        </div>
                        <Badge
                          className={
                            activity.score >= 90
                              ? "bg-green-100 text-green-700"
                              : activity.score >= 80
                              ? "bg-primary/10 text-primary"
                              : activity.score >= 70
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-orange-100 text-orange-700"
                          }
                        >
                          {activity.score >= 90
                            ? "A"
                            : activity.score >= 80
                            ? "B"
                            : activity.score >= 70
                            ? "C"
                            : "D"}
                        </Badge>
                      </div>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">Missed</Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
