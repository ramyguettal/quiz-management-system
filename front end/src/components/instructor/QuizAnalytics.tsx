import { Download } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from "../ui/badge";
import { toast } from "sonner";

const scoreDistributionData = [
  { range: '0-20', students: 3 },
  { range: '21-40', students: 8 },
  { range: '41-60', students: 15 },
  { range: '61-80', students: 25 },
  { range: '81-100', students: 18 },
];

const attemptData = [
  { date: 'Oct 24', attempts: 12 },
  { date: 'Oct 25', attempts: 18 },
  { date: 'Oct 26', attempts: 15 },
  { date: 'Oct 27', attempts: 22 },
  { date: 'Oct 28', attempts: 20 },
];

const questionDifficulty = [
  { question: 'Q1', difficulty: 85, topic: 'React Basics' },
  { question: 'Q2', difficulty: 72, topic: 'Components' },
  { question: 'Q3', difficulty: 45, topic: 'Hooks' },
  { question: 'Q4', difficulty: 90, topic: 'Props' },
  { question: 'Q5', difficulty: 38, topic: 'State Management' },
];

export function QuizAnalytics() {
  const handleExportCSV = () => {
    toast.success("Analytics exported to CSV successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2>Quiz Analytics</h2>
          <p className="text-muted-foreground">Detailed insights into quiz performance</p>
        </div>
        <div className="flex gap-4 items-center">
          <Select defaultValue="react-intro">
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select quiz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="react-intro">Introduction to React</SelectItem>
              <SelectItem value="js-advanced">Advanced JavaScript</SelectItem>
              <SelectItem value="css-fundamentals">CSS Fundamentals</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
            <p className="text-2xl">69</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Average Score</p>
            <p className="text-2xl">74%</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
            <p className="text-2xl">92%</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Pass Rate</p>
            <p className="text-2xl">81%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#1e40af" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attempt Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attemptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attempts" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Question Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle>Question Difficulty Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionDifficulty.map((item) => {
              const getDifficultyBadge = (score: number) => {
                if (score >= 70) return { variant: 'outline' as const, label: 'Easy' };
                if (score >= 40) return { variant: 'secondary' as const, label: 'Medium' };
                return { variant: 'destructive' as const, label: 'Hard' };
              };
              
              const badge = getDifficultyBadge(item.difficulty);
              
              return (
                <div key={item.question} className="flex items-center gap-4">
                  <div className="w-16">
                    <span>{item.question}</span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.topic}</span>
                      <span>{item.difficulty}% correct</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${item.difficulty}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
