import { useState, useEffect } from 'react';
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
import { instructorService, type InstructorProfile as InstructorProfileType } from '@/api/services/InstructorServices';

interface InstructorProfileProps {
  onNavigate?: (page: string, data?: any) => void;
}

export default function InstructorProfile({ onNavigate }: InstructorProfileProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    title: '',
    department: '',
    phone: '',
    bio: '',
    office: '',
    profileImageUrl: '',
    emailNotifications: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await instructorService.getProfile();
        setProfileData({
          name: profile.fullName,
          email: profile.email,
          title: profile.title,
          department: profile.department,
          phone: profile.phoneNumber,
          bio: profile.bio,
          office: profile.officeLocation,
          profileImageUrl: profile.profileImageUrl,
          emailNotifications: profile.emailNotifications,
        });
        setPreviewUrl(profile.profileImageUrl);
      } catch (error: any) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const [notifications, setNotifications] = useState({
    emailSubmissions: true,
    emailDeadlines: true,
    emailEnrollments: false,
    pushNotifications: true
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    try {
      setIsSaving(true);
      await instructorService.updateProfile({
        fullName: profileData.name,
        title: profileData.title,
        phoneNumber: profileData.phone,
        department: profileData.department,
        officeLocation: profileData.office,
        bio: profileData.bio,
        emailNotifications: profileData.emailNotifications,
        profileImage: profileImage || undefined,
      });
      toast.success('Profile updated successfully!');
      setProfileImage(null);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
                    <AvatarImage src={previewUrl} />
                    <AvatarFallback className="bg-blue-600 text-white text-3xl">
                      {getInitials(profileData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="profile-image" className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer">
                    <Camera size={18} />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
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
                disabled={isSaving}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <Save size={16} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
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
                  <p className="text-white">Email Notifications</p>
                  <p className="text-sm text-slate-400">Receive email notifications for important updates</p>
                </div>
                <Switch
                  checked={profileData.emailNotifications}
                  onCheckedChange={(checked: boolean) =>
                    setProfileData({ ...profileData, emailNotifications: checked })
                  }
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Email - New Submissions</p>
                  <p className="text-sm text-slate-400">Get notified when students submit quizzes</p>
                </div>
                <Switch
                  checked={notifications.emailSubmissions}
                  onCheckedChange={(checked: boolean) =>
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
                  onCheckedChange={(checked: boolean) =>
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
                  onCheckedChange={(checked: boolean) =>
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
                  onCheckedChange={(checked: boolean) =>
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
