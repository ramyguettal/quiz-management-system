import { useState } from "react";
import { BookOpen, UserPlus, ShieldCheck, GraduationCap, Users, ArrowLeft, Mail, Lock, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { motion } from "motion/react";

interface RegisterProps {
  onRegister: (name: string, email: string, password: string, role: 'admin' | 'instructor' | 'student') => void;
  onNavigate: (page: string) => void;
}

export function Register({ onRegister, onNavigate }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<'admin' | 'instructor' | 'student'>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    onRegister(name, email, password, role);
  };

  const roleIcons = {
    admin: ShieldCheck,
    instructor: GraduationCap,
    student: Users
  };

  const RoleIcon = roleIcons[role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjMTRiOGE2IiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        
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
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur-2xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-teal-500 to-cyan-500 p-6 rounded-3xl">
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
              Create powerful quizzes and manage learning
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 pt-8 text-left max-w-md mx-auto"
          >
            <div className="flex items-start gap-3 bg-slate-800/30 backdrop-blur-sm p-4 rounded-xl border border-teal-500/20">
              <div className="bg-teal-500/20 p-2 rounded-lg flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-slate-200">Secure & Reliable</p>
                <p className="text-sm text-slate-400">Admin-controlled account creation</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-slate-800/30 backdrop-blur-sm p-4 rounded-xl border border-cyan-500/20">
              <div className="bg-cyan-500/20 p-2 rounded-lg flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-200">Role-Based Access</p>
                <p className="text-sm text-slate-400">Tailored experiences for each role</p>
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
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-teal-500 to-cyan-500 p-4 rounded-2xl">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          <Card className="border-slate-700/50 shadow-2xl bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-50">Create Account</CardTitle>
                <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-2 rounded-lg border border-teal-500/30">
                  <RoleIcon className="h-5 w-5 text-teal-400" />
                </div>
              </div>
              <CardDescription className="text-slate-400">
                Admin registration - Create a new account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-300">Account Type</Label>
                  <Select value={role} onValueChange={(value: any) => setRole(value)}>
                    <SelectTrigger 
                      id="role" 
                      className="bg-slate-900/50 border-slate-700 text-slate-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                    >
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="student" className="text-slate-200 focus:bg-slate-700 focus:text-slate-50">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-cyan-400" />
                          Student
                        </div>
                      </SelectItem>
                      <SelectItem value="instructor" className="text-slate-200 focus:bg-slate-700 focus:text-slate-50">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-teal-400" />
                          Instructor
                        </div>
                      </SelectItem>
                      <SelectItem value="admin" className="text-slate-200 focus:bg-slate-700 focus:text-slate-50">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-cyan-400" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
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
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
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
                        className="pl-10 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300">Confirm</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-10 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25 transition-all transform hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/30"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full flex items-center justify-center gap-2 text-slate-300 hover:text-teal-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </button>
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg"
          >
            <p className="text-center text-sm text-amber-200/90">
              <ShieldCheck className="inline h-4 w-4 mr-1" />
              Admin Access Required
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}