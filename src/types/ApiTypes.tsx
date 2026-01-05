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
  errorCode?: string;
  errorType?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  deviceId: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  fullName: string;
  role: 'Instructor' | 'Student' | 'Admin' | 'SuperAdmin';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface RefreshTokenRequest {
  deviceId: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// User Types
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

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  role: 'Student' | 'Instructor';
  status: 'Active' | 'InActive';
}

export interface GetUsersParams {
  role?: 'student' | 'instructor';
}

export interface CreateInstructorRequest {
  email: string;
  fullName: string;
  title: string;
  phoneNumber: string;
  department: string;
  officeLocation: string;
  bio: string;
}

export interface CreateStudentRequest {
  email: string;
  fullName: string;
  academicYear: string;
  groupNumber: string;
}

export interface CreateAdminRequest {
  email: string;
  fullName: string;
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

export interface CourseListItem {
  id: string;
  academicYearId: string;
  title: string;
  description: string;
  code: string;
  academicYearNumber: string;
  studentCount: number;
}

export interface AssignCoursesRequest {
  courseIds: string[];
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

export interface CourseStudent {
  studentId: string;
  fullName: string;
  email: string;
  quizzesTaken: number;
}

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  course?: Course;
  courseName?: string;
  academicYearName?: string;
  startDate: string;
  endDate: string;
  timeLimit: number;
  attemptLimit: number;
  totalQuestions: number;
  totalPoints: number;
  status: 'draft' | 'published' | 'archived';
  resultsReleased?: boolean;
  questionCount?: number;
  groupCount?: number;
  groups?: Array<{
    id: string;
    groupNumber: string;
  }>;
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

// Notification Types
export interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdUtc: string;
  type: string;
  data?: Record<string, any>;
}

export interface NotificationsResponse {
  items: Notification[];
  nextCursor: string | null;
  hasNextPage: boolean;
}


export interface Group {
  id: string;
  groupNumber: string;
  academicYearId: string;
  academicYearNumber: string;
}

export interface GroupsResponse {
  items: Group[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

// Quiz Analytics Types
export interface QuizAnalytics {
  statistics: {
    totalSubmissions: number;
    averageScore: number;
    passRate: number;
    completionRate: number;
  };
  studentSubmissions: StudentSubmission[];
  questionAnalysis: QuestionAnalysisItem[];
  scoreDistribution: {
    gradeA: number;
    gradeB: number;
    gradeC: number;
    gradeD: number;
    gradeF: number;
  };
}

export interface StudentSubmission {
  submissionId: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  submittedAt: string;
  score: number;
  percentage: number;
  timeSpent: number;
  status: 'InProgress' | 'Submitted' | 'Graded';
}

export interface QuestionAnalysisItem {
  questionId: string;
  questionText: string;
  successRate: number;
  difficulty: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  academicYearId: string;
  academicYearNumber: string;
  status: string;
  profileImageUrl: string | null;
  emailNotifications: boolean;
  createdAtUtc: string;
}
