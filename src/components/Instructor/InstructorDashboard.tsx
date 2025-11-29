import { useState } from "react";
import { BookOpen, PlusCircle, BarChart3, Bell, ListChecks } from "lucide-react";
import { StatsCard } from "../StatsCard";
import { MyQuizzes } from "./MyQuizzes";
import { CreateQuiz } from "./CreateQuiz";
import { QuizAnalytics } from "./QuizAnalytics";
import { Notifications } from "./Notifications";

interface InstructorDashboardProps {
  onNavigate: (page: string) => void;
}

export function InstructorDashboard({ onNavigate }: InstructorDashboardProps) {
  const [activeTab, setActiveTab] = useState('quizzes');

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 border-r border-sidebar-border">
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'quizzes' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'hover:bg-sidebar-accent/50'
            }`}
          >
            <ListChecks className="h-5 w-5" />
            <span>My Quizzes</span>
          </button>
          
          <button
            onClick={() => setActiveTab('create')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'create' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'hover:bg-sidebar-accent/50'
            }`}
          >
            <PlusCircle className="h-5 w-5" />
            <span>Create Quiz</span>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'analytics' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'hover:bg-sidebar-accent/50'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'notifications' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'hover:bg-sidebar-accent/50'
            }`}
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="mb-2">Instructor Dashboard</h1>
            <p className="text-muted-foreground">Create and manage your quizzes</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="My Quizzes"
              value="12"
              icon={BookOpen}
              description="5 active, 7 completed"
            />
            <StatsCard
              title="Total Students"
              value="342"
              icon={ListChecks}
              description="Across all quizzes"
            />
            <StatsCard
              title="Average Score"
              value="78%"
              icon={BarChart3}
              trend="+5% from last month"
            />
          </div>

          {/* Content based on active tab */}
          {activeTab === 'quizzes' && <MyQuizzes />}
          {activeTab === 'create' && <CreateQuiz />}
          {activeTab === 'analytics' && <QuizAnalytics />}
          {activeTab === 'notifications' && <Notifications />}
        </div>
      </main>
    </div>
  );
}
