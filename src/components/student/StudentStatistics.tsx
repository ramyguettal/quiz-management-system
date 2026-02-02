import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Clock,
  Trophy,
  ChartBar,
  PieChart,
} from "lucide-react";

export default function StudentStatistics() {
  const features = [
    {
      icon: BarChart3,
      title: "Performance Trends",
      description: "Track your grade progression over time with interactive charts",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: PieChart,
      title: "Grade Distribution",
      description: "Visual breakdown of your quiz scores by grade category",
      color: "bg-green-500/10 text-green-600",
    },
    {
      icon: TrendingUp,
      title: "Comparative Analysis",
      description: "Compare your performance with year and group averages",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      icon: Target,
      title: "Achievement Insights",
      description: "Detailed analytics on your learning progress and goals",
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      icon: Trophy,
      title: "Performance Rankings",
      description: "See how you rank among your peers and track improvements",
      color: "bg-yellow-500/10 text-yellow-600",
    },
    {
      icon: Clock,
      title: "Activity Timeline",
      description: "Complete history of your quiz attempts and results",
      color: "bg-indigo-500/10 text-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <ChartBar className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Personal Statistics</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced analytics and insights into your learning progress are coming soon. 
            Get ready for detailed performance tracking and personalized recommendations.
          </p>
          <Badge variant="outline" className="px-4 py-2 text-sm bg-primary/5 border-primary/20">
            🚀 Coming Soon
          </Badge>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle>What's Coming</CardTitle>
              <CardDescription>
                Exciting analytics features that will help you track and improve your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="space-y-3 p-4 rounded-lg border border-border hover:shadow-md transition-all duration-200"
                  >
                    <div className={`inline-flex p-3 rounded-lg ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="text-center">
            <CardContent className="py-8">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Award className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Stay Tuned!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're working hard to bring you comprehensive analytics and insights. 
                  In the meantime, you can continue taking quizzes and track your progress 
                  in the dashboard.
                </p>
                <div className="flex justify-center space-x-2 pt-4">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-primary/70 rounded-full animate-pulse delay-75"></div>
                  <div className="w-3 h-3 bg-primary/40 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
