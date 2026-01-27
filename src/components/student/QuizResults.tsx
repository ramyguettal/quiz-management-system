import { useState, useEffect } from "react";
import { Trophy, CheckCircle, XCircle, Clock, Target, Loader2, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { studentService } from "@/api/services/studentService";
import type { QuizSubmissionResults, QuizSubmissionCurrent } from "@/types/ApiTypes";

interface QuizResultsProps {
  submissionId?: string;
  quizId?: string;
  mode?: 'results' | 'review'; // 'results' = graded results, 'review' = read-only view of responses
  onBack: () => void;
}

export function QuizResults({ submissionId, quizId, mode = 'results', onBack }: QuizResultsProps) {
  const [results, setResults] = useState<QuizSubmissionResults | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<QuizSubmissionCurrent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        if (mode === 'review' && quizId) {
          // Fetch current submission for read-only review
          const data = await studentService.getCurrentSubmission(quizId);
          setCurrentSubmission(data);
        } else if (mode === 'results' && submissionId) {
          // Fetch graded results
          const data = await studentService.getSubmissionResults(submissionId);
          setResults(data);
        } else {
          throw new Error('Invalid parameters for QuizResults component');
        }
      } catch (error: any) {
        console.error('Failed to load data:', error);
        toast.error(error.message || "Failed to load quiz data");
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [submissionId, quizId, mode, onBack]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!results && !currentSubmission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load data</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  // Review mode - show read-only responses
  if (mode === 'review' && currentSubmission) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="mb-8 border-2 border-primary bg-primary/5">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="mb-1">{currentSubmission.quizTitle}</h1>
                  <p className="text-muted-foreground">{currentSubmission.quizDescription}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-lg border border-border">
                  <Clock className="h-5 w-5 mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-medium">{new Date(currentSubmission.startedAtUtc).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-border">
                  <Target className="h-5 w-5 mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                  <p className="font-medium">{currentSubmission.questions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Review */}
          <h2 className="mb-4">Your Responses</h2>
          <div className="space-y-4">
            {currentSubmission.questions.map((question, index) => (
              <Card key={question.questionId} className="border-primary/20">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-1">{question.text}</h3>
                        <p className="text-sm text-muted-foreground">{question.points} point{question.points !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>

                  {question.questionType === 'MultipleChoice' && question.options ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-2">Multiple Choice Question</p>
                      {question.options.map((option) => {
                        const isSelected = question.currentSelectedOptionIds?.includes(option.id);
                        
                        return (
                          <div
                            key={option.id}
                            className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border bg-muted/50'
                            }`}
                          >
                            <Checkbox
                              id={`review-option-${option.id}`}
                              checked={isSelected}
                              disabled
                            />
                            <Label htmlFor={`review-option-${option.id}`} className="flex-1">
                              {option.text}
                            </Label>
                          </div>
                        );
                      })}
                      {!question.currentSelectedOptionIds || question.currentSelectedOptionIds.length === 0 && (
                        <p className="text-sm text-muted-foreground italic p-4 bg-muted rounded-lg">
                          No answer provided
                        </p>
                      )}
                    </div>
                  ) : question.questionType === 'ShortAnswer' ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Short Answer Question</p>
                      <div className="p-4 rounded-lg border border-border bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                        <p className="text-base">
                          {question.currentAnswerText || <span className="italic text-muted-foreground">No answer provided</span>}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={onBack}
              size="lg"
              className="bg-primary hover:bg-primary/90 transition-all"
            >
              Back to My Submissions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Results mode - show graded results
  if (!results) return null;

  const totalQuestions = results.totalQuestions;
  const correctAnswers = results.correctAnswers;
  const isPassed = results.percentage >= 60;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Score Summary */}
        <Card className={`mb-8 border-2 ${isPassed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <CardContent className="p-8 text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isPassed ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <Trophy className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="mb-2">{isPassed ? 'Congratulations!' : 'Keep Trying!'}</h1>
            <p className="text-xl text-muted-foreground mb-6">
              {isPassed ? 'You passed the quiz!' : 'You need 60% to pass this quiz.'}
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-card rounded-lg border border-border">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl mb-1">{results.percentage.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-3xl mb-1">{correctAnswers}/{totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl mb-1">38m</p>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <h2 className="mb-4">Detailed Results</h2>
        <div className="space-y-4">
          {results.questions.map((question, index) => {
            const yourAnswerDisplay = Array.isArray(question.yourAnswer) 
              ? question.yourAnswer.join(", ") 
              : question.yourAnswer || "Not answered";
            const correctAnswerDisplay = Array.isArray(question.correctAnswer)
              ? question.correctAnswer.join(", ")
              : question.correctAnswer;
            
            return (
              <Card key={question.id} className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      question.isCorrect ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {question.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="mb-3">Question {index + 1}: {question.questionText}</h4>
                      
                      <div className="space-y-2 mb-3">
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                          <p className={question.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {yourAnswerDisplay}
                          </p>
                        </div>
                        
                        {!question.isCorrect && (
                          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                            <p className="text-sm text-muted-foreground mb-1">Correct Answer:</p>
                            <p className="text-green-700">{correctAnswerDisplay}</p>
                          </div>
                        )}
                      </div>

                      {question.explanation && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-sm text-muted-foreground mb-1">Explanation:</p>
                          <p className="text-sm text-foreground">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={onBack}
            size="lg"
            className="bg-primary hover:bg-primary/90 transition-all"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
