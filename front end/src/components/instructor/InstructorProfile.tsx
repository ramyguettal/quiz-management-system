import { useState } from 'react';
import { User, Mail, Lock, Save, Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

interface InstructorProfileProps {
  onNavigate?: (page: string, data?: any) => void;
}

export default function InstructorProfile({ onNavigate }: InstructorProfileProps) {
  const [profileData, setProfileData] = useState({
    name: 'Dr. Fatima Ahmed',
    email: 'fatima.ahmed@university.edu',
    title: 'Associate Professor',
    department: 'Computer Science',
    phone: '+966 50 123 4567',
    bio: 'Experienced educator specializing in database systems and software engineering with over 10 years of teaching experience.',
    office: 'Building A, Room 205'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailSubmissions: true,
    emailDeadlines: true,
    emailEnrollments: false,
    pushNotifications: true
  });

  const handleProfileSave = () => {
    // Simulate save
    toast.success('Profile updated successfully!');
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters!');
      return;
    }
    // Simulate password change
    toast.success('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleNotificationsSave = () => {
    toast.success('Notification preferences updated!');
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-3xl mb-2">Profile Settings</h1>
        <p className="text-slate-400">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Picture */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="relative inline-block">
                  <Avatar className="w-32 h-32 mx-auto">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-600 text-white text-3xl">
                      FA
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <Camera size={18} />
                  </button>
                </div>
              </div>
              <h2 className="text-white text-xl mb-1">{profileData.name}</h2>
              <p className="text-slate-400 text-sm mb-1">{profileData.title}</p>
              <p className="text-slate-500 text-sm">{profileData.department}</p>
              <Separator className="my-4 bg-slate-700" />
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail size={14} />
                  <span className="text-slate-300">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <User size={14} />
                  <span className="text-slate-300">{profileData.office}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-slate-400">
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">Title</Label>
                  <Input
                    id="title"
                    value={profileData.title}
                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-slate-900/30 border-slate-600 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-slate-300">Department</Label>
                  <Input
                    id="department"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="office" className="text-slate-300">Office Location</Label>
                  <Input
                    id="office"
                    value={profileData.office}
                    onChange={(e) => setProfileData({ ...profileData, office: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-300">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500 min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleProfileSave}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
              <CardDescription className="text-slate-400">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-slate-300">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <Button
                onClick={handlePasswordChange}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Lock size={16} className="mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-slate-400">
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Email - New Submissions</p>
                  <p className="text-sm text-slate-400">Get notified when students submit quizzes</p>
                </div>
                <Switch
                  checked={notifications.emailSubmissions}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailSubmissions: checked })
                  }
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Email - Upcoming Deadlines</p>
                  <p className="text-sm text-slate-400">Receive reminders about quiz deadlines</p>
                </div>
                <Switch
                  checked={notifications.emailDeadlines}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailDeadlines: checked })
                  }
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Email - New Enrollments</p>
                  <p className="text-sm text-slate-400">Know when students enroll in your courses</p>
                </div>
                <Switch
                  checked={notifications.emailEnrollments}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailEnrollments: checked })
                  }
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Push Notifications</p>
                  <p className="text-sm text-slate-400">Receive real-time browser notifications</p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, pushNotifications: checked })
                  }
                />
              </div>

              <Button
                onClick={handleNotificationsSave}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save size={16} className="mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
