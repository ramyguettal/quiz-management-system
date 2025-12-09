import { useState } from 'react';
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

interface CourseDetailProps {
  courseId?: number;
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

export default function CourseDetail({ courseId = 1, onNavigate, onBack }: CourseDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);

  const course = {
    id: courseId,
    name: 'Advanced Database Systems',
    code: 'CS501',
    semester: 'Fall 2024',
    enrolledStudents: 42,
    description:
      'This course covers advanced concepts in database design, query optimization, transaction management, and distributed databases. Students will learn about NoSQL databases, data warehousing, and modern database architectures.',
  };

  const quizzes = [
    {
      id: 1,
      title: 'Database Normalization Quiz',
      createdOn: '2024-10-15',
      status: 'Published',
      attempts: 38,
      questions: 15,
      duration: 30
    },
    {
      id: 2,
      title: 'SQL Queries Midterm',
      createdOn: '2024-10-20',
      status: 'Published',
      attempts: 42,
      questions: 20,
      duration: 45
    },
    {
      id: 3,
      title: 'Transaction Management',
      createdOn: '2024-10-25',
      status: 'Draft',
      attempts: 0,
      questions: 12,
      duration: 25
    },
    {
      id: 4,
      title: 'NoSQL Databases',
      createdOn: '2024-10-28',
      status: 'Draft',
      attempts: 0,
      questions: 10,
      duration: 20
    }
  ];

  const students = [
    { id: 1, name: 'Ahmed Ali', email: 'ahmed@university.edu', quizzesTaken: 2, avgScore: 85 },
    { id: 2, name: 'Sara Mohammed', email: 'sara@university.edu', quizzesTaken: 2, avgScore: 92 },
    { id: 3, name: 'Omar Hassan', email: 'omar@university.edu', quizzesTaken: 1, avgScore: 78 },
    { id: 4, name: 'Layla Ibrahim', email: 'layla@university.edu', quizzesTaken: 2, avgScore: 88 }
  ];

  const handleDeleteQuiz = (quizId: number) => {
    setQuizToDelete(quizId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // Handle delete logic here
    console.log('Deleting quiz:', quizToDelete);
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl mb-2">{course.name}</h1>
            <p className="text-blue-100 mb-4">{course.code} • {course.semester}</p>
            <p className="text-blue-50 max-w-3xl">{course.description}</p>
          </div>
        </div>
        <div className="flex gap-6 mt-6">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <span>{course.enrolledStudents} Students</span>
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
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
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
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-400">Quiz Title</TableHead>
                    <TableHead className="text-slate-400">Created On</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Questions</TableHead>
                    <TableHead className="text-slate-400">Attempts</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white">
                        <div>
                          <p>{quiz.title}</p>
                          <p className="text-xs text-slate-500">{quiz.duration} minutes</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{quiz.createdOn}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            quiz.status === 'Published'
                              ? 'bg-green-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }
                        >
                          {quiz.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{quiz.questions}</TableCell>
                      <TableCell className="text-slate-300">{quiz.attempts}</TableCell>
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
                            <DropdownMenuItem
                              onClick={() => onNavigate('quiz-detail', { quizId: quiz.id })}
                              className="hover:bg-slate-700 cursor-pointer focus:bg-slate-700 focus:text-white"
                            >
                              <Eye size={16} className="mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onNavigate('edit-quiz', { quizId: quiz.id })}
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
                  ))}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-400">Student Name</TableHead>
                    <TableHead className="text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-400">Quizzes Taken</TableHead>
                    <TableHead className="text-slate-400">Avg Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white">{student.name}</TableCell>
                      <TableCell className="text-slate-300">{student.email}</TableCell>
                      <TableCell className="text-slate-300">{student.quizzesTaken}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            student.avgScore >= 85
                              ? 'bg-green-600 text-white'
                              : student.avgScore >= 70
                              ? 'bg-yellow-600 text-white'
                              : 'bg-red-600 text-white'
                          }
                        >
                          {student.avgScore}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Course Settings</CardTitle>
              <CardDescription className="text-slate-400">
                Manage course configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Course settings coming soon...</p>
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
