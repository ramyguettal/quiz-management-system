import { useState } from "react";
import { Calendar, Trophy, Eye, Download, Search, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "sonner";
import { motion } from "motion/react";

interface Attempt {
  id: number;
  quizTitle: string;
  instructor: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: string;
  status: 'passed' | 'failed';
}

const pastAttempts: Attempt[] = [
  {
    id: 1,
    quizTitle: 'Advanced JavaScript',
    instructor: 'Jane Smith',
    date: '2025-10-20',
    score: 85,
    totalQuestions: 25,
    correctAnswers: 21,
    timeTaken: '38 min',
    status: 'passed'
  },
  {
    id: 2,
    quizTitle: 'CSS Fundamentals',
    instructor: 'Charlie Brown',
    date: '2025-10-18',
    score: 92,
    totalQuestions: 15,
    correctAnswers: 14,
    timeTaken: '22 min',
    status: 'passed'
  },
  {
    id: 3,
    quizTitle: 'HTML Basics',
    instructor: 'John Doe',
    date: '2025-10-15',
    score: 78,
    totalQuestions: 20,
    correctAnswers: 16,
    timeTaken: '28 min',
    status: 'passed'
  },
  {
    id: 4,
    quizTitle: 'Node.js Fundamentals',
    instructor: 'Sarah Johnson',
    date: '2025-10-10',
    score: 58,
    totalQuestions: 30,
    correctAnswers: 17,
    timeTaken: '45 min',
    status: 'failed'
  },
  {
    id: 5,
    quizTitle: 'React Hooks',
    instructor: 'Jane Smith',
    date: '2025-10-08',
    score: 88,
    totalQuestions: 20,
    correctAnswers: 18,
    timeTaken: '35 min',
    status: 'passed'
  },
  {
    id: 6,
    quizTitle: 'TypeScript Basics',
    instructor: 'John Doe',
    date: '2025-10-05',
    score: 75,
    totalQuestions: 18,
    correctAnswers: 14,
    timeTaken: '30 min',
    status: 'passed'
  },
];

interface EnhancedPastAttemptsProps {
  onViewResult?: (attemptId: number) => void;
}

export function EnhancedPastAttempts({ onViewResult }: EnhancedPastAttemptsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterScore, setFilterScore] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredAttempts = pastAttempts.filter(attempt => {
    const matchesSearch = attempt.quizTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesScore = filterScore === "all" ||
      (filterScore === "high" && attempt.score >= 80) ||
      (filterScore === "medium" && attempt.score >= 60 && attempt.score < 80) ||
      (filterScore === "low" && attempt.score < 60);
    
    const matchesStatus = filterStatus === "all" || attempt.status === filterStatus;
    
    return matchesSearch && matchesScore && matchesStatus;
  });

  const handleDownload = (format: 'pdf' | 'csv') => {
    toast.success(`Downloading quiz history as ${format.toUpperCase()}...`);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-600' };
    if (score >= 60) return { variant: 'secondary' as const, color: 'text-yellow-600', bg: 'bg-yellow-600' };
    return { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-600' };
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="mb-2">My Quiz History</h1>
              <p className="text-muted-foreground">Review your past quiz attempts and scores</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleDownload('pdf')}
                className="hover:bg-primary/5 hover:border-primary transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload('csv')}
                className="hover:bg-primary/5 hover:border-primary transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quiz by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Score Range Filter */}
            <Select value={filterScore} onValueChange={setFilterScore}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (80%+)</SelectItem>
                <SelectItem value="medium">Medium (60-79%)</SelectItem>
                <SelectItem value="low">Low (&lt;60%)</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Results Table - Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:block"
        >
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz Title</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttempts.map((attempt) => {
                    const badge = getScoreBadge(attempt.score);
                    
                    return (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-primary" />
                            {attempt.quizTitle}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {attempt.instructor}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {attempt.date}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${badge.bg}`}
                                style={{ width: `${attempt.score}%` }}
                              />
                            </div>
                            <span className={badge.color}>{attempt.score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.variant}>
                            {attempt.status === 'passed' ? 'Passed' : 'Failed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewResult?.(attempt.id)}
                            className="hover:bg-primary/5 hover:border-primary transition-all"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Result
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {filteredAttempts.map((attempt, index) => {
            const badge = getScoreBadge(attempt.score);
            
            return (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Card className="border-primary/20 hover:border-primary transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3>{attempt.quizTitle}</h3>
                      <Badge variant={badge.variant}>
                        {attempt.status === 'passed' ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{attempt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <span>{attempt.correctAnswers}/{attempt.totalQuestions} correct • {attempt.timeTaken}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Score</span>
                        <span className={badge.color}>{attempt.score}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${badge.bg}`}
                          style={{ width: `${attempt.score}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full hover:bg-primary/5 hover:border-primary transition-all"
                      onClick={() => onViewResult?.(attempt.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredAttempts.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2">No quiz history found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
