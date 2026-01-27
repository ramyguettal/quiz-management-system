import { useState, useEffect } from "react";
import { Trophy, CheckCircle, XCircle, Clock, Target, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { studentService } from "@/api/services/studentService";
import type { QuizSubmissionResults } from "@/types/ApiTypes";

interface QuizResultsProps {
  submissionId: string;
  onBack: () => void;
}

export function QuizResults({ submissionId, onBack }: QuizResultsProps) {
  const [results, setResults] = useState<QuizSubmissionResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await studentService.getSubmissionResults(submissionId);
        setResults(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load results");
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load results</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

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
