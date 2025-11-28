import { useState } from 'react';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import InstructorPortal from './InstructorPortal';
import { EnhancedLogin } from '../EnhancedLogin';

export default function InstructorDemo() {
  const [showPortal, setShowPortal] = useState(false);
  const [showStudentLogin, setShowStudentLogin] = useState(false);

  if (showStudentLogin) {
    return <EnhancedLogin onLogin={() => {}} onNavigate={() => setShowStudentLogin(false)} />;
  }

  if (showPortal) {
    return <InstructorPortal />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={36} />
            </div>
            <h1 className="text-white text-5xl">QuizFlow</h1>
          </div>
          <p className="text-slate-300 text-xl mb-2">Online Quiz Management System</p>
          <p className="text-slate-400">Choose your portal to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instructor Portal Card */}
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 hover:border-blue-600 transition-all cursor-pointer group">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="text-white" size={40} />
                </div>
                <h2 className="text-white text-2xl mb-3">Instructor Portal</h2>
                <p className="text-slate-400 mb-6">
                  Create quizzes, manage courses, and track student performance
                </p>
                <ul className="text-left space-y-2 mb-6 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Dashboard with course statistics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Quiz builder with multiple question types</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Student performance analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Course and submission management</span>
                  </li>
                </ul>
                <Button
                  onClick={() => setShowPortal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Enter Instructor Portal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Student Portal Card */}
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 hover:border-purple-600 transition-all cursor-pointer group">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="text-white" size={40} />
                </div>
                <h2 className="text-white text-2xl mb-3">Student Portal</h2>
                <p className="text-slate-400 mb-6">
                  Take quizzes, view results, and track your academic progress
                </p>
                <ul className="text-left space-y-2 mb-6 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Browse available quizzes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Interactive quiz interface with timer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>View grades and attempt history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Notifications and profile settings</span>
                  </li>
                </ul>
                <Button
                  onClick={() => setShowStudentLogin(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Enter Student Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Demo Application • All features are fully functional with mock data
          </p>
        </div>
      </div>
    </div>
  );
}
