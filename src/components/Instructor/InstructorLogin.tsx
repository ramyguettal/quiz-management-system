import { useState } from 'react';
import { BookOpen, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import{authService} from '../../api/services/AuthService';
import { AuthResponse, User } from '../../types/ApiTypes';
interface InstructorLoginProps {
  onLogin: (response : AuthResponse) => void;
  onBackToHome?: () => void;
}
export default function InstructorLogin({ onLogin, onBackToHome }: InstructorLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Attempt login via service
      const response = await authService.login({ 
        email, 
        password 
      });

      // 2. Security Check: Ensure user is actually an instructor
      if (response.role !== 'Instructor') {
        throw new Error('Access denied. This portal is for instructors only.');
      }
      onLogin(response);

    } catch (err: any) {
      console.error('Login failed:', err);
      // Extract error message from API response or fallback to generic
      const errorMessage = err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-slate-900/50 backdrop-blur-sm p-12 flex-col justify-center items-start relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-white text-3xl">QuizFlow</h1>
              <p className="text-primary-foreground/80 text-sm">Instructor Portal</p>
            </div>
          </div>
          
          <h2 className="text-white text-4xl mb-4">
            Manage Your Quizzes with Ease
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Create engaging assessments, track student performance, and manage your courses all in one powerful platform.
          </p>
          
          <div className="space-y-4 text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <p>Build comprehensive quizzes with multiple question types</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <p>Monitor student progress and performance analytics</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <p>Organize courses and manage submissions efficiently</p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-12 right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-12 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Back Button */}
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Student Login</span>
            </button>
          )}

          {/* Login Card */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
            <div className="mb-8">
              <h2 className="text-white text-3xl mb-2">Welcome Back</h2>
              <p className="text-slate-400">Sign in to access your instructor dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="instructor@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-slate-600"
                  />
                  <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                Sign In
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                Having trouble? Contact{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
