import { useState } from "react";
import { Pencil, Trash2, Calendar, Users, Eye, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Quiz {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  questions: number;
  submissions: number;
  status: 'active' | 'scheduled' | 'completed';
}

const mockQuizzes: Quiz[] = [
  {
    id: 1,
    title: 'Introduction to React',
    description: 'Test your knowledge of React fundamentals',
    startDate: '2025-10-25',
    endDate: '2025-10-30',
    questions: 20,
    submissions: 45,
    status: 'active'
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    description: 'Deep dive into ES6+ features',
    startDate: '2025-10-15',
    endDate: '2025-10-20',
    questions: 25,
    submissions: 38,
    status: 'completed'
  },
  {
    id: 3,
    title: 'CSS Fundamentals',
    description: 'Master CSS styling techniques',
    startDate: '2025-11-01',
    endDate: '2025-11-05',
    questions: 15,
    submissions: 0,
    status: 'scheduled'
  },
];

export function MyQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const openDeleteDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteQuiz = () => {
    if (selectedQuiz) {
      setQuizzes(quizzes.filter(q => q.id !== selectedQuiz.id));
      setIsDeleteDialogOpen(false);
      setSelectedQuiz(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      scheduled: 'secondary',
      completed: 'outline'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="border-primary/20 hover:border-primary transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="truncate">{quiz.title}</h3>
                  {getStatusBadge(quiz.status)}
                </div>
                <p className="text-muted-foreground mb-4 break-words">{quiz.description}</p>
                
                <div className="hidden sm:flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{quiz.startDate} - {quiz.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{quiz.questions} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{quiz.submissions} submissions</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="sm:hidden hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      {quiz.startDate} - {quiz.endDate}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      {quiz.questions} questions
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="h-4 w-4 mr-2" />
                      {quiz.submissions} submissions
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openDeleteDialog(quiz)}
                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{selectedQuiz?.title}"
              and all associated submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuiz} className="bg-destructive hover:bg-destructive/90">
              Delete Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
