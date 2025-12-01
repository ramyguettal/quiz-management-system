import { Calendar, Trophy, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface Attempt {
  id: number;
  quizTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: string;
  status: 'passed' | 'failed';
}

const pastAttempts: Attempt[] = [
  {
    id: 1,
    quizTitle: 'Advanced JavaScript',
    date: '2025-10-20',
    score: 85,
    totalQuestions: 25,
    correctAnswers: 21,
    timeTaken: '38 min',
    status: 'passed'
  },
  {
    id: 2,
    quizTitle: 'CSS Fundamentals',
    date: '2025-10-18',
    score: 92,
    totalQuestions: 15,
    correctAnswers: 14,
    timeTaken: '22 min',
    status: 'passed'
  },
  {
    id: 3,
    quizTitle: 'HTML Basics',
    date: '2025-10-15',
    score: 78,
    totalQuestions: 20,
    correctAnswers: 16,
    timeTaken: '28 min',
    status: 'passed'
  },
  {
    id: 4,
    quizTitle: 'Node.js Fundamentals',
    date: '2025-10-10',
    score: 58,
    totalQuestions: 30,
    correctAnswers: 17,
    timeTaken: '45 min',
    status: 'failed'
  },
];

export function PastAttempts() {
  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, color: 'text-green-600' };
    if (score >= 60) return { variant: 'secondary' as const, color: 'text-yellow-600' };
    return { variant: 'destructive' as const, color: 'text-red-600' };
  };

  return (
    <div className="space-y-4">
      {pastAttempts.map((attempt) => {
        const badge = getScoreBadge(attempt.score);
        
        return (
          <Card key={attempt.id} className="border-primary/20 hover:border-primary transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3>{attempt.quizTitle}</h3>
                    <Badge variant={badge.variant}>
                      {attempt.status === 'passed' ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{attempt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>{attempt.correctAnswers}/{attempt.totalQuestions} correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Time: {attempt.timeTaken}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-md">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Score</span>
                        <span className={badge.color}>{attempt.score}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            attempt.score >= 80 ? 'bg-green-600' :
                            attempt.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${attempt.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <Button variant="outline" className="hover:bg-primary/5 hover:border-primary transition-all">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
