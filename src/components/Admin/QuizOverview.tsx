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
      <CardHeader>
        <CardTitle>Quiz Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
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
      </CardContent>
    </Card>
  );
}
