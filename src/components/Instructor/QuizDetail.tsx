import { useState, useEffect } from 'react';
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
import { quizService } from '@/api/services/QuizzServices';
import type { QuizAnalytics, Quiz } from '@/types/ApiTypes';
import { toast } from 'sonner';

interface QuizDetailProps {
  quizId?: string;
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

export default function QuizDetail({ quizId , onNavigate, onBack }: QuizDetailProps) {
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!quizId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch both quiz details and analytics in parallel
        const [quizData, analyticsData] = await Promise.all([
          quizService.getQuiz(quizId),
          quizService.getAnalytics(quizId)
        ]);
        
        setQuiz(quizData);
        setAnalytics(analyticsData);
      } catch (error: any) {
        console.error('Failed to fetch quiz data:', error);
        toast.error('Failed to load quiz details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [quizId]);


  const stats = [
    {
      title: 'Total Submissions',
      value: analytics?.statistics.totalSubmissions.toString() || '0',
      icon: Users,
      color: 'bg-blue-600'
    },
    {
      title: 'Average Score',
      value: analytics?.statistics.averageScore ? `${analytics.statistics.averageScore.toFixed(0)}%` : '0%',
      icon: Target,
      color: 'bg-purple-600'
    },
    {
      title: 'Pass Rate',
      value: analytics?.statistics.passRate ? `${analytics.statistics.passRate.toFixed(0)}%` : '0%',
      icon: Award,
      color: 'bg-green-600'
    },
    {
      title: 'Completion Rate',
      value: analytics?.statistics.completionRate ? `${analytics.statistics.completionRate.toFixed(0)}%` : '0%',
      icon: TrendingUp,
      color: 'bg-orange-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="text-slate-400">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (!analytics || !quiz) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Quiz not found or no data available</p>
          <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const submissions = analytics.studentSubmissions || [];

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
              <p className="text-blue-100 mb-2">{quiz.courseName}</p>
              <div className="flex gap-4 text-sm text-blue-50">
                <span>{quiz.totalQuestions} Questions</span>
                <span>•</span>
                <span>{quiz.totalPoints} Points</span>
                {quiz.timeLimit && (
                  <>
                    <span>•</span>
                    <span>{quiz.timeLimit} Minutes</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={
                quiz.status === 'published' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-yellow-600 text-white'
              }>
                {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
              </Badge>
            </div>
          </div>
          {quiz.description && (
            <p className="text-blue-50 mb-4 text-sm">{quiz.description}</p>
          )}
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
                  {submissions.length === 0 ? (
                    <TableRow className="border-slate-700">
                      <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                        No submissions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((submission, index) => (
                      <TableRow key={submission.submissionId} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="text-white">
                          <div>
                            <p>{submission.studentName}</p>
                            <p className="text-xs text-slate-500">{submission.studentEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white">
                              {submission.score}
                            </p>
                            <p className="text-xs text-slate-400">{submission.percentage.toFixed(0)}%</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">{submission.timeSpent} min</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              submission.status === 'Graded'
                                ? 'bg-green-600 text-white'
                                : submission.status === 'Submitted'
                                ? 'bg-blue-600 text-white'
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
                    ))
                  )}
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
              {analytics.questionAnalysis && analytics.questionAnalysis.length > 0 ? (
                analytics.questionAnalysis.map((question, index) => (
                  <div key={question.questionId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Q{index + 1}: {question.questionText}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          question.difficulty.toLowerCase() === 'easy'
                            ? 'border-green-600 text-green-400'
                            : question.difficulty.toLowerCase() === 'medium'
                            ? 'border-yellow-600 text-yellow-400'
                            : 'border-red-600 text-red-400'
                        }`}
                      >
                        {question.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={question.successRate}
                        className="flex-1 h-2 bg-slate-700"
                      />
                      <span className="text-slate-400 text-sm w-12 text-right">
                        {question.successRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-4">No question data available</p>
              )}
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
              {analytics.scoreDistribution ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">A (90-100%)</span>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={(analytics.scoreDistribution.gradeA / analytics.statistics.totalSubmissions) * 100} 
                        className="w-24 h-2 bg-slate-700" 
                      />
                      <span className="text-white w-8 text-right">{analytics.scoreDistribution.gradeA}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">B (80-89%)</span>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={(analytics.scoreDistribution.gradeB / analytics.statistics.totalSubmissions) * 100} 
                        className="w-24 h-2 bg-slate-700" 
                      />
                      <span className="text-white w-8 text-right">{analytics.scoreDistribution.gradeB}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">C (70-79%)</span>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={(analytics.scoreDistribution.gradeC / analytics.statistics.totalSubmissions) * 100} 
                        className="w-24 h-2 bg-slate-700" 
                      />
                      <span className="text-white w-8 text-right">{analytics.scoreDistribution.gradeC}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">D (60-69%)</span>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={(analytics.scoreDistribution.gradeD / analytics.statistics.totalSubmissions) * 100} 
                        className="w-24 h-2 bg-slate-700" 
                      />
                      <span className="text-white w-8 text-right">{analytics.scoreDistribution.gradeD}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">F (&lt;60%)</span>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={(analytics.scoreDistribution.gradeF / analytics.statistics.totalSubmissions) * 100} 
                        className="w-24 h-2 bg-slate-700" 
                      />
                      <span className="text-white w-8 text-right">{analytics.scoreDistribution.gradeF}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-slate-400 text-center py-4">No score distribution data</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
