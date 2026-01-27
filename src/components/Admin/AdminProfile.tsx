import { useState } from "react";
import { Lock, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { authService } from "../../api/services/AuthService";

export function AdminProfile() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // TODO: Get actual user data from auth context
  const name = "Admin User";
  const email = "admin@quizflow.com";

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast.error("Please enter your current password!");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters!");
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await authService.updatePassword({
        currentPassword,
        newPassword
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2">Admin Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Your avatar</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src="" />
              <AvatarFallback className="text-3xl bg-primary text-white">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-primary">
                <Shield className="h-3 w-3" />
                Administrator
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="md:col-span-3 bg-muted/50">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Account Type</span>
              <span className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Administrator
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium">January 15, 2024</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Last Login</span>
              <span className="font-medium">November 24, 2025</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Account Status</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
