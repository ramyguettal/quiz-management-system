import { useState } from "react";
import { Users, BookOpen, LayoutDashboard, UserCog, FileText, LogOut } from "lucide-react";
import { StatsCard } from "../StatsCard";
import { UserManagement } from "./UserManagement";
import { QuizOverview } from "./QuizOverview";
import { SystemOverview } from "./SystemOverview";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg">QuizFlow Admin</h1>
              <p className="text-xs text-muted-foreground">Administrator Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('profile')}
              className="hover:opacity-80 transition-opacity"
            >
              <Avatar className="cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('logout')}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 border-r border-sidebar-border">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'overview' 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'hover:bg-sidebar-accent/50'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'users' 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'hover:bg-sidebar-accent/50'
              }`}
            >
              <UserCog className="h-5 w-5" />
              <span>Manage Users</span>
            </button>
            
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'quizzes' 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'hover:bg-sidebar-accent/50'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>View Quizzes</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your quiz platform</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total Users"
                value="1,234"
                icon={Users}
                trend="+12% from last month"
              />
              <StatsCard
                title="Active Quizzes"
                value="89"
                icon={BookOpen}
                trend="+5 new this week"
              />
              <StatsCard
                title="Total Submissions"
                value="4,567"
                icon={FileText}
                trend="+23% increase"
              />
            </div>

            {/* Content based on active tab */}
            {activeTab === 'overview' && <SystemOverview />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'quizzes' && <QuizOverview />}
          </div>
        </main>
      </div>
    </div>
  );
}