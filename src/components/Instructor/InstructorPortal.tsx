import { useState } from 'react';
import InstructorLayout from './InstructorLayout';
import InstructorLogin from './InstructorLogin';
import EnhancedInstructorDashboard from './EnhancedInstructorDashboard';
import InstructorCourses from './InstructorCourses';
import CourseDetail from './CourseDetail';
import EnhancedCreateQuiz from './EnhancedCreateQuiz';
import QuizDetail from './QuizDetail';
import InstructorNotifications from './InstructorNotifications';
import InstructorProfile from './InstructorProfile';

type Page =
  | 'login'
  | 'dashboard'
  | 'courses'
  | 'course-detail'
  | 'create-quiz'
  | 'edit-quiz'
  | 'quiz-detail'
  | 'notifications'
  | 'profile'
  | 'analytics';

interface PageData {
  courseId?: number;
  quizId?: number;
}

export default function InstructorPortal() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [pageData, setPageData] = useState<PageData>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page as Page);
    if (data) {
      setPageData(data);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  // Login page doesn't use layout
  if (currentPage === 'login' || !isLoggedIn) {
    return (
      <InstructorLogin
        onLogin={handleLogin}
        onBackToHome={() => {
          // Navigate to student portal or home
          window.location.href = '/';
        }}
      />
    );
  }

  // All other pages use the layout
  return (
    <InstructorLayout
      currentPage={currentPage}
      onNavigate={(page) => {
        if (page === 'login') {
          handleLogout();
        } else {
          handleNavigate(page);
        }
      }}
    >
      {currentPage === 'dashboard' && (
        <EnhancedInstructorDashboard onNavigate={handleNavigate} />
      )}
      {currentPage === 'courses' && (
        <InstructorCourses onNavigate={handleNavigate} />
      )}
      {currentPage === 'course-detail' && (
        <CourseDetail
          courseId={pageData.courseId}
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('courses')}
        />
      )}
      {currentPage === 'create-quiz' && (
        <EnhancedCreateQuiz
          courseId={pageData.courseId}
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('course-detail', { courseId: pageData.courseId })}
        />
      )}
      {currentPage === 'edit-quiz' && (
        <EnhancedCreateQuiz
          quizId={pageData.quizId}
          courseId={pageData.courseId}
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('course-detail', { courseId: pageData.courseId })}
        />
      )}
      {currentPage === 'quiz-detail' && (
        <QuizDetail
          quizId={pageData.quizId}
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('course-detail', { courseId: pageData.courseId })}
        />
      )}
      {currentPage === 'notifications' && (
        <InstructorNotifications onNavigate={handleNavigate} />
      )}
      {currentPage === 'profile' && (
        <InstructorProfile onNavigate={handleNavigate} />
      )}
    </InstructorLayout>
  );
}
