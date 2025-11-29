import { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
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

interface Question {
  id: number;
  type: 'mcq' | 'short-answer';
  question: string;
  options?: string[];
}

const mockQuestions: Question[] = [
  {
    id: 1,
    type: 'mcq',
    question: 'What is the purpose of useState hook in React?',
    options: [
      'To manage component state',
      'To fetch data from API',
      'To handle side effects',
      'To create context'
    ]
  },
  {
    id: 2,
    type: 'mcq',
    question: 'Which method is used to update state in React?',
    options: [
      'setState()',
      'updateState()',
      'changeState()',
      'modifyState()'
    ]
  },
  {
    id: 3,
    type: 'short-answer',
    question: 'What does JSX stand for?'
  },
  {
    id: 4,
    type: 'mcq',
    question: 'What is the virtual DOM?',
    options: [
      'A lightweight copy of the actual DOM',
      'A database for storing data',
      'A routing mechanism',
      'A state management library'
    ]
  },
  {
    id: 5,
    type: 'mcq',
    question: 'Which hook is used for side effects in React?',
    options: [
      'useEffect',
      'useState',
      'useContext',
      'useReducer'
    ]
  },
];

interface QuizAttemptProps {
  quizId: number;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function QuizAttempt({ quizId, onComplete, onBack }: QuizAttemptProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(2700); // 45 minutes in seconds
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    const score = Math.floor(Math.random() * 30) + 70; // Mock score between 70-100
    onComplete(score);
  };

  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;
  const question = mockQuestions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1>Introduction to React</h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-primary">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {mockQuestions.length}</span>
              <span>{answeredCount}/{mockQuestions.length} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  {currentQuestion + 1}
                </div>
                <h3 className="pt-1">{question.question}</h3>
              </div>
            </div>

            {question.type === 'mcq' && question.options ? (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-all cursor-pointer"
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <Input
                placeholder="Type your answer here..."
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="text-base"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="hover:bg-primary/5 hover:border-primary transition-all"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {mockQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  index === currentQuestion
                    ? 'border-primary bg-primary text-white'
                    : answers[mockQuestions[index].id]
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === mockQuestions.length - 1 ? (
            <Button
              onClick={() => setIsSubmitDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 transition-all"
            >
              <Flag className="h-4 w-4 mr-2" />
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(Math.min(mockQuestions.length - 1, currentQuestion + 1))}
              className="bg-primary hover:bg-primary/90 transition-all"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {mockQuestions.length} questions.
              {answeredCount < mockQuestions.length && (
                <span className="block mt-2 text-destructive">
                  Warning: You have {mockQuestions.length - answeredCount} unanswered question(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
