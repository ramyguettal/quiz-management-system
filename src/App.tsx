import { useState, useEffect } from "react";
import { EnhancedLogin } from "./components/EnhancedLogin";
import { EnhancedRegister } from "./components/EnhancedRegister";
import { ForgotPassword } from "./components/ForgotPassword";
import { GoogleAuthCallback } from "./components/GoogleAuthCallback";
import { StudentLayout } from "./components/student/StudentLayout";
import { EnhancedStudentDashboard } from "./components/student/EnhancedStudentDashboard";
import { EnhancedAvailableQuizzes } from "./components/student/EnhancedAvailableQuizzes";
import { EnhancedPastAttempts } from "./components/student/EnhancedPastAttempts";
import { StudentNotifications } from "./components/student/StudentNotifications";
import { StudentProfile } from "./components/student/StudentProfile";
import { QuizAttempt } from "./components/student/QuizAttempt";
import { QuizResults } from "./components/student/QuizResults";
import StudentStatistics from "./components/student/StudentStatistics";
import InstructorLayout from "./components/instructor/InstructorLayout";
import EnhancedInstructorDashboard from "./components/instructor/EnhancedInstructorDashboard";
import InstructorCourses from "./components/instructor/InstructorCourses";
import CourseDetail from "./components/instructor/CourseDetail";
import EnhancedCreateQuiz from "./components/instructor/EnhancedCreateQuiz";
import QuizDetail from "./components/instructor/QuizDetail";
import InstructorNotifications from "./components/instructor/InstructorNotifications";
import InstructorProfile from "./components/instructor/InstructorProfile";
import { QuizAnalytics } from "./components/instructor/QuizAnalytics";
import { AdminLayout } from "./components/admin/AdminLayout";
import { SystemOverview } from "./components/admin/SystemOverview";
import { UserManagement } from "./components/admin/UserManagement";
import { QuizOverview } from "./components/admin/QuizOverview";
import { AdminProfile } from "./components/admin/AdminProfile";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { authService } from "./api/services/AuthService";

type Page = 'login' | 'register' | 'forgot-password' | 'google-callback' | 'dashboard' | 'users' | 'quizzes' | 'available-quizzes' | 'history' | 'notifications' | 'profile' | 'quiz-attempt' | 'quiz-results' | 'statistics' | 'courses' | 'course-detail' | 'create-quiz' | 'quiz-detail' | 'analytics';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    // Check if we're on the Google callback route
    if (window.location.pathname === '/auth/google/callback') {
      return 'google-callback';
    }
    return 'login';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'student'>('student');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [pageData, setPageData] = useState<any>(null);

  // Listen for session expiry events from the API client
  useEffect(() => {
    const handleAuthLogout = () => {
      setIsLoggedIn(false);
      setUserRole('student');
      setCurrentPage('login');
      toast.error("Session expired. Please log in again.");
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  const handleLogin = (email: string, password: string, role: 'admin' | 'instructor' | 'student', superAdmin: boolean = false) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setIsSuperAdmin(superAdmin);
    setCurrentPage('dashboard');
    toast.success("Welcome back to QuizFlow!");
  };

  const handleRegister = (name: string, email: string, password: string, role: 'admin' | 'instructor' | 'student') => {
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentPage('dashboard');
    toast.success("Account created successfully! Welcome to QuizFlow!");
  };

  const handleNavigate = async (page: string, data?: any) => {
    if (page === 'logout' || page === 'login') {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
      setIsLoggedIn(false);
      setUserRole('student');
      setIsSuperAdmin(false);
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

  // Render Google OAuth callback page (in popup)
  if (currentPage === 'google-callback') {
    return <GoogleAuthCallback />;
  }

  // Render login/register pages without layout
  if (!isLoggedIn) {
    return (
      <>
        {currentPage === 'login' && (
          <EnhancedLogin onLogin={handleLogin} onNavigate={handleNavigate} />
        )}
        
        {currentPage === 'register' && (
          <EnhancedRegister onRegister={handleRegister} onNavigate={handleNavigate} />
        )}
        
        {currentPage === 'forgot-password' && (
          <ForgotPassword onNavigate={handleNavigate} />
        )}
        
        <Toaster />
      </>
    );
  }

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

          {currentPage === 'notifications' && (
            <InstructorNotifications onNavigate={handleNavigate} />
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
            <UserManagement currentUserRole={isSuperAdmin ? 'superadmin' : 'admin'} />
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
