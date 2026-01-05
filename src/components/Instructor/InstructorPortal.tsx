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
import type { CourseListItem } from '@/types/ApiTypes';

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
  courseId?: string;
  quizId?: string;
  course?: CourseListItem;
}

export default function InstructorPortal() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [pageData, setPageData] = useState<PageData>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [instructorName, setInstructorName] = useState('');
  const [instructorId, setInstructorId] = useState('');

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page as Page);
    if (data) {
      setPageData(data);
    } else {
      // Only reset pageData if explicitly navigating to pages that don't need it
      if (page === 'dashboard' || page === 'courses' || page === 'notifications' || page === 'profile' || page === 'analytics') {
        setPageData({});
      }
    }
  };

  const handleLogin = (id: string, name: string) => {
    setInstructorId(id);
    setInstructorName(name);
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
        <EnhancedInstructorDashboard 
          instructorName={instructorName}
          instructorId={instructorId}
          onNavigate={handleNavigate} 
        />
      )}
      {currentPage === 'courses' && (
        <InstructorCourses 
          instructorId={instructorId}
          onNavigate={handleNavigate} 
        />
      )}
      {currentPage === 'course-detail' && pageData.courseId && (
        <CourseDetail
          courseId={pageData.courseId}
          courseData={pageData.course}
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('courses')}
        />
      )}
      {currentPage === 'create-quiz' && pageData.courseId && (
        <EnhancedCreateQuiz
          courseId={pageData.courseId}
          instructorId={instructorId}
          onNavigate={handleNavigate} 
          onBack={() => handleNavigate('course-detail', { courseId: pageData.courseId })}
        />
      )}
      {currentPage === 'edit-quiz' && pageData.quizId && pageData.courseId && (
        <EnhancedCreateQuiz
          quizId={pageData.quizId}
          courseId={pageData.courseId}
          instructorId={instructorId}
          isEditMode={true}
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('course-detail', { courseId: pageData.courseId })}
        />
      )}
      {currentPage === 'quiz-detail' && pageData.quizId && (
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
