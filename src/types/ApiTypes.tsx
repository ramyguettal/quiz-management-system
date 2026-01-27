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

// Group Types
export interface Group {
  id: string;
  groupNumber: string;
  academicYearId: string;
  academicYearNumber: string;
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

export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  hasNextPage: boolean;
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

// Response from /api/courses/{courseId}/quizzes endpoint
export interface CourseQuizzesResponse {
  courseId: string;
  title: string;
  description: string;
  code: string;
  quizzes: Array<{
    id?: string;
    title?: string;
    startTime: string;
    endTime: string;
    createdOn: string;
    status: string;
    questionsCount: number;
    attemptsCount: number;
  }>;
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

// Student Dashboard Types
export interface StudentDashboard {
  stats: {
    activeQuizzes: number;
    completedQuizzes: number;
    averageScore: number;
    averageScoreChange: string;
    unreadNotifications: number;
  };
  availableQuizzes: DashboardQuiz[];
  recentNotifications: DashboardNotification[];
}

export interface DashboardQuiz {
  id: string;
  title: string;
  instructorName: string;
  status: 'Active' | 'Draft' | 'Published' | 'Ended';
  deadline: string;
  canStart: boolean;
}

export interface DashboardNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

// Student Quiz Types
export interface StudentQuiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  academicYearName: string;
  availableFromUtc: string;
  availableToUtc: string;
  status: 'Draft' | 'Published' | 'Active' | 'Ended';
  resultsReleased: boolean;
  questionCount: number;
  groupCount: number;
  groups: {
    id: string;
    groupNumber: string;
  }[];
  createdAtUtc: string;
  lastModifiedUtc: string;
  instructorName: string;
}

// Student Submission Types
export interface StudentSubmission {
  submissionId: string;
  quizId: string;
  quizTitle: string;
  courseName: string;
  instructorName: string;
  availableFromUtc: string;
  availableToUtc: string;
  submittedAtUtc: string;
  isReleased: boolean;
  scaledScore: number;
  percentage: number;
}

// Quiz Submission Start
export interface QuizSubmissionStart {
  submissionId: string;
  quizId: string;
  questions: QuizQuestion[];
  startedAt: string;
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  type: 'MultipleChoice' | 'ShortAnswer';
  text: string;
  points: number;
  options?: QuizQuestionOption[];
}

export interface QuizQuestionOption {
  id: string;
  text: string;
}

// Current Submission
export interface QuizSubmissionCurrent {
  submissionId: string;
  quizId: string;
  quizTitle: string;
  startedAtUtc: string;
  availableToUtc: string;
  questions: CurrentQuizQuestion[];
  answers: SubmittedAnswer[];
}

export interface CurrentQuizQuestion {
  questionId: string;
  questionText: string;
  questionType: string; // "MultipleChoice" or "ShortAnswer"
  choices?: MultipleChoiceOption[];
  studentAnswer?: string;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
}

export interface SubmittedAnswer {
  questionId: string;
  multipleChoiceAnswer?: string[];
  shortAnswer?: string;
}

// Answer Types
export interface AnswerMultipleChoice {
  submissionId: string;
  questionId: string;
  selectedOptionIds: string[];
}

export interface AnswerShortAnswer {
  submissionId: string;
  questionId: string;
  answerText: string;
}

export interface SubmitQuiz {
  submissionId: string;
}

// Quiz Submission Results
export interface QuizSubmissionResults {
  submissionId: string;
  quizTitle: string;
  score: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: string;
  passed: boolean;
  questions: QuestionResult[];
}

export interface QuestionResult {
  id: string;
  questionText: string;
  type: 'MultipleChoice' | 'ShortAnswer';
  yourAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  points: number;
  earnedPoints: number;
  explanation?: string;
}

// Student Profile
export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string;
  emailNotifications: boolean;
  groupNumber?: string;
  academicYear?: string;
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  type?: string;
}

export interface NotificationsResponse {
  items: Notification[];
  totalCount: number;
  unreadCount: number;
}

// Quiz Analytics (Instructor)
export interface QuizAnalytics {
  statistics: {
    totalSubmissions: number;
    averageScore: number;
    passRate: number;
    completionRate: number;
  };
  studentSubmissions: StudentSubmissionDetail[];
  questionAnalysis: QuestionAnalysis[];
  scoreDistribution: {
    gradeA: number;
    gradeB: number;
    gradeC: number;
    gradeD: number;
    gradeF: number;
  };
}

export interface StudentSubmissionDetail {
  submissionId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  score: number;
  percentage: number;
  timeSpent: number;
  status: string;
}

export interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  difficulty: 'easy' | 'medium' | 'hard';
  successRate: number;
  averageTimeSpent?: number;
}

// Quiz Taking Types
export interface QuizDetailResponse {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  availableFromUtc: string;
  availableToUtc: string;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  allowEditAfterSubmission: boolean;
  status: string;
  resultsReleased: boolean;
  questions: QuizQuestion[];
  groups: Array<{
    id: string;
    groupNumber: string;
  }>;
  createdAtUtc: string;
  lastModifiedUtc: string;
}

export interface QuizQuestion {
  id: string;
  type: 'MultipleChoice' | 'ShortAnswer' | string;
  text: string;
  points: number;
  order: number;
  options?: QuizQuestionOption[];
  expectedAnswer?: string;
}

export interface QuizQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface StartQuizSubmissionRequest {
  quizId: string;
}

export interface StartQuizSubmissionResponse {
  submissionId: string;
  quizId: string;
  startedAt: string;
  // Add any other fields the backend returns
}

export interface AnswerMultipleChoiceRequest {
  submissionId: string;
  questionId: string;
  selectedOptionIds: string[];
}

export interface AnswerShortAnswerRequest {
  submissionId: string;
  questionId: string;
  answerText: string;
}

export interface SubmitQuizRequest {
  submissionId: string;
}

export interface SubmitQuizResponse {
  submissionId: string;
  score?: number;
  percentage?: number;
  // Add any other fields the backend returns
}
