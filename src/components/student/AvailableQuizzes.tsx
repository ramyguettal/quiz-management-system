import { useState } from "react";
import { Calendar, Clock, Eye, Play, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface Quiz {
  id: number;
  title: string;
  instructor: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number;
  questions: number;
  status: 'active' | 'scheduled';
}

const availableQuizzes: Quiz[] = [
  {
    id: 1,
    title: 'Introduction to React',
    instructor: 'Jane Smith',
    description: 'Test your knowledge of React fundamentals including components, props, and state',
    startDate: '2025-10-25',
    endDate: '2025-10-30',
    duration: 45,
    questions: 20,
    status: 'active'
  },
  {
    id: 2,
    title: 'Web Security Basics',
    instructor: 'Charlie Brown',
    description: 'Learn about common security vulnerabilities and best practices',
    startDate: '2025-10-26',
    endDate: '2025-10-31',
    duration: 30,
    questions: 15,
    status: 'active'
  },
  {
    id: 3,
    title: 'Database Design',
    instructor: 'Jane Smith',
    description: 'Understanding relational databases and SQL fundamentals',
    startDate: '2025-11-01',
    endDate: '2025-11-05',
    duration: 60,
    questions: 25,
    status: 'scheduled'
  },
];

interface AvailableQuizzesProps {
  onStartQuiz: (quizId: number) => void;
}

export function AvailableQuizzes({ onStartQuiz }: AvailableQuizzesProps) {
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);

  const toggleExpand = (quizId: number) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  return (
    <div className="space-y-4">
      {availableQuizzes.map((quiz) => (
        <Card key={quiz.id} className="border-primary/20 hover:border-primary transition-all">
          <CardContent className="p-3 sm:p-6">
            {/* Mobile View */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-base font-semibold">{quiz.title}</h3>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {quiz.status === 'active' ? (
                    <Button
                      onClick={() => onStartQuiz(quiz.id)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Play className="h-3 w-3 sm:mr-2" />
                      <span className="hidden sm:inline">Start</span>
                    </Button>
                  ) : (
                    <Button disabled variant="outline" size="sm">
                      Soon
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(quiz.id)}
                    className="p-1"
                  >
                    {expandedQuiz === quiz.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded Details for Mobile */}
              {expandedQuiz === quiz.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={quiz.status === 'active' ? 'default' : 'secondary'}>
                      {quiz.status === 'active' ? 'Active' : 'Scheduled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Instructor:</span> {quiz.instructor}
                  </p>
                  <p className="text-sm text-muted-foreground">{quiz.description}</p>
                  
                  <div className="space-y-1 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{quiz.startDate} - {quiz.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{quiz.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{quiz.questions} questions</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3>{quiz.title}</h3>
                    {quiz.status === 'active' ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Scheduled</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Instructor: {quiz.instructor}</p>
                  <p className="text-muted-foreground mb-4">{quiz.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Available: {quiz.startDate} - {quiz.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{quiz.questions} questions</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  {quiz.status === 'active' ? (
                    <Button
                      onClick={() => onStartQuiz(quiz.id)}
                      className="bg-primary hover:bg-primary/90 transition-all transform hover:scale-105"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz
                    </Button>
                  ) : (
                    <Button disabled variant="outline">
                      Coming Soon
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
