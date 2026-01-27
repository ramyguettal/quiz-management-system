import { useState, useEffect } from "react";
import { EnhancedLogin } from "./components/EnhancedLogin";
import { EnhancedRegister } from "./components/EnhancedRegister";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
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
import { EnhancedSystemOverview } from "./components/admin/EnhancedSystemOverview";
import { UserManagement } from "./components/admin/UserManagement";
import { QuizOverview } from "./components/admin/QuizOverview";
import { AdminProfile } from "./components/admin/AdminProfile";
import { CourseManagement } from "./components/admin/CourseManagement";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { authService } from "./api/services/AuthService";

type Page = 'login' | 'register' | 'forgot-password' | 'google-callback' | 'dashboard' | 'users' | 'quizzes' | 'available-quizzes' | 'history' | 'notifications' | 'profile' | 'quiz-attempt' | 'quiz-results' | 'statistics' | 'courses' | 'course-detail' | 'create-quiz' | 'edit-quiz' | 'quiz-detail' | 'analytics';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    // Check if we're on the Google callback route
    if (window.location.pathname === '/auth/google/callback') {
      return 'google-callback';
    }
    // Check if we're on the reset password route
    if (window.location.pathname === '/reset-password') {
      return 'reset-password';
    }
    return 'login';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'student'>('student');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [pageData, setPageData] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && user.fullName) {
          setIsLoggedIn(true);
          setUserName(user.fullName);
          setUserEmail(user.email);
          setUserId(user.userId);
          const roleMap: Record<string, 'admin' | 'instructor' | 'student'> = {
            'Admin': 'admin',
            'SuperAdmin': 'admin',
            'Instructor': 'instructor',
            'Student': 'student'
          };
          setUserRole(roleMap[user.role] || 'student');
          setIsSuperAdmin(user.role === 'SuperAdmin');
          setCurrentPage('dashboard');
        }
      } catch (error) {
        // User not authenticated, stay on login page
        console.log("Not authenticated");
      }
    };

    checkAuth();
  }, []);

  // Listen for session expiry events from the API client
  useEffect(() => {
    const handleAuthLogout = () => {
      setIsLoggedIn(false);
      setUserRole('student');
      setUserName("");
      setUserEmail("");
      setUserId("");
      setCurrentPage('login');
      toast.error("Session expired. Please log in again.");
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  const handleLogin = (email: string, password: string, role: 'admin' | 'instructor' | 'student', superAdmin: boolean = false, fullName?: string, id?: string) => {
    // Note: The actual login happens in EnhancedLogin component
    // This is called after successful login with the user data
    setIsLoggedIn(true);
    setUserRole(role);
    setIsSuperAdmin(superAdmin);
    setUserEmail(email);
    if (fullName) {
      setUserName(fullName);
    }
    if (id) {
      setUserId(id);
    }
    setCurrentPage('dashboard');
    toast.success("Welcome back to QuizFlow!");
  };

  const handleRegister = (name: string, email: string, password: string, role: 'admin' | 'instructor' | 'student') => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
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
      setUserName("");
      setUserEmail("");
      setUserId("");
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

        {currentPage === 'reset-password' && (
          <ResetPassword onNavigate={handleNavigate} />
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
        <InstructorLayout 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
          instructorName={userName}
        >
          {currentPage === 'dashboard' && (
            <EnhancedInstructorDashboard 
              onNavigate={handleNavigate}
              instructorName={userName}
              instructorId={userId}
            />
          )}

          {currentPage === 'courses' && (
            <InstructorCourses 
              onNavigate={handleNavigate}
              instructorId={userId}
            />
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
              instructorId={userId}
              onBack={() => handleNavigate('courses')}
            />
          )}

          {currentPage === 'edit-quiz' && (
            <EnhancedCreateQuiz 
              onNavigate={handleNavigate} 
              quizId={pageData?.quizId}
              courseId={pageData?.courseId}
              instructorId={userId}
              onBack={() => handleNavigate('course-detail', { courseId: pageData?.courseId })}
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
            <EnhancedSystemOverview />
          )}

          {currentPage === 'users' && (
            <UserManagement currentUserRole={isSuperAdmin ? 'superadmin' : 'admin'} />
          )}

          {currentPage === 'quizzes' && (
            <QuizOverview />
          )}

          {currentPage === 'courses' && (
            <CourseManagement />
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
          <EnhancedAvailableQuizzes 
            onStartQuiz={handleStartQuiz} 
            onBack={() => handleNavigate('dashboard')}
          />
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
