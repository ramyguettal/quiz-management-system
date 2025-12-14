import { ArrowRight, BookOpen, CheckCircle, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { motion } from "motion/react";

interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-primary p-4 rounded-2xl">
              <BookOpen className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl mb-6 text-foreground">
            Welcome to QuizFlow
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A modern quiz management platform for administrators, instructors, and students. 
            Create, manage, and take quizzes with ease.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 transition-all transform hover:scale-105"
              onClick={() => onNavigate('login')}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {/* Sign Up button removed - only admins can create accounts */}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mt-20 max-w-6xl mx-auto"
        >
          <Card className="border-primary/20 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Separate dashboards for admins, instructors, and students with tailored features
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2">Quiz Management</h3>
              <p className="text-muted-foreground">
                Create, edit, and schedule quizzes with multiple question types and rich text
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2">Analytics & Reports</h3>
              <p className="text-muted-foreground">
                Track performance with detailed analytics and export results to CSV
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
