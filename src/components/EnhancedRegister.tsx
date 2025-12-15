import { useState } from "react";
import { BookOpen, UserPlus, Mail, Lock, User as UserIcon, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";

interface EnhancedRegisterProps {
  onRegister: (name: string, email: string, password: string, role: 'admin' | 'instructor' | 'student') => void;
  onNavigate: (page: string) => void;
}

export function EnhancedRegister({ onRegister, onNavigate }: EnhancedRegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<'admin' | 'instructor' | 'student'>('admin'); // Default to admin

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters!");
      return;
    }
    
    if (!email.includes('@')) {
      toast.error("Please enter a valid email address!");
      return;
    }
    
    // Only allow admin registration through this form
    onRegister(name, email, password, 'admin');
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
                <UserPlus className="h-20 w-20 text-white" />
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
              Join QuizFlow
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-slate-300"
            >
              Start your learning journey today
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
                <p className="text-slate-200">500+ Quizzes</p>
                <p className="text-sm text-slate-400">Access thousands of interactive quizzes</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-slate-800/30 backdrop-blur-sm p-4 rounded-xl border border-teal-500/20">
              <div className="bg-teal-500/20 p-2 rounded-lg flex-shrink-0">
                <Shield className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-slate-200">10K+ Students</p>
                <p className="text-sm text-slate-400">Join a thriving learning community</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-slate-800/30 backdrop-blur-sm p-4 rounded-xl border border-cyan-500/20">
              <div className="bg-cyan-500/20 p-2 rounded-lg flex-shrink-0">
                <UserPlus className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-200">95% Success Rate</p>
                <p className="text-sm text-slate-400">Proven track record of excellence</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Register Form */}
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-50">Create Admin Account</CardTitle>
                <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 p-2 rounded-lg border border-cyan-500/30">
                  <UserPlus className="h-5 w-5 text-cyan-400" />
                </div>
              </div>
              <CardDescription className="text-slate-400">
                Register as an administrator to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
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
                  <p className="text-xs text-slate-400">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/30"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              </form>

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

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{" "}
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>

              {/* Terms */}
              <p className="text-xs text-center text-slate-400 mt-6">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Privacy Policy
                </a>
              </p>
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
