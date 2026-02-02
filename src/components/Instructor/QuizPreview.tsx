import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { quizService } from '@/api/services/QuizzServices';
import type { QuizDetailResponse } from '@/types/ApiTypes';
import { toast } from 'sonner';

interface QuizPreviewProps {
  quizId: string;
  onBack: () => void;
}

export default function QuizPreview({ quizId, onBack }: QuizPreviewProps) {
  const [quiz, setQuiz] = useState<QuizDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;
      
      try {
        setIsLoading(true);
        const quizData = await quizService.getQuizDetail(quizId);
        setQuiz(quizData);
      } catch (error: any) {
        console.error('Failed to fetch quiz data:', error);
        toast.error('Failed to load quiz preview');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  if (isLoading) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="text-slate-400">Loading quiz preview...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Quiz not found</p>
          <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700">
        <div className="p-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-slate-400 hover:text-white hover:bg-slate-800 mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Quiz Details
          </Button>

          {/* Quiz Info Header */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl mb-2">{quiz.title}</h1>
                  <p className="text-blue-100 mb-2">{quiz.courseName || 'Unknown Course'}</p>
                  <div className="flex gap-4 text-sm text-blue-50">
                    <span>{quiz.questions?.length || 0} Questions</span>
                    <span>•</span>
                    <span>{quiz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0} Points</span>
                    <span>•</span>
                    <span>Preview Mode</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-yellow-600 text-white">
                    Preview
                  </Badge>
                  <Badge className={
                    quiz.status === 'Published' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-white'
                  }>
                    {quiz.status}
                  </Badge>
                </div>
              </div>
              {quiz.description && (
                <p className="text-blue-50 text-sm">{quiz.description}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quiz Settings Info */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="text-blue-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">Available From</p>
                  <p className="text-white">
                    {new Date(quiz.availableFromUtc).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="text-red-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">Available Until</p>
                  <p className="text-white">
                    {new Date(quiz.availableToUtc).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="text-green-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">Target Groups</p>
                  <p className="text-white">
                    {quiz.groups && quiz.groups.length > 0 
                      ? quiz.groups.map(g => g.groupNumber).join(', ')
                      : 'All Groups'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Settings */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Quiz Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${quiz.shuffleQuestions ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-slate-300">
                  {quiz.shuffleQuestions ? 'Questions Shuffled' : 'Questions in Order'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${quiz.showResultsImmediately ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-slate-300">
                  {quiz.showResultsImmediately ? 'Show Results Immediately' : 'Results Hidden'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${quiz.allowEditAfterSubmission ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-slate-300">
                  {quiz.allowEditAfterSubmission ? 'Allow Edit After Submission' : 'No Edit After Submission'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Preview */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Questions Preview</CardTitle>
            <p className="text-slate-400">
              This is how the quiz will appear to students
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {quiz.questions && quiz.questions.length > 0 ? (
                quiz.questions
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((question, index) => (
                <div key={question.id} className="border border-slate-700 rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-2">{question.text}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Award size={16} />
                          {question.points} point{question.points !== 1 ? 's' : ''}
                        </span>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {question.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Question Options/Answer Area */}
                  <div className="ml-12">
                    {question.type === 'MultipleChoice' && question.options && question.options.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-slate-400 text-sm mb-4">Multiple Choice Options:</p>
                        {question.options.map((option, optIndex) => (
                          <div
                            key={option.id}
                            className={`p-4 rounded-lg border transition-all ${
                              option.isCorrect 
                                ? 'border-green-500 bg-green-500/10 text-green-300' 
                                : 'border-slate-600 bg-slate-700/30 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                option.isCorrect 
                                  ? 'border-green-500 bg-green-500' 
                                  : 'border-slate-500'
                              }`}>
                                {option.isCorrect && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span>{option.text}</span>
                              {option.isCorrect && (
                                <Badge className="bg-green-600 text-white ml-auto">
                                  Correct Answer
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (question.type === 'ShortAnswer' || question.type === 'MultipleChoice') ? (
                      <div className="space-y-3">
                        <p className="text-slate-400 text-sm mb-4">Short Answer Question:</p>
                        <div className="p-4 rounded-lg border border-slate-600 bg-slate-700/30">
                          <p className="text-slate-400 text-sm">Expected Answer:</p>
                          <p className="text-slate-300 font-medium mt-2">
                            {question.expectedAnswer || 'No expected answer provided'}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">No questions available for preview</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}