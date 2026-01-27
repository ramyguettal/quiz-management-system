import { useState, useEffect } from "react";
import { Flag, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { studentService } from "@/api/services/studentService";
import type { QuizDetailResponse, StartQuizSubmissionRequest } from "@/types/ApiTypes";

interface QuizAttemptProps {
  quizId: number;
  onComplete: (submissionId: string) => void;
  onBack: () => void;
}

export function QuizAttempt({ quizId, onComplete, onBack }: QuizAttemptProps) {
  const [quizData, setQuizData] = useState<QuizDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>("");

  // Fetch quiz and start submission on mount
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setLoading(true);
        
        // Fetch quiz details
        const quizDetails = await studentService.getQuizById(quizId.toString());
        setQuizData(quizDetails);
        
        // Start submission
        const startRequest: StartQuizSubmissionRequest = {
          quizId: quizId.toString()
        };
        const startResponse = await studentService.startQuiz(startRequest);
        setSubmissionId(startResponse.submissionId);
        
        toast.success("Quiz started successfully!");
      } catch (error: any) {
        console.error("Failed to start quiz:", error);
        toast.error(error.message || "Failed to start quiz");
        onBack();
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [quizId, onBack]);

  const handleAnswerChange = async (questionId: string, answer: string | string[]) => {
    // Update local state immediately
    setAnswers({ ...answers, [questionId]: answer });
    
    // Save to backend
    try {
      const currentQuestion = quizData?.questions.find(q => q.id === questionId);
      
      if (!currentQuestion || !submissionId) return;

      if (currentQuestion.type === "MultipleChoice") {
        const selectedIds = Array.isArray(answer) ? answer : [answer];
        await studentService.answerMultipleChoice({
          submissionId,
          questionId,
          selectedOptionIds: selectedIds
        });
        toast.success("Answer saved", { duration: 1000 });
      } else if (currentQuestion.type === "ShortAnswer") {
        const answerText = Array.isArray(answer) ? answer[0] : answer;
        await studentService.answerShortAnswer({
          submissionId,
          questionId,
          answerText
        });
        toast.success("Answer saved", { duration: 1000 });
      }
    } catch (error: any) {
      console.error("Failed to save answer:", error);
      toast.error(error.message || "Failed to save answer");
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await studentService.submitQuiz({ submissionId });
      toast.success("Quiz submitted successfully!");
      onComplete(submissionId);
    } catch (error: any) {
      console.error("Failed to submit quiz:", error);
      toast.error(error.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
      setIsSubmitDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load quiz</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quizData.questions.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{quizData.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{quizData.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-lg font-semibold">{answeredCount}/{totalQuestions}</p>
              </div>
              <Button
                onClick={() => setIsSubmitDialogOpen(true)}
                className="bg-primary hover:bg-primary/90"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Flag className="h-4 w-4 mr-2" />
                )}
                Submit Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {quizData.questions.map((question, index) => (
            <Card key={question.id} className="border-primary/20">
              <CardContent className="p-6">
                <div className="mb-6">
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

                {question.type === 'MultipleChoice' && question.options && question.options.length > 0 ? (
                  <RadioGroup
                    value={Array.isArray(answers[question.id]) ? answers[question.id][0] : (answers[question.id] as string) || ''}
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                  >
                    <div className="space-y-3">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-all cursor-pointer"
                        >
                          <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                          <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <Input
                    placeholder="Type your answer here..."
                    value={Array.isArray(answers[question.id]) ? answers[question.id][0] : (answers[question.id] as string) || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="text-base"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onBack}
            className="hover:bg-primary/5 hover:border-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={() => setIsSubmitDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Flag className="h-4 w-4 mr-2" />
            )}
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {totalQuestions} questions.
              {answeredCount < totalQuestions && (
                <span className="block mt-2 text-destructive">
                  Warning: You have {totalQuestions - answeredCount} unanswered question(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Review Answers</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit} 
              className="bg-primary hover:bg-primary/90"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
