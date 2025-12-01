import { ArrowLeft, Download, Eye, TrendingUp, Users, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
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
import { Progress } from '../ui/progress';

interface QuizDetailProps {
  quizId?: number;
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

export default function QuizDetail({ quizId = 1, onNavigate, onBack }: QuizDetailProps) {
  const quiz = {
    id: quizId,
    title: 'Database Normalization Quiz',
    course: 'Advanced Database Systems (CS501)',
    createdOn: '2024-10-15',
    status: 'Published',
    totalQuestions: 15,
    totalPoints: 30,
    duration: 30,
    attempts: 38
  };

  const stats = [
    {
      title: 'Total Submissions',
      value: '38',
      icon: Users,
      color: 'bg-blue-600'
    },
    {
      title: 'Average Score',
      value: '82%',
      icon: Target,
      color: 'bg-purple-600'
    },
    {
      title: 'Pass Rate',
      value: '84%',
      icon: Award,
      color: 'bg-green-600'
    },
    {
      title: 'Completion Rate',
      value: '90%',
      icon: TrendingUp,
      color: 'bg-orange-600'
    }
  ];

  const submissions = [
    {
      id: 1,
      studentName: 'Ahmed Ali',
      studentId: 'S20210001',
      submittedAt: '2024-10-16 14:30',
      score: 28,
      maxScore: 30,
      percentage: 93,
      status: 'Graded',
      timeTaken: 28
    },
    {
      id: 2,
      studentName: 'Sara Mohammed',
      studentId: 'S20210002',
      submittedAt: '2024-10-16 15:45',
      score: 25,
      maxScore: 30,
      percentage: 83,
      status: 'Graded',
      timeTaken: 30
    },
    {
      id: 3,
      studentName: 'Omar Hassan',
      studentId: 'S20210003',
      submittedAt: '2024-10-17 09:15',
      score: 22,
      maxScore: 30,
      percentage: 73,
      status: 'Graded',
      timeTaken: 25
    },
    {
      id: 4,
      studentName: 'Layla Ibrahim',
      studentId: 'S20210004',
      submittedAt: '2024-10-17 10:30',
      score: 27,
      maxScore: 30,
      percentage: 90,
      status: 'Graded',
      timeTaken: 29
    },
    {
      id: 5,
      studentName: 'Mohammed Khalid',
      studentId: 'S20210005',
      submittedAt: '2024-10-17 13:20',
      score: 0,
      maxScore: 30,
      percentage: 0,
      status: 'Pending',
      timeTaken: 30
    }
  ];

  const questionAnalysis = [
    { number: 1, topic: 'First Normal Form', avgScore: 0.92, difficulty: 'Easy' },
    { number: 2, topic: 'Second Normal Form', avgScore: 0.85, difficulty: 'Medium' },
    { number: 3, topic: 'Third Normal Form', avgScore: 0.78, difficulty: 'Medium' },
    { number: 4, topic: 'BCNF', avgScore: 0.65, difficulty: 'Hard' },
    { number: 5, topic: 'Functional Dependencies', avgScore: 0.88, difficulty: 'Easy' }
  ];

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <Button
        onClick={onBack}
        variant="ghost"
        className="text-slate-400 hover:text-white hover:bg-slate-800 mb-4"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Course
      </Button>

      {/* Quiz Info Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl mb-2">{quiz.title}</h1>
              <p className="text-blue-100 mb-2">{quiz.course}</p>
              <div className="flex gap-4 text-sm text-blue-50">
                <span>{quiz.totalQuestions} Questions</span>
                <span>•</span>
                <span>{quiz.totalPoints} Points</span>
                <span>•</span>
                <span>{quiz.duration} Minutes</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-green-600 text-white">{quiz.status}</Badge>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Eye size={16} className="mr-2" />
              Preview Quiz
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Download size={16} className="mr-2" />
              Export Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-white text-3xl">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions Table */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Student Submissions</CardTitle>
              <CardDescription className="text-slate-400">
                All attempts for this quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-400">Student</TableHead>
                    <TableHead className="text-slate-400">Submitted At</TableHead>
                    <TableHead className="text-slate-400">Score</TableHead>
                    <TableHead className="text-slate-400">Time</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white">
                        <div>
                          <p>{submission.studentName}</p>
                          <p className="text-xs text-slate-500">{submission.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        {submission.submittedAt}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white">
                            {submission.score}/{submission.maxScore}
                          </p>
                          <p className="text-xs text-slate-400">{submission.percentage}%</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{submission.timeTaken} min</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            submission.status === 'Graded'
                              ? 'bg-green-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }
                        >
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
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
          {/* Question Performance */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Question Analysis</CardTitle>
              <CardDescription className="text-slate-400">
                Performance by question
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questionAnalysis.map((question) => (
                <div key={question.number} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Q{question.number}: {question.topic}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        question.difficulty === 'Easy'
                          ? 'border-green-600 text-green-400'
                          : question.difficulty === 'Medium'
                          ? 'border-yellow-600 text-yellow-400'
                          : 'border-red-600 text-red-400'
                      }`}
                    >
                      {question.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={question.avgScore * 100}
                      className="flex-1 h-2 bg-slate-700"
                    />
                    <span className="text-slate-400 text-sm w-12 text-right">
                      {(question.avgScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Score Distribution</CardTitle>
              <CardDescription className="text-slate-400">
                Grade breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">A (90-100%)</span>
                <div className="flex items-center gap-3">
                  <Progress value={45} className="w-24 h-2 bg-slate-700" />
                  <span className="text-white w-8 text-right">18</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">B (80-89%)</span>
                <div className="flex items-center gap-3">
                  <Progress value={32} className="w-24 h-2 bg-slate-700" />
                  <span className="text-white w-8 text-right">12</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">C (70-79%)</span>
                <div className="flex items-center gap-3">
                  <Progress value={16} className="w-24 h-2 bg-slate-700" />
                  <span className="text-white w-8 text-right">6</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">D (60-69%)</span>
                <div className="flex items-center gap-3">
                  <Progress value={5} className="w-24 h-2 bg-slate-700" />
                  <span className="text-white w-8 text-right">2</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">F (&lt;60%)</span>
                <div className="flex items-center gap-3">
                  <Progress value={0} className="w-24 h-2 bg-slate-700" />
                  <span className="text-white w-8 text-right">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
