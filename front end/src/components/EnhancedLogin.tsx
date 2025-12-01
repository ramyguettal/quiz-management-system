import { useState } from "react";
import { BookOpen, LogIn, Mail, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "motion/react";

interface EnhancedLoginProps {
  onLogin: (email: string, password: string, role: 'admin' | 'instructor' | 'student') => void;
  onNavigate: (page: string) => void;
}

export function EnhancedLogin({ onLogin, onNavigate }: EnhancedLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState<'admin' | 'instructor' | 'student'>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      {/* Left Side - 40% */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary/90 via-primary to-primary p-12 flex-col justify-center items-center text-white relative overflow-hidden"
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
              <Tabs defaultValue="student" className="mb-6" onValueChange={(value) => setRole(value as 'admin' | 'instructor' | 'student')}>
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
                      className="pl-10 transition-all focus:border-primary text-gray-900"
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
                      className="pl-10 transition-all focus:border-primary text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
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
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </form>

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