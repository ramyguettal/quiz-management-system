import { useState, useEffect } from "react";
import { BookOpen, LogIn, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "motion/react";
import { authService } from "../api/services/AuthService";
import { toast } from "sonner";

const REMEMBERED_EMAIL_KEY = 'rememberedEmail';
const REMEMBER_ME_KEY = 'rememberMeChecked';

// Google Icon SVG component
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

interface EnhancedLoginProps {
  onLogin: (email: string, password: string, role: 'admin' | 'instructor' | 'student', isSuperAdmin?: boolean, userName?: string, userId?: string) => void;
  onNavigate: (page: string) => void;
}

export function EnhancedLogin({ onLogin, onNavigate }: EnhancedLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState<'admin' | 'instructor' | 'student'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Load remembered email and remember me preference on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    const rememberMePreference = localStorage.getItem(REMEMBER_ME_KEY);
    
    if (rememberMePreference === 'true') {
      setRememberMe(true);
      if (rememberedEmail) {
        setEmail(rememberedEmail);
      }
    }
  }, []);

  // Generate or retrieve a unique device ID for this browser
  const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await authService.loginWithGoogle();
      
      // Determine role from response
      const roleFromResponse = response.role?.toLowerCase();
      const isSuperAdmin = response.role === 'SuperAdmin';
      
      // Map role to valid user role
      let mappedRole: 'admin' | 'instructor' | 'student';
      if (isSuperAdmin || roleFromResponse === 'admin') {
        mappedRole = 'admin';
      } else if (roleFromResponse === 'instructor') {
        mappedRole = 'instructor';
      } else {
        mappedRole = 'student';
      }
      
      toast.success(`Welcome back, ${response.fullName || response.email}!`);
      onLogin(response.email, '', mappedRole, isSuperAdmin, response.fullName, response.userId);
    } catch (error: any) {
      toast.error(error?.message || 'Google Sign In failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
     try {
        const deviceId = getDeviceId();
        const response = await authService.login({ email, password, deviceId });
        
        // Handle remember me - save or remove email and preference from localStorage
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
          localStorage.setItem(REMEMBER_ME_KEY, 'true');
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
          localStorage.setItem(REMEMBER_ME_KEY, 'false');
        }
        
        const isSuperAdmin = response.role === 'SuperAdmin';
        // Map SuperAdmin to admin for navigation purposes
        const userRole = response.role.toLowerCase() === 'superadmin' 
          ? 'admin' 
          : response.role.toLowerCase() as 'admin' | 'instructor' | 'student';
        toast.success(`Welcome back, ${response.fullName}!`);
        onLogin(email, password, userRole, isSuperAdmin, response.fullName, response.userId);
      } catch (error: any) {
        const errorMessage = error?.message || 'Login failed. Please check your credentials.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      {/* Left Side - 40% */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-center items-center text-white relative overflow-hidden"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48" />
        
        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
              <BookOpen className="h-20 w-20" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="mb-4 text-white">QuizFlow</h1>
          <h2 className="mb-6 text-white/90">Interactive Learning Platform</h2>
          
          {/* Tagline */}
          <p className="text-xl mb-8 text-white/80 max-w-md">
            Join to take interactive quizzes and track your learning progress
          </p>
          
          {/* Features */}
          <div className="space-y-4 text-left max-w-md">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                ✓
              </div>
              <div>
                <p className="text-white">Interactive Quizzes</p>
                <p className="text-sm text-white/70">Engage with dynamic quiz content</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                ✓
              </div>
              <div>
                <p className="text-white">Real-time Feedback</p>
                <p className="text-sm text-white/70">Get instant results and explanations</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                ✓
              </div>
              <div>
                <p className="text-white">Track Progress</p>
                <p className="text-sm text-white/70">Monitor your learning journey</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side - 60% */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="border-primary/20 shadow-2xl">
            <CardContent className="p-8">
              {/* Mobile Logo */}
              <div className="flex lg:hidden justify-center mb-6">
                <div className="bg-primary p-4 rounded-xl">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="mb-2">Welcome Back</h2>
                <p className="text-muted-foreground">Sign in to access your dashboard</p>
              </div>

              {/* Tabs for Role Selection */}
              <Tabs defaultValue="student" className="mb-6" onValueChange={(value: string) => setRole(value as 'admin' | 'instructor' | 'student')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 transition-all focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline transition-all"
                      onClick={() => onNavigate('forgot-password')}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 transition-all focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked: boolean) => setRememberMe(checked)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 transition-all transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full transition-all transform hover:scale-[1.02]"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span className="ml-2">Sign in with Google</span>
                  </>
                )}
              </Button>

              {/* Show register option only for admin users */}
              {role === 'admin' && (
                <>
                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  {/* Register Link - Only visible for Admin */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Need to create an admin account?{" "}
                      <button
                        onClick={() => onNavigate('register')}
                        className="text-primary hover:underline transition-all"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
