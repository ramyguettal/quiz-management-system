// Course Management Models
export interface CreateCourseRequest {
  title: string;
  description: string;
  code: string;
  academicYearId: string;
}

export interface DeleteCourseResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  additionalProp1?: string;
  additionalProp2?: string;
  additionalProp3?: string;
}
// Academic Year Types
export interface AcademicYear {
  id: string;
  number: string;
}
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

export interface ResetPasswordRequest {
  userId: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  additionalProp1?: string;
  additionalProp2?: string;
  additionalProp3?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  status: 'active' | 'inactive';
  // Student-specific fields
  year?: string;
  group?: string;
  // Instructor-specific fields
  title?: string;
  department?: string;
  phoneNumber?: string;
  officeLocation?: string;
  bio?: string;
  assignedCourses?: string[];
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
  academicYearId: string;
  title: string;
  description: string;
  code: string;
  academicYearNumber: string;
  studentCount: number;
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

export interface UserManagementProps {
  currentUserRole?: 'admin' | 'superadmin';
}

export interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  isSuperAdmin?: boolean;
}
