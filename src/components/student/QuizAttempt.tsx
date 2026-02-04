import { useState, useEffect } from "react";
import { Flag, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
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
import { quizService } from "@/api/services/QuizzServices";
import type { QuizDetailResponse, StartQuizSubmissionRequest } from "@/types/ApiTypes";

interface QuizAttemptProps {
  quizId: string;
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

  // Helper function to get storage key for submission
  const getSubmissionStorageKey = () => `quiz_submission_${quizId}`;

  // Helper function to set submission ID with localStorage backup
  const setSubmissionIdWithStorage = (id: string) => {
    setSubmissionId(id);
    if (id && id.trim() !== "" && id !== "000000000") {
      localStorage.setItem(getSubmissionStorageKey(), id);
    }
  };

  // Helper function to clear submission from storage
  const clearSubmissionFromStorage = () => {
    localStorage.removeItem(getSubmissionStorageKey());
  };

  // Try to restore submission ID from storage on mount
  useEffect(() => {
    const storedSubmissionId = localStorage.getItem(getSubmissionStorageKey());
    if (storedSubmissionId && storedSubmissionId.trim() !== "" && storedSubmissionId !== "000000000") {
      console.log("Restored submission ID from storage:", storedSubmissionId);
      setSubmissionId(storedSubmissionId);
    }
  }, [quizId]);

  // Fetch quiz and start/resume submission on mount
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setLoading(true);
        
        // Check if we already have a submission ID from localStorage
        const storedSubmissionId = localStorage.getItem(getSubmissionStorageKey());
        if (storedSubmissionId && storedSubmissionId.trim() !== "" && storedSubmissionId !== "000000000") {
          console.log("Using stored submission ID:", storedSubmissionId);
        }
        
        // First, check if there's an existing in-progress submission
        try {
          const currentSubmission = await studentService.getCurrentSubmission(quizId);
          
          // If we have a current submission, use it to resume
          if (currentSubmission && currentSubmission.submissionId) {
            console.log("Found current submission:", currentSubmission.submissionId);
            
            if (!currentSubmission.submissionId || currentSubmission.submissionId.trim() === "") {
              throw new Error("Invalid current submission ID from server");
            }
            
            setSubmissionIdWithStorage(currentSubmission.submissionId);
            
            // Transform CurrentQuizQuestion to QuizDetailResponse format
            const quizData: QuizDetailResponse = {
              id: currentSubmission.quizId,
              title: currentSubmission.quizTitle,
              description: currentSubmission.quizDescription,
              questions: currentSubmission.questions.map(q => ({
                id: q.questionId,
                text: q.text,
                type: q.questionType as 'MultipleChoice' | 'ShortAnswer',
                points: q.points,
                order: q.order,
                options: q.options?.map(opt => ({
                  id: opt.id,
                  text: opt.text,
                  isCorrect: false // Not exposed in current submission
                })),
                correctAnswer: q.expectedAnswer
              })),
              // Add default values for other required fields
              courseId: '',
              courseName: '',
              availableFromUtc: currentSubmission.startedAtUtc,
              availableToUtc: '',
              shuffleQuestions: false,
              showResultsImmediately: false,
              allowEditAfterSubmission: currentSubmission.allowEditAfterSubmission,
              status: 'Active',
              resultsReleased: false,
              groups: [],
              createdAtUtc: currentSubmission.startedAtUtc,
              lastModifiedUtc: currentSubmission.startedAtUtc
            };
            
            setQuizData(quizData);
            
            // Restore previous answers from the current submission
            const restoredAnswers: Record<string, string | string[]> = {};
            currentSubmission.questions.forEach(question => {
              if (question.currentSelectedOptionIds && question.currentSelectedOptionIds.length > 0) {
                // For multiple choice, store the selected option IDs
                restoredAnswers[question.questionId] = question.currentSelectedOptionIds;
              } else if (question.currentAnswerText) {
                // For short answer, store the text
                restoredAnswers[question.questionId] = question.currentAnswerText;
              }
            });
            setAnswers(restoredAnswers);
            
            toast.success("Resuming your quiz attempt");
            setLoading(false);
            return;
          }
        } catch (currentSubmissionError: any) {
          // No current submission found (404), proceed to start a new one
          console.log("No current submission found, starting new one");
        }
        
        // Fetch quiz details using quizService.getQuizDetail
        const quizDetails = await quizService.getQuizDetail(quizId);
        setQuizData(quizDetails);
        
        // Start submission
        const startRequest: StartQuizSubmissionRequest = {
          quizId: quizId
        };
        const startResponse = await studentService.startQuiz(startRequest);
        console.log("Start quiz response:", startResponse);
        
        if (!startResponse || startResponse.trim() === "") {
          throw new Error("Invalid submission ID received from server");
        }
        
        setSubmissionIdWithStorage(startResponse);
        console.log("Submission ID set to:", startResponse);
        
        toast.success("Quiz started successfully!");
      } catch (error: any) {
        console.error("Failed to start quiz:", error);
        console.error("Error details:", error.response?.data);
        
        // Show detailed error message
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.title
          || error.message 
          || "Failed to start quiz";
        
        toast.error(`Cannot start quiz: ${errorMessage}`, {
          duration: 5000,
          description: error.response?.data?.detail || "Please check if the quiz is active and you haven't already submitted it."
        });
        
        // Don't redirect immediately - let user see the error
        setTimeout(() => {
          onBack();
        }, 3000);
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
      
      if (!currentQuestion) {
        console.error("Question not found:", questionId);
        return;
      }
      
      if (!submissionId || submissionId.trim() === "" || submissionId === "000000000") {
        console.error("Invalid submission ID when saving answer:", submissionId);
        toast.error("Cannot save answer: Invalid submission. Please refresh and try again.");
        return;
      }

      if (currentQuestion.type === "MultipleChoice") {
        const selectedIds = Array.isArray(answer) ? answer : [answer];
        console.log("Saving multiple choice answer:", { submissionId, questionId, selectedIds });
        await studentService.answerMultipleChoice({
          submissionId,
          questionId,
          selectedOptionIds: selectedIds
        });
        toast.success("Answer saved", { duration: 1000 });
      } else if (currentQuestion.type === "ShortAnswer") {
        const answerText = Array.isArray(answer) ? answer[0] : answer;
        console.log("Saving short answer:", { submissionId, questionId, answerText });
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

  const handleCheckboxChange = async (questionId: string, optionId: string, checked: boolean) => {
    const currentAnswers = answers[questionId];
    const currentSelected = Array.isArray(currentAnswers) ? currentAnswers : [];
    
    let newSelected: string[];
    if (checked) {
      // Add option to selected list
      newSelected = [...currentSelected, optionId];
    } else {
      // Remove option from selected list
      newSelected = currentSelected.filter(id => id !== optionId);
    }
    
    // Update and save
    await handleAnswerChange(questionId, newSelected);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Validate submission ID before attempting submit
      if (!submissionId || submissionId.trim() === "" || submissionId === "000000000") {
        console.error("Invalid submission ID:", submissionId);
        toast.error("Invalid submission ID. Please refresh and try again.");
        return;
      }
      
      await studentService.submitQuiz({ submissionId });
      
      // Clear submission from storage after successful submission
      clearSubmissionFromStorage();
      
      toast.success("Quiz submitted successfully!");
      onComplete(submissionId);
    } catch (error: any) {
      console.error("Failed to submit quiz:", error);
      console.error("Submission ID was:", submissionId);
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
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-2">
                      Select one or more options
                    </p>
                    {question.options.map((option) => {
                      const currentAnswers = answers[question.id];
                      const selectedOptions = Array.isArray(currentAnswers) ? currentAnswers : [];
                      const isChecked = selectedOptions.includes(option.id);
                      
                      return (
                        <div
                          key={option.id}
                          className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-all cursor-pointer"
                          onClick={() => handleCheckboxChange(question.id, option.id, !isChecked)}
                        >
                          <Checkbox
                            id={`option-${option.id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleCheckboxChange(question.id, option.id, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ) : question.type === 'ShortAnswer' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Type your answer below
                    </p>
                    <Input
                      placeholder="Type your answer here..."
                      value={Array.isArray(answers[question.id]) ? answers[question.id][0] : (answers[question.id] as string) || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="text-base"
                    />
                  </div>
                ) : null}
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
            disabled={submitting || !submissionId || submissionId.trim() === "" || submissionId === "000000000"}
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
