import { useState } from "react";
import { Calendar, Clock, Eye, Play, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { motion } from "motion/react";

interface Quiz {
  id: number;
  title: string;
  instructor: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number;
  questions: number;
  status: 'active' | 'upcoming' | 'ended';
  subject: string;
}

const availableQuizzes: Quiz[] = [
  {
    id: 1,
    title: 'Introduction to React',
    instructor: 'Jane Smith',
    description: 'Test your knowledge of React fundamentals including components, props, and state management',
    startDate: '2025-10-25',
    endDate: '2025-10-30',
    duration: 45,
    questions: 20,
    status: 'active',
    subject: 'Web Development'
  },
  {
    id: 2,
    title: 'Web Security Basics',
    instructor: 'Charlie Brown',
    description: 'Learn about common security vulnerabilities and best practices for secure web applications',
    startDate: '2025-10-26',
    endDate: '2025-10-31',
    duration: 30,
    questions: 15,
    status: 'active',
    subject: 'Security'
  },
  {
    id: 3,
    title: 'Database Design',
    instructor: 'Jane Smith',
    description: 'Understanding relational databases, SQL fundamentals, and normalization principles',
    startDate: '2025-11-01',
    endDate: '2025-11-05',
    duration: 60,
    questions: 25,
    status: 'upcoming',
    subject: 'Database'
  },
  {
    id: 4,
    title: 'Advanced TypeScript',
    instructor: 'John Doe',
    description: 'Deep dive into TypeScript advanced features including generics, decorators, and utility types',
    startDate: '2025-10-27',
    endDate: '2025-11-02',
    duration: 50,
    questions: 22,
    status: 'active',
    subject: 'Programming'
  },
  {
    id: 5,
    title: 'API Design Principles',
    instructor: 'Charlie Brown',
    description: 'Best practices for designing RESTful APIs and GraphQL schemas',
    startDate: '2025-10-28',
    endDate: '2025-11-03',
    duration: 40,
    questions: 18,
    status: 'active',
    subject: 'Web Development'
  },
  {
    id: 6,
    title: 'Cloud Computing Basics',
    instructor: 'Sarah Johnson',
    description: 'Introduction to cloud services, deployment models, and major cloud providers',
    startDate: '2025-11-02',
    endDate: '2025-11-07',
    duration: 55,
    questions: 20,
    status: 'upcoming',
    subject: 'Cloud'
  },
];

interface EnhancedAvailableQuizzesProps {
  onStartQuiz: (quizId: number) => void;
}

export function EnhancedAvailableQuizzes({ onStartQuiz }: EnhancedAvailableQuizzesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);
  const itemsPerPage = 6;

  const toggleExpand = (quizId: number) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const filteredQuizzes = availableQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "all" || quiz.subject === filterSubject;
    const matchesStatus = filterStatus === "all" || quiz.status === filterStatus;
    
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuizzes = filteredQuizzes.slice(startIndex, startIndex + itemsPerPage);

  const subjects = Array.from(new Set(availableQuizzes.map(q => q.subject)));

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="mb-2">Available Quizzes</h1>
          <p className="text-muted-foreground">Browse and start quizzes assigned to you</p>
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
                placeholder="Search quizzes by title, instructor, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Subject Filter */}
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {paginatedQuizzes.length} of {filteredQuizzes.length} quizzes
          </p>
        </motion.div>

        {/* Quiz Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {paginatedQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="h-full border-primary/20 hover:border-primary hover:shadow-lg transition-all">
                <CardContent className="p-3 sm:p-6 flex flex-col h-full">
                  {/* Mobile View */}
                  <div className="sm:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-base font-semibold line-clamp-2">{quiz.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {quiz.status === 'active' ? (
                          <Button
                            onClick={() => onStartQuiz(quiz.id)}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 h-8 px-3"
                          >
                            <Play className="h-3 w-3 mr-1.5" />
                            <span className="text-xs">Start</span>
                          </Button>
                        ) : (
                          <Button disabled variant="outline" size="sm" className="h-8 px-3 text-xs">
                            {quiz.status === 'upcoming' ? 'Soon' : 'Ended'}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(quiz.id)}
                          className="h-8 w-8 p-0"
                        >
                          {expandedQuiz === quiz.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details for Mobile */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedQuiz === quiz.id ? "auto" : 0,
                        opacity: expandedQuiz === quiz.id ? 1 : 0
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="flex items-center gap-2">
                          {quiz.status === 'active' ? (
                            <Badge variant="default" className="bg-green-600">Active</Badge>
                          ) : quiz.status === 'upcoming' ? (
                            <Badge variant="secondary">Upcoming</Badge>
                          ) : (
                            <Badge variant="destructive">Ended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          <span className="font-medium">Instructor:</span> {quiz.instructor}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{quiz.description}</p>
                        
                        <div className="space-y-1.5 text-sm text-muted-foreground pt-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>Deadline: {quiz.endDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>{quiz.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 shrink-0" />
                            <span>{quiz.questions} questions</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden sm:block">
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="line-clamp-2">{quiz.title}</h3>
                        {quiz.status === 'active' ? (
                          <Badge variant="default" className="bg-green-600 shrink-0">Active</Badge>
                        ) : quiz.status === 'upcoming' ? (
                          <Badge variant="secondary" className="shrink-0">Upcoming</Badge>
                        ) : (
                          <Badge variant="destructive" className="shrink-0">Ended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By {quiz.instructor}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
                      {quiz.description}
                    </p>

                    {/* Meta Information */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {quiz.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{quiz.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{quiz.questions} questions</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {quiz.status === 'active' ? (
                      <Button
                        onClick={() => onStartQuiz(quiz.id)}
                        className="w-full bg-primary hover:bg-primary/90 transition-all transform hover:scale-[1.02]"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Quiz
                      </Button>
                    ) : quiz.status === 'upcoming' ? (
                      <Button disabled variant="outline" className="w-full">
                        Coming Soon
                      </Button>
                    ) : (
                      <Button disabled variant="outline" className="w-full">
                        Quiz Ended
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredQuizzes.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2">No quizzes found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                      isActive={false}
                      size="default"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                      size="default"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    isActive={false}
                    size="default"
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </motion.div>
        )}
      </div>
    </div>
  );
}
