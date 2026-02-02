import { useState, useEffect } from 'react';
import { ArrowLeft, Users, FileText, Plus, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { courseService } from '@/api/services/CourseServices';
import { quizService } from '@/api/services/QuizzServices';
import type { Course, Quiz, CourseListItem, CourseStudent, CourseQuizzesResponse } from '@/types/ApiTypes';

interface CourseDetailProps {
  courseId: string;
  courseData?: CourseListItem; // Optional - will fetch if not provided
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

export default function CourseDetail({ courseId, courseData, onNavigate, onBack }: CourseDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseListItem | null>(courseData || null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzesData = async () => {
      if (!courseId) {
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch course details using getCourse API
        const courseResult = await courseService.getCourse(courseId);
        const mappedCourse: CourseListItem = {
          id: courseResult.id,
          title: courseResult.title,
          code: courseResult.code,
          academicYearNumber: courseResult.academicYearNumber,
          studentCount: courseResult.studentCount,
          description: courseResult.description,
          academicYearId: courseResult.academicYearId
        };
        setCourse(mappedCourse);
        
        // Fetch quizzes using the instructor-specific endpoint
        const quizzesData: CourseQuizzesResponse = await quizService.getQuizzesByCourse(courseId);
        
        // Check if quizzes array exists
        if (!quizzesData.quizzes || !Array.isArray(quizzesData.quizzes)) {
          setQuizzes([]);
        } else {
          // Map the API response quizzes to Quiz interface
          const mappedQuizzes: Quiz[] = quizzesData.quizzes.map((item) => {
            return {
              id: item.quizId,
              title: item.title || 'Untitled Quiz',
              description: '',
              courseId: quizzesData.courseId,
              courseName: quizzesData.title,
              academicYearName: '',
              startDate: item.startTime,
              endDate: item.endTime,
              timeLimit: 0,
              attemptLimit: 0,
              totalQuestions: item.questionsCount || 0,
              totalPoints: 0,
              status: (item.status?.toLowerCase() as 'draft' | 'published' | 'archived') || 'draft',
              resultsReleased: false,
              questionCount: item.questionsCount,
              groupCount: 0,
              groups: [],
              settings: {
                shuffleQuestions: false,
                showResultsImmediately: false,
                allowReview: true
              },
              createdAt: item.createdOn,
              updatedAt: item.createdOn,
              attempts: item.attemptsCount || 0
            };
          });
          setQuizzes(mappedQuizzes);
        }
        
      } catch (error: any) {
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStudentsData = async () => {
      if (!courseId) {
        return;
      }
      try {
        const studentsData = await courseService.getInstructorCourseStudents(courseId);
        setStudents(studentsData);
      } catch (error) {
        console.error('Failed to fetch students data:', error);
      }
    }

    fetchQuizzesData();
    fetchStudentsData();

  }, [courseId]);

  const handleDeleteQuiz = (quizId: string) => {
    setQuizToDelete(quizId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    
    try {
      await quizService.deleteQuiz(quizToDelete);
      // Remove from local state
      setQuizzes(quizzes.filter(q => q.id !== quizToDelete));
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="text-slate-400">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-4 sm:p-6 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-400">Course not found</p>
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-900 min-h-screen">
      {/* Back Button */}
      <Button
        onClick={onBack}
        variant="ghost"
        className="text-slate-400 hover:text-white hover:bg-slate-800 mb-4"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Courses
      </Button>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl mb-2">{course.title}</h1>
            <p className="text-blue-100 mb-4">{course.code} • Year {course.academicYearNumber}</p>
            <p className="text-blue-50 max-w-3xl break-words">{course.description}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6">
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span className="text-sm">{students.length} Students</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={20} />
            <span>{quizzes.length} Quizzes</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quizzes" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger
            value="quizzes"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400"
          >
            My Quizzes
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400"
          >
            Students
          </TabsTrigger>
        </TabsList>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div>
                <CardTitle className="text-white">Quizzes</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage all quizzes for this course
                </CardDescription>
              </div>
              <Button
                onClick={() => onNavigate('create-quiz', { courseId: course.id })}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={18} className="mr-2" />
                Add New Quiz
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-400">Quiz Title</TableHead>
                    <TableHead className="text-slate-400 hidden md:table-cell">Available Period</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Questions</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Groups</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!Array.isArray(quizzes) || quizzes.length === 0 ? (
                    <TableRow className="border-slate-700">
                      <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                        {!Array.isArray(quizzes) ? 'Error loading quizzes' : 'No quizzes created yet'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    quizzes.map((quiz) => (
                    <TableRow key={quiz.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white">
                        <div>
                          <p className="font-medium">{quiz.title}</p>
                          {quiz.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{quiz.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 hidden md:table-cell">
                        <div className="text-sm">
                          <div className="text-xs text-slate-500">From:</div>
                          <div>{new Date(quiz.startDate).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500 mt-1">To:</div>
                          <div>{new Date(quiz.endDate).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            quiz.status === 'published'
                              ? 'bg-green-600 text-white'
                              : quiz.status === 'draft'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-slate-600 text-white'
                          }
                        >
                          {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300 hidden lg:table-cell">{quiz.totalQuestions}</TableCell>
                      <TableCell className="text-slate-300 hidden lg:table-cell">
                        {(quiz as any).groupCount || 0}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                            {/* Mobile-only quiz details */}
                            <div className="md:hidden px-2 py-2 space-y-1 border-b border-slate-700 mb-1">
                              <div className="text-xs text-slate-400">
                                <span className="font-medium">From:</span> {new Date(quiz.startDate).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-slate-400">
                                <span className="font-medium">To:</span> {new Date(quiz.endDate).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-slate-400">
                                <span className="font-medium">Questions:</span> {quiz.totalQuestions}
                              </div>
                              <div className="text-xs text-slate-400">
                                <span className="font-medium">Groups:</span> {(quiz as any).groupCount || 0}
                              </div>
                            </div>
                            {/* Actions - always visible */}
                            <DropdownMenuItem
                              onClick={() => onNavigate('quiz-detail', { quizId: quiz.id })}
                              className="hover:bg-slate-700 cursor-pointer focus:bg-slate-700 focus:text-white"
                            >
                              <Eye size={16} className="mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                onNavigate('edit-quiz', { quizId: quiz.id, courseId: courseId });
                              }}
                              className="hover:bg-slate-700 cursor-pointer focus:bg-slate-700 focus:text-white"
                            >
                              <Edit size={16} className="mr-2" />
                              Edit Quiz
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="hover:bg-slate-700 cursor-pointer text-red-400 focus:bg-slate-700 focus:text-red-400"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Enrolled Students</CardTitle>
              <CardDescription className="text-slate-400">
                Students enrolled in this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-400">Student Name</TableHead>
                    <TableHead className="text-slate-400 hidden sm:table-cell">Email</TableHead>
                    <TableHead className="text-slate-400">Quizzes Taken</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow className="border-slate-700">
                      <TableCell colSpan={3} className="text-center text-slate-400 py-8">
                        No students enrolled yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student) => (
                      <TableRow key={student.studentId} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="text-white">
                          <div>
                            <p className="font-medium">{student.fullName}</p>
                            <p className="text-xs text-slate-400 sm:hidden">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300 hidden sm:table-cell">{student.email}</TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-slate-500" />
                            <span>{student.quizzesTaken}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete this quiz. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600 border-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
