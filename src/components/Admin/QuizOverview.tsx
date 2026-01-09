import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Clock, Loader2 } from "lucide-react";
import apiClient from "../../api/Client";
import { ENDPOINTS } from "../../api/Routes";

interface QuizGroup {
  id: string;
  groupNumber: string;
}

interface QuizItem {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  academicYearName: string;
  availableFromUtc: string;
  availableToUtc: string;
  status: string;
  resultsReleased: boolean;
  questionCount: number;
  groupCount: number;
  groups: QuizGroup[];
  createdAtUtc: string;
  lastModifiedUtc: string;
}

interface QuizListResponse {
  items: QuizItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export function QuizOverview() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<QuizListResponse>(ENDPOINTS.quizzes.list);
        setQuizzes(response.items);
      } catch (err) {
        setError("Failed to fetch quizzes. Please try again.");
        console.error("Error fetching quizzes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const variants: Record<string, any> = {
      draft: 'secondary',
      published: 'default',
      closed: 'outline'
    };
    return <Badge variant={variants[normalizedStatus] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

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
                <TableHead>Course</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Available From
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No quizzes found.
                  </TableCell>
                </TableRow>
              ) : (
                quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell>{quiz.title}</TableCell>
                    <TableCell>{quiz.courseName}</TableCell>
                    <TableCell>{formatDate(quiz.availableFromUtc)}</TableCell>
                    <TableCell>{getStatusBadge(quiz.status)}</TableCell>
                  </TableRow>
                ))
              )}
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
