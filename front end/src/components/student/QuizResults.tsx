import { Trophy, CheckCircle, XCircle, Clock, Target } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";

interface QuizResultsProps {
  score: number;
  onBack: () => void;
}

const mockResults = [
  {
    id: 1,
    question: 'What is the purpose of useState hook in React?',
    userAnswer: 'To manage component state',
    correctAnswer: 'To manage component state',
    isCorrect: true,
    explanation: 'useState is a React Hook that lets you add state to functional components.'
  },
  {
    id: 2,
    question: 'Which method is used to update state in React?',
    userAnswer: 'setState()',
    correctAnswer: 'setState()',
    isCorrect: true,
    explanation: 'setState() is the method used to update component state in React.'
  },
  {
    id: 3,
    question: 'What does JSX stand for?',
    userAnswer: 'JavaScript XML',
    correctAnswer: 'JavaScript XML',
    isCorrect: true,
    explanation: 'JSX stands for JavaScript XML. It allows us to write HTML in React.'
  },
  {
    id: 4,
    question: 'What is the virtual DOM?',
    userAnswer: 'A database for storing data',
    correctAnswer: 'A lightweight copy of the actual DOM',
    isCorrect: false,
    explanation: 'The Virtual DOM is a lightweight copy of the actual DOM that React uses to optimize updates.'
  },
  {
    id: 5,
    question: 'Which hook is used for side effects in React?',
    userAnswer: 'useEffect',
    correctAnswer: 'useEffect',
    isCorrect: true,
    explanation: 'useEffect is used to perform side effects in functional components.'
  },
];

export function QuizResults({ score, onBack }: QuizResultsProps) {
  const totalQuestions = mockResults.length;
  const correctAnswers = mockResults.filter(r => r.isCorrect).length;
  const isPassed = score >= 60;

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
                <p className="text-3xl mb-1">{score}%</p>
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
          {mockResults.map((result, index) => (
            <Card key={result.id} className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    result.isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {result.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="mb-3">Question {index + 1}: {result.question}</h4>
                    
                    <div className="space-y-2 mb-3">
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                        <p className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {result.userAnswer}
                        </p>
                      </div>
                      
                      {!result.isCorrect && (
                        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                          <p className="text-sm text-muted-foreground mb-1">Correct Answer:</p>
                          <p className="text-green-700">{result.correctAnswer}</p>
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Explanation:</p>
                      <p className="text-sm text-foreground">{result.explanation}</p>
                    </div>
                  </div>
                </div>
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
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
