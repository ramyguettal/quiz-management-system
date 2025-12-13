import { BookOpen, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";

interface NavbarProps {
  userRole: 'admin' | 'instructor' | 'student' | null;
  onLogout: () => void;
}

export function Navbar({ userRole, onLogout }: NavbarProps) {
  return (
    <nav className="bg-[#020617] border-b border-[#1e293b] shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-xl tracking-tight text-foreground">QuizFlow</span>
        </div>
        
        {userRole && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-5 w-5" />
              <span className="capitalize">{userRole}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
