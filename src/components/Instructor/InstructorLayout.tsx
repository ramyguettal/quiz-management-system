import { useState, useEffect } from 'react';
import { Bell, BookOpen, Home, User, LogOut, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { notificationsService } from '@/api/services/NotificationsServices';
import { instructorService } from '@/api/services/InstructorServices';

interface InstructorLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  instructorName?: string;
}

export default function InstructorLayout({
  children,
  currentPage,
  onNavigate,
  instructorName
}: InstructorLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [profileName, setProfileName] = useState<string>(instructorName || '');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationsService.getNotifications();
        // Count unread notifications
        const unreadCount = response.items.filter(n => !n.isRead).length;
        setUnreadNotifications(unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, [currentPage]); // Refetch when page changes

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await instructorService.getProfile();
        setProfileImageUrl(profile.profileImageUrl);
        setProfileName(profile.fullName);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [currentPage]); // Refetch when page changes (in case profile was updated)

  const getInitials = (name: string) => {
    if (!name) return 'IN';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-foreground hover:text-primary transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-foreground">QuizFlow</h1>
                <p className="text-xs text-muted-foreground">Instructor Portal</p>
              </div>
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              onClick={() => onNavigate('notifications')}
              className="relative p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-destructive text-white text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profileImageUrl} />
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(profileName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-foreground text-sm">{profileName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onNavigate('profile')}
                  className="cursor-pointer"
                >
                  <User className="mr-2" size={16} />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onNavigate('login')}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2" size={16} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out mt-[73px] lg:mt-0`}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {item.id === 'notifications' && unreadNotifications > 0 && (
                    <Badge className="ml-auto bg-destructive text-white text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen w-full lg:w-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
