import { useState } from "react";
import { EnhancedLogin } from "./components/EnhancedLogin";
import { StudentLayout } from "./components/student/StudentLayout";
import { EnhancedStudentDashboard } from "./components/student/EnhancedStudentDashboard";
import { EnhancedAvailableQuizzes } from "./components/student/EnhancedAvailableQuizzes";
import { EnhancedPastAttempts } from "./components/student/EnhancedPastAttempts";
import { StudentNotifications } from "./components/student/StudentNotifications";
import { StudentProfile } from "./components/student/StudentProfile";
import { QuizAttempt } from "./components/student/QuizAttempt";
import { QuizResults } from "./components/student/QuizResults";
import StudentStatistics from "./components/student/StudentStatistics";
import InstructorLayout from "./components/Instructor/InstructorLayout";
import EnhancedInstructorDashboard from "./components/Instructor/EnhancedInstructorDashboard";
import InstructorCourses from "./components/Instructor/InstructorCourses";
import CourseDetail from "./components/Instructor/CourseDetail";
import EnhancedCreateQuiz from "./components/Instructor/EnhancedCreateQuiz";
import QuizDetail from "./components/Instructor/QuizDetail";
import InstructorNotifications from "./components/Instructor/InstructorNotifications";
import InstructorProfile from "./components/Instructor/InstructorProfile";
import { QuizAnalytics } from "./components/Instructor/QuizAnalytics";
import { AdminLayout } from "./components/Admin/AdminLayout";
import { SystemOverview } from "./components/Admin/SystemOverview";
import { UserManagement } from "./components/Admin/UserManagement";
import { QuizOverview } from "./components/Admin/QuizOverview";
import { AdminProfile } from "./components/Admin/AdminProfile";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { authService } from "./api/services/AuthService";
import { AuthResponse } from "./types/ApiTypes";
type Page = 'login' | 'register' | 'forgot-password' | 'dashboard' | 'users' | 'quizzes' | 'available-quizzes' | 'history' | 'notifications' | 'profile' | 'quiz-attempt' | 'quiz-results' | 'statistics' | 'courses' | 'course-detail' | 'create-quiz' | 'quiz-detail' | 'analytics';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'student'>('student');
  const [currentQuizId, setCurrentQuizId] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [pageData, setPageData] = useState<any>(null);

  const handleNavigate = (page: string, data?: any) => {
    if (page === 'logout' || page === 'login') {
      setIsLoggedIn(false);
      setUserRole('student');
      setCurrentPage('login');
      toast.success("Logged out successfully");
      return;
    }
    setCurrentPage(page as Page);
    if (data) {
      setPageData(data);
    }
  };

  const handleStartQuiz = (quizId: number) => {
    setCurrentQuizId(quizId);
    setCurrentPage('quiz-attempt');
  };

  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    setCurrentPage('quiz-results');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setCurrentQuizId(null);
  };

  const handleViewResult = (attemptId: number) => {
    // Mock viewing a past result
    setQuizScore(85);
    setCurrentPage('quiz-results');
  };

  

  // Render quiz attempt and results without the main layout
  if (currentPage === 'quiz-attempt' || currentPage === 'quiz-results') {
    return (
      <>
        {currentPage === 'quiz-attempt' && currentQuizId && (
          <QuizAttempt
            quizId={currentQuizId}
            onComplete={handleQuizComplete}
            onBack={handleBackToDashboard}
          />
        )}

        {currentPage === 'quiz-results' && (
          <QuizResults score={quizScore} onBack={handleBackToDashboard} />
        )}
        
        <Toaster />
      </>
    );
  }

  // Render Instructor Portal
  if (userRole === 'instructor') {
    return (
      <>
        <InstructorLayout currentPage={currentPage} onNavigate={handleNavigate}>
          {currentPage === 'dashboard' && (
            <EnhancedInstructorDashboard onNavigate={handleNavigate} />
          )}

          {currentPage === 'courses' && (
            <InstructorCourses onNavigate={handleNavigate} />
          )}

          {currentPage === 'course-detail' && (
            <CourseDetail 
              onNavigate={handleNavigate} 
              courseId={pageData?.courseId}
              onBack={() => handleNavigate('courses')}
            />
          )}

          {currentPage === 'create-quiz' && (
            <EnhancedCreateQuiz 
              onNavigate={handleNavigate} 
              courseId={pageData?.courseId}
              onBack={() => handleNavigate('courses')}
            />
          )}

          {currentPage === 'quiz-detail' && (
            <QuizDetail 
              onNavigate={handleNavigate} 
              quizId={pageData?.quizId}
              onBack={() => handleNavigate('courses')}
            />
          )}

          {currentPage === 'analytics' && (
            <QuizAnalytics />
          )}
          {currentPage === 'profile' && (
            <InstructorProfile />
          )}
        </InstructorLayout>
        
        <Toaster />
      </>
    );
  }

  // Render Admin Portal
  if (userRole === 'admin') {
    return (
      <>
        <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
          {currentPage === 'dashboard' && (
            <SystemOverview />
          )}

          {currentPage === 'users' && (
            <UserManagement />
          )}

          {currentPage === 'quizzes' && (
            <QuizOverview />
          )}

          {currentPage === 'profile' && (
            <AdminProfile />
          )}
        </AdminLayout>
        
        <Toaster />
      </>
    );
  }

  // Render Student Portal (default)
  return (
    <>
      <StudentLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === 'dashboard' && (
          <EnhancedStudentDashboard
            onNavigate={handleNavigate}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {currentPage === 'available-quizzes' && (
          <EnhancedAvailableQuizzes onStartQuiz={handleStartQuiz} />
        )}

        {currentPage === 'history' && (
          <EnhancedPastAttempts onViewResult={handleViewResult} />
        )}

        {currentPage === 'notifications' && (
          <StudentNotifications />
        )}

        {currentPage === 'profile' && (
          <StudentProfile />
        )}

        {currentPage === 'statistics' && (
          <StudentStatistics />
        )}
      </StudentLayout>
      
      <Toaster />
    </>
  );
}