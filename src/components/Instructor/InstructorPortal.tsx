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
    console.log('🚀 Navigation triggered:', { 
      from: currentPage, 
      to: page, 
      data: data,
      currentPageData: pageData 
    });
    
    setCurrentPage(page as Page);
    
    if (data) {
      console.log('✅ Setting pageData to:', data);
      setPageData(data);
    } else {
      // Only reset pageData if explicitly navigating to pages that don't need it
      if (page === 'dashboard' || page === 'courses' || page === 'notifications' || page === 'profile' || page === 'analytics') {
        console.log('🗑️ Clearing pageData for page:', page);
        setPageData({});
      } else {
        console.log('⏭️ Keeping existing pageData:', pageData);
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
      onNavigate={(page, data) => {
        console.log('🎯 InstructorLayout.onNavigate called:', { page, data });
        console.log('🆕 NEW CODE IS RUNNING - DATA PARAMETER RECEIVED:', data);
        if (page === 'login') {
          handleLogout();
        } else {
          handleNavigate(page, data);
        }
      }}
    >
      {/* Debug Panel - Shows Current State */}
      <div className="fixed top-20 right-4 bg-red-900/90 border border-red-600 p-4 rounded-lg shadow-lg z-50 max-w-sm">
        <h3 className="text-white font-bold mb-2">🔍 Navigation Debug</h3>
        <div className="text-xs text-white space-y-1 font-mono">
          <p><strong>currentPage:</strong> '{currentPage}'</p>
          <p><strong>pageData.quizId:</strong> {pageData.quizId || 'null/undefined'}</p>
          <p><strong>pageData.courseId:</strong> {pageData.courseId || 'null/undefined'}</p>
          <p><strong>instructorId:</strong> {instructorId || 'null/undefined'}</p>
          <hr className="my-2 border-red-700" />
          <p><strong>Condition Check:</strong></p>
          <p>• currentPage === 'edit-quiz': {String(currentPage === 'edit-quiz')}</p>
          <p>• pageData.quizId exists: {String(!!pageData.quizId)}</p>
          <p>• pageData.courseId exists: {String(!!pageData.courseId)}</p>
          <p>• ALL CONDITIONS MET: {String(currentPage === 'edit-quiz' && !!pageData.quizId && !!pageData.courseId)}</p>
        </div>
      </div>

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
      {/* Fallback when on edit-quiz page but data is missing */}
      {currentPage === 'edit-quiz' && (!pageData.quizId || !pageData.courseId) && (
        <div className="p-6 bg-slate-900 min-h-screen">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="text-6xl">⚠️</div>
            <p className="text-red-400 text-xl font-bold">Missing Required Data</p>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-2">
              <p className="text-slate-300">Page: <span className="text-white font-mono">{currentPage}</span></p>
              <p className="text-slate-300">Quiz ID: <span className="text-white font-mono">{pageData.quizId || '❌ MISSING'}</span></p>
              <p className="text-slate-300">Course ID: <span className="text-white font-mono">{pageData.courseId || '❌ MISSING'}</span></p>
            </div>
            <button 
              onClick={() => handleNavigate('courses')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Back to Courses
            </button>
          </div>
        </div>
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
