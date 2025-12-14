import { useState } from "react";
import { BookOpen, Clock, Trophy, ListChecks } from "lucide-react";
import { StatsCard } from "../StatsCard";
import { AvailableQuizzes } from "./AvailableQuizzes";
import { PastAttempts } from "./PastAttempts";

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
  onStartQuiz: (quizId: number) => void;
}

export function StudentDashboard({ onNavigate, onStartQuiz }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('available');

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 border-r border-sidebar-border">
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('available')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'available' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'hover:bg-sidebar-accent/50'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Available Quizzes</span>
          </button>
          
          <button
            onClick={() => setActiveTab('attempts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'attempts' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'hover:bg-sidebar-accent/50'
            }`}
          >
            <ListChecks className="h-5 w-5" />
            <span>Past Attempts</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="mb-2">Student Dashboard</h1>
            <p className="text-muted-foreground">View and take quizzes</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Available Quizzes"
              value="5"
              icon={BookOpen}
              description="Ready to take"
            />
            <StatsCard
              title="Completed"
              value="12"
              icon={Trophy}
              description="Total attempts"
            />
            <StatsCard
              title="Average Score"
              value="82%"
              icon={Clock}
              trend="+7% improvement"
            />
          </div>

          {/* Content based on active tab */}
          {activeTab === 'available' && <AvailableQuizzes onStartQuiz={onStartQuiz} />}
          {activeTab === 'attempts' && <PastAttempts />}
        </div>
      </main>
    </div>
  );
}
