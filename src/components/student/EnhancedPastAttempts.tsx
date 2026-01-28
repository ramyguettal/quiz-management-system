import { useState, useEffect } from "react";
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
import { studentService } from "@/api/services/studentService";
import type { StudentSubmission } from "@/types/ApiTypes";

interface EnhancedPastAttemptsProps {
  onBack: () => void;
  onViewResults: (submissionId: string) => void;
  onViewReview: (quizId: string) => void;
  onContinueQuiz: (quizId: string) => void;
}

export function EnhancedPastAttempts({ onBack, onViewResults, onViewReview, onContinueQuiz }: EnhancedPastAttemptsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async (nextCursor?: string) => {
    try {
      setLoading(true);
      const data = await studentService.getMySubmissions(nextCursor);
      
      console.log('Loaded submissions:', data);
      
      if (nextCursor) {
        setSubmissions(prev => [...prev, ...data.items]);
      } else {
        setSubmissions(data.items);
      }
      
      setHasMore(data.hasNextPage);
      setCursor(data.nextCursor);
    } catch (error: any) {
      console.error('Failed to fetch submissions:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.title 
          || error.message 
          || 'Failed to load past attempts';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (cursor && hasMore) {
      loadSubmissions(cursor);
    }
  };

  const filteredAttempts = submissions.filter(attempt => {
    const matchesSearch =
      attempt.quizTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.courseName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "released" && attempt.isReleased) ||
      (filterStatus === "pending" && !attempt.isReleased) ||
      (filterStatus === "inprogress" && attempt.status === 'InProgress');

    return matchesSearch && matchesStatus;
  });

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-600' };
    if (score >= 60) return { variant: 'secondary' as const, color: 'text-yellow-600', bg: 'bg-yellow-600' };
    return { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-600' };
  };

  const handleDownload = (format: 'pdf' | 'csv') => {
    toast.success(`Downloading quiz history as ${format.toUpperCase()}...`);
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

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="pending">Pending Results</SelectItem>
                <SelectItem value="released">Results Released</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredAttempts.length} quiz{filteredAttempts.length !== 1 ? 'zes' : ''}
          </p>
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
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttempts.map((attempt) => {
                    const badge = attempt.percentage !== undefined && attempt.percentage !== null 
                      ? getScoreBadge(attempt.percentage) 
                      : { variant: 'secondary' as const, color: 'text-gray-600', bg: 'bg-gray-600' };
                    
                    return (
                      <TableRow key={attempt.submissionId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-primary" />
                            {attempt.quizTitle}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {attempt.courseName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {attempt.instructorName}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {attempt.submittedAtUtc 
                              ? new Date(attempt.submittedAtUtc).toLocaleDateString()
                              : attempt.startedAtUtc
                              ? new Date(attempt.startedAtUtc).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {attempt.percentage !== undefined && attempt.percentage !== null ? (
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${badge.bg}`} />
                              <span className={badge.color}>{attempt.percentage.toFixed(0)}%</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attempt.status === 'InProgress' ? (
                            <Badge variant="outline" className="border-blue-500 text-blue-600">
                              In Progress
                            </Badge>
                          ) : attempt.isReleased ? (
                            <Badge variant={badge.variant}>
                              Released
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {attempt.status === 'InProgress' ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onContinueQuiz(attempt.quizId)}
                              className="hover:bg-primary/90"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Continue
                            </Button>
                          ) : attempt.isReleased ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onViewResults(attempt.submissionId)}
                              className="hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Results
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewReview(attempt.quizId)}
                              className="hover:bg-primary/5"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
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
            const badge = attempt.percentage !== undefined && attempt.percentage !== null 
              ? getScoreBadge(attempt.percentage) 
              : { variant: 'secondary' as const, color: 'text-gray-600', bg: 'bg-gray-600' };
            
            return (
              <motion.div
                key={attempt.submissionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Card className="border-primary/20 hover:border-primary transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3>{attempt.quizTitle}</h3>
                      {attempt.status === 'InProgress' ? (
                        <Badge variant="outline" className="border-blue-500 text-blue-600">
                          In Progress
                        </Badge>
                      ) : attempt.isReleased ? (
                        <Badge variant={badge.variant}>
                          Released
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Pending
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {attempt.submittedAtUtc 
                            ? new Date(attempt.submittedAtUtc).toLocaleDateString()
                            : attempt.startedAtUtc
                            ? new Date(attempt.startedAtUtc).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <span>{attempt.courseName} • {attempt.instructorName}</span>
                      </div>
                    </div>

                    {attempt.percentage !== undefined && attempt.percentage !== null ? (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Score</span>
                          <span className={badge.color}>{attempt.percentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${badge.bg}`}
                            style={{ width: `${attempt.percentage}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 text-sm text-muted-foreground">
                        Score not available yet
                      </div>
                    )}

                    {attempt.status === 'InProgress' ? (
                      <Button
                        variant="default"
                        className="w-full hover:bg-primary/90 transition-all"
                        onClick={() => onContinueQuiz(attempt.quizId)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Continue Quiz
                      </Button>
                    ) : attempt.isReleased ? (
                      <Button
                        variant="outline"
                        className="w-full hover:bg-primary/5 hover:border-primary transition-all"
                        onClick={() => onViewResults(attempt.submissionId)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full hover:bg-primary/5 hover:border-primary transition-all"
                        onClick={() => onViewReview(attempt.quizId)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMore && submissions.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={loadMore}
              disabled={loading}
              variant="outline"
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}

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
