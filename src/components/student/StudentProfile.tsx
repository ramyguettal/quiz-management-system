import { Camera, Save, User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { studentService } from "../../api/services/studentService";
import type { StudentProfile } from "../../types/ApiTypes";


export function StudentProfile() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);


  const [emailNotifications, setEmailNotifications] = useState(true);  
  const [quizReminders, setQuizReminders] = useState(true);
  const [resultNotifications, setResultNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);


  useEffect(() => {
  const loadProfile = async () => {
    try {
      const profile = await studentService.getProfile();
      setName(profile.fullName);
      setEmail(profile.email);
      setProfileImageUrl(profile.profileImageUrl || null);
      setEmailNotifications(profile.emailNotifications);
    } catch (e: any) {
      if (e.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (e.response?.status === 404) {
        toast.error("Profile not found.");
      } else {
        toast.error("Failed to load profile.");
      }
    }
  };

  loadProfile();
}, []);


  const handleSaveProfile = async () => {
  try {
    await studentService.updateProfile({
      fullName: name,
      emailNotifications,
      profileImage: profileImage ?? undefined,
    });

    toast.success("Profile updated successfully!");
  } catch {
    toast.error("Failed to update profile.");
  }
};


  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters!");
      return;
    }
    
    toast.success("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={
                      profileImage
                        ? URL.createObjectURL(profileImage)
                        : profileImageUrl ?? undefined
                    }
                  />
                  <AvatarFallback className="bg-primary text-white text-2xl">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      id="profile-image"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setProfileImage(e.target.files[0]);
                        }
                      }}
                    />
                    <Button variant="outline" asChild className="gap-2">
                      <label htmlFor="profile-image">
                        <Camera className="h-4 w-4" />
                        Change Photo
                      </label>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG or GIF. Max size 2MB
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed. Contact admin if needed.
                    </p>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quiz-reminders">Quiz Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming quiz deadlines
                    </p>
                  </div>
                  <Switch
                    id="quiz-reminders"
                    checked={quizReminders}
                    onCheckedChange={setQuizReminders}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="result-notifications">Result Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Be notified when quiz results are published
                    </p>
                  </div>
                  <Switch
                    id="result-notifications"
                    checked={resultNotifications}
                    onCheckedChange={setResultNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-digest">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of your quiz activity
                    </p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>

                <Button onClick={() => toast.success("Preferences saved!")} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
