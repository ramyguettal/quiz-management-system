export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  fullName: string;
  role: 'Instructor' | 'Student';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'instructor' | 'student';
  title?: string;
  department?: string;
  phone?: string;
  bio?: string;
  office?: string;
  createdAt: string;
  updatedAt: string;
}

// Course Types
export interface Course {
  id: string;
  name: string;
  code: string;
  semester: string;
  description: string;
  enrolledStudents: number;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  fullname: string;
  email: string;
  academicYear: string;
  coursesCount:number;
  quizzesCount: number;
  status:string;
}

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  course?: Course;
  startDate: string;
  endDate: string;
  timeLimit: number;
  attemptLimit: number;
  totalQuestions: number;
  totalPoints: number;
  status: 'draft' | 'published' | 'archived';
  settings: QuizSettings;
  createdAt: string;
  updatedAt: string;
  attempts?: number;
}

export interface QuizSettings {
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  allowReview: boolean;
}

export interface Question {
  id: string;
  quizId: string;
  type: 'mcq' | 'short-answer';
  text: string;
  points: number;
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
  order: number;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeTaken: number;
  status: 'pending' | 'graded';
  answers: SubmissionAnswer[];
  submittedAt: string;
}

export interface SubmissionAnswer {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface QuizStatistics {
  totalSubmissions: number;
  averageScore: number;
  passRate: number;
  completionRate: number;
  questionAnalysis: QuestionAnalysis[];
  scoreDistribution: ScoreDistribution;
}

export interface QuestionAnalysis {
  questionId: string;
  questionNumber: number;
  topic: string;
  avgScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ScoreDistribution {
  a: number; // 90-100%
  b: number; // 80-89%
  c: number; // 70-79%
  d: number; // 60-69%
  f: number; // <60%
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}