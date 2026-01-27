import { useState, useEffect } from "react";
import { BookOpen, Lock, ArrowLeft, CheckCircle2, Shield, Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { authService } from "../api/services/AuthService";
import { toast } from "sonner";

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
}

export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract userId and code from URL parameters
  useEffect(() => {
    const fullUrl = window.location.href;
    
    // Extract parameters using regex to avoid any automatic decoding
    const userIdMatch = fullUrl.match(/[?&]userId=([^&]+)/);
    const codeMatch = fullUrl.match(/[?&]code=([^&]+)/);
    
    let userIdParam = null;
    let codeParam = null;
    
    if (userIdMatch) {
      const rawUserId = userIdMatch[1];
      userIdParam = decodeURIComponent(rawUserId);
    }
    
    if (codeMatch) {
      const rawCode = codeMatch[1];
      
      // Try decoding the raw code
      codeParam = decodeURIComponent(rawCode);
      
      // If decoding introduces spaces, use raw code
      if (codeParam.includes(' ')) {
        codeParam = rawCode;
      }
    }

    if (!userIdParam || !codeParam) {
      setError("Invalid reset link. Please request a new password reset.");
    } else {
      setUserId(userIdParam);
      setCode(codeParam);
    }
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !code) {
      toast.error("Invalid reset link. Please request a new password reset.");
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        UserId: userId,
        Code: code,
        NewPassword: newPassword,
      });
      setIsSubmitted(true);
      toast.success("Password reset successfully!");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to reset password. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show error state if invalid link
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-slate-700/50 shadow-2xl bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-3 pb-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/20 p-4 rounded-full">
                  <Shield className="h-12 w-12 text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-50">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-slate-300">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => onNavigate("forgot-password")}
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
              >
                Request New Reset Link
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate("login")}
                className="w-full text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
                <KeyRound className="h-20 w-20 text-white" />
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
              Reset Password
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-slate-300"
            >
              Create a new secure password for your account
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
                <Lock className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-200">Strong Password</p>
                <p className="text-sm text-slate-400">Use at least 8 characters with mixed case</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-slate-800/30 backdrop-blur-sm p-4 rounded-xl border border-teal-500/20">
              <div className="bg-teal-500/20 p-2 rounded-lg flex-shrink-0">
                <Shield className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-slate-200">Secure Process</p>
                <p className="text-sm text-slate-400">Your password is encrypted and protected</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Reset Password Form */}
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
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onNavigate("login")}
                        className="text-slate-400 hover:text-white hover:bg-slate-700/50 -ml-2"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-50">
                          Create New Password
                        </CardTitle>
                        <CardDescription className="text-slate-300">
                          Enter your new password below
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-slate-200">
                          New Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-600/50"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-slate-200">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-600/50"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-slate-300">Password Requirements:</p>
                        <ul className="text-xs text-slate-400 space-y-1">
                          <li className={newPassword.length >= 8 ? "text-green-400" : ""}>
                            • At least 8 characters
                          </li>
                          <li className={/[A-Z]/.test(newPassword) ? "text-green-400" : ""}>
                            • One uppercase letter
                          </li>
                          <li className={/[a-z]/.test(newPassword) ? "text-green-400" : ""}>
                            • One lowercase letter
                          </li>
                          <li className={/[0-9]/.test(newPassword) ? "text-green-400" : ""}>
                            • One number
                          </li>
                          <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-green-400" : ""}>
                            • One special character
                          </li>
                        </ul>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading || !newPassword || !confirmPassword}
                        className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-medium py-5 text-base transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-3 pb-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="flex justify-center mb-4"
                    >
                      <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-full">
                        <CheckCircle2 className="h-12 w-12 text-white" />
                      </div>
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-slate-50">
                      Password Reset Successful!
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Your password has been updated. You can now log in with your new password.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => onNavigate("login")}
                      className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-medium py-5 text-base"
                    >
                      Continue to Login
                    </Button>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
