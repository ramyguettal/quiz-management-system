import { useState } from "react";
import { BookOpen, LogIn, Mail, Lock, ArrowLeft, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion, AnimatePresence } from "motion/react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjMDZiNmQ0IiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-3xl blur-2xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-cyan-500 to-teal-500 p-6 rounded-3xl">
                <BookOpen className="h-20 w-20 text-white" />
              </div>
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl text-slate-50"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-slate-300"
            >
              Sign in to access your dashboard
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 pt-8 text-left max-w-md mx-auto"
          >
            <div className="flex items-start gap-3 bg-slate-800/30 backdrop-blur-sm p-4 rounded-xl border border-cyan-500/20">
              <div className="bg-cyan-500/20 p-2 rounded-lg flex-shrink-0">
                <BookOpen className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-200">Interactive Quizzes</p>
                <p className="text-sm text-slate-400">Engage with dynamic quiz content</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-slate-800/30 backdrop-blur-sm p-4 rounded-xl border border-teal-500/20">
              <div className="bg-teal-500/20 p-2 rounded-lg flex-shrink-0">
                <Shield className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-slate-200">Real-time Feedback</p>
                <p className="text-sm text-slate-400">Get instant results and explanations</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-slate-800/30 backdrop-blur-sm p-4 rounded-xl border border-cyan-500/20">
              <div className="bg-cyan-500/20 p-2 rounded-lg flex-shrink-0">
                <LogIn className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-200">Track Progress</p>
                <p className="text-sm text-slate-400">Monitor your learning journey</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-cyan-500 to-teal-500 p-4 rounded-2xl">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          <Card className="border-slate-700/50 shadow-2xl bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-3 pb-6">
              <CardTitle className="text-slate-50">Sign In</CardTitle>
              <CardDescription className="text-slate-400">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Tabs for Role Selection */}
              <Tabs defaultValue="student" className="mb-6" onValueChange={(value: string) => setRole(value as 'admin' | 'instructor' | 'student')}>
                <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
                  <TabsTrigger 
                    value="student" 
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-400 hover:bg-white hover:text-slate-900 transition-all font-medium"
                  >
                    Student
                  </TabsTrigger>
                  <TabsTrigger 
                    value="instructor" 
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-400 hover:bg-white hover:text-slate-900 transition-all font-medium"
                  >
                    Instructor
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin" 
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-400 hover:bg-white hover:text-slate-900 transition-all font-medium"
                  >
                    Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <button
                      type="button"
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                      onClick={() => onNavigate('forgot-password')}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked: boolean) => setRememberMe(checked)}
                    className="border-slate-700 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-slate-300 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/30"
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
                      <span className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-800/50 px-2 text-slate-400">
                        Or
                      </span>
                    </div>
                  </div>

                  {/* Register Link - Only visible for Admin */}
                  <div className="text-center">
                    <p className="text-sm text-slate-400">
                      Need to create an admin account?{" "}
                      <button
                        onClick={() => onNavigate('register')}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-slate-500">
              Need help? Contact your system administrator
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
