import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Clock, Users } from "lucide-react";

interface Quiz {
  id: number;
  title: string;
  instructor: string;
  submissions: number;
  status: 'active' | 'scheduled' | 'completed';
  date: string;
}

const mockQuizzes: Quiz[] = [
  { id: 1, title: 'Introduction to React', instructor: 'Jane Smith', submissions: 45, status: 'active', date: '2025-10-25' },
  { id: 2, title: 'Advanced JavaScript', instructor: 'Charlie Brown', submissions: 38, status: 'completed', date: '2025-10-20' },
  { id: 3, title: 'Database Design', instructor: 'Jane Smith', submissions: 0, status: 'scheduled', date: '2025-11-01' },
  { id: 4, title: 'Web Security Basics', instructor: 'Charlie Brown', submissions: 52, status: 'active', date: '2025-10-26' },
  { id: 5, title: 'CSS Fundamentals', instructor: 'Jane Smith', submissions: 41, status: 'completed', date: '2025-10-18' },
];

export function QuizOverview() {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      scheduled: 'secondary',
      completed: 'outline'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div>
          <CardTitle className="text-xl sm:text-2xl mb-2">Quiz Overview</CardTitle>
          <p className="text-sm text-muted-foreground">View all quizzes across the platform</p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz Title</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Submissions
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Date
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>{quiz.title}</TableCell>
                  <TableCell>{quiz.instructor}</TableCell>
                  <TableCell>{quiz.submissions}</TableCell>
                  <TableCell>{quiz.date}</TableCell>
                  <TableCell>{getStatusBadge(quiz.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {mockQuizzes.map((quiz) => (
            <Card key={quiz.id} className="bg-card/50 border hover:border-primary/50 transition-colors">
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-base">{quiz.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1.5">by {quiz.instructor}</p>
                    </div>
                    {getStatusBadge(quiz.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{quiz.submissions} submissions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{quiz.date}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
