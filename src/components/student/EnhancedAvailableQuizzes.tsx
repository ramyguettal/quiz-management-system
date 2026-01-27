import { useState, useEffect } from "react";
import { Calendar, Clock, Eye, Play, Search, Filter, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
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
import { motion } from "motion/react";
import { studentService } from "@/api/services/studentService";
import type { StudentQuiz } from "@/types/ApiTypes";
import { toast } from "sonner";

interface EnhancedAvailableQuizzesProps {
  onBack: () => void;
  onStartQuiz: (quizId: string) => void;
}

export function EnhancedAvailableQuizzes({
  onBack,
  onStartQuiz,
}: EnhancedAvailableQuizzesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async (nextCursor?: string) => {
    try {
      setLoading(true);
      const data = await studentService.getAvailableQuizzes(nextCursor);
      
      if (nextCursor) {
        setQuizzes(prev => [...prev, ...data.items]);
      } else {
        setQuizzes(data.items);
      }
      
      setHasMore(data.hasNextPage);
      setCursor(data.nextCursor);
    } catch (error: any) {
      console.error('Failed to fetch quizzes:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load quizzes');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (cursor && hasMore) {
      loadQuizzes(cursor);
    }
  };

  const toggleExpand = (quizId: string) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  // Helper function to determine quiz status based on time
  const getQuizStatus = (quiz: StudentQuiz): 'Active' | 'Upcoming' | 'Ended' | 'Draft' | 'Published' => {
    const now = new Date();
    const startTime = new Date(quiz.availableFromUtc);
    const endTime = new Date(quiz.availableToUtc);

    // If quiz is published or active, check the times
    if (quiz.status === 'Published' || quiz.status === 'Active') {
      if (now < startTime) {
        return 'Upcoming';
      } else if (now >= startTime && now <= endTime) {
        return 'Active';
      } else {
        return 'Ended';
      }
    }

    // Return original status for Draft
    return quiz.status;
  };

  // Helper function to check if quiz can be started
  const canStartQuiz = (quiz: StudentQuiz): boolean => {
    const status = getQuizStatus(quiz);
    return status === 'Active';
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.courseName.toLowerCase().includes(searchQuery.toLowerCase());

    const quizStatus = getQuizStatus(quiz);
    
    // Only show Active and Upcoming quizzes
    const isActiveOrUpcoming = quizStatus === 'Active' || quizStatus === 'Upcoming';
    
    const matchesStatus =
      statusFilter === "all" ||
      quizStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus && isActiveOrUpcoming;
  });

  if (loading && quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'zes' : ''}
          </p>
        </motion.div>

        {/* Quiz Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredQuizzes.map((quiz, index) => {
            const quizStatus = getQuizStatus(quiz);
            const isStartEnabled = canStartQuiz(quiz);
            
            return (
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
                        <Button
                          onClick={() => onStartQuiz(quiz.id)}
                          size="sm"
                          disabled={!isStartEnabled}
                          className="bg-primary hover:bg-primary/90 h-8 px-3 disabled:opacity-50"
                        >
                          <Play className="h-3 w-3 mr-1.5" />
                          <span className="text-xs">Start</span>
                        </Button>
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
                          {quizStatus === 'Active' ? (
                            <Badge variant="default" className="bg-green-600">Active</Badge>
                          ) : quizStatus === 'Upcoming' ? (
                            <Badge variant="default" className="bg-orange-600">Upcoming</Badge>
                          ) : quizStatus === 'Published' ? (
                            <Badge variant="default" className="bg-blue-600">Published</Badge>
                          ) : quizStatus === 'Draft' ? (
                            <Badge variant="secondary">Draft</Badge>
                          ) : (
                            <Badge variant="destructive">Ended</Badge>
                          )}
                          {quiz.resultsReleased && (
                            <Badge variant="outline" className="border-green-500 text-green-600">Results Released</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          <span className="font-medium">Instructor:</span> {quiz.instructorName}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{quiz.description}</p>
                        
                        <div className="space-y-1.5 text-sm text-muted-foreground pt-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>Course: {quiz.courseName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>Academic Year: {quiz.academicYearName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>Available From: {new Date(quiz.availableFromUtc).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>Available Until: {new Date(quiz.availableToUtc).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 shrink-0" />
                            <span>{quiz.questionCount} questions</span>
                          </div>
                          {quiz.groups && quiz.groups.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Eye className="h-3.5 w-3.5 shrink-0" />
                              <span>Groups: {quiz.groups.map(g => g.groupNumber).join(', ')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>Created: {new Date(quiz.createdAtUtc).toLocaleDateString()}</span>
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
                        {quizStatus === 'Active' ? (
                          <Badge variant="default" className="bg-green-600 shrink-0">Active</Badge>
                        ) : quizStatus === 'Upcoming' ? (
                          <Badge variant="default" className="bg-orange-600 shrink-0">Upcoming</Badge>
                        ) : quizStatus === 'Published' ? (
                          <Badge variant="default" className="bg-blue-600 shrink-0">Published</Badge>
                        ) : quizStatus === 'Draft' ? (
                          <Badge variant="secondary" className="shrink-0">Draft</Badge>
                        ) : (
                          <Badge variant="destructive" className="shrink-0">Ended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By {quiz.instructorName}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                      {quiz.description}
                    </p>

                    {/* Meta Information */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Course: {quiz.courseName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Year: {quiz.academicYearName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>From: {new Date(quiz.availableFromUtc).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Until: {new Date(quiz.availableToUtc).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{quiz.questionCount} questions</span>
                      </div>
                      {quiz.groups && quiz.groups.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>Groups: {quiz.groups.map(g => g.groupNumber).join(', ')}</span>
                        </div>
                      )}
                      {quiz.resultsReleased && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            Results Released
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => onStartQuiz(quiz.id)}
                      disabled={!isStartEnabled}
                      className="w-full bg-primary hover:bg-primary/90 transition-all transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            );
          })}
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

        {/* Load More Button */}
        {hasMore && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-8"
          >
            <Button
              onClick={loadMore}
              variant="outline"
              className="px-8"
            >
              Load More Quizzes
            </Button>
          </motion.div>
        )}

        {loading && quizzes.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
}