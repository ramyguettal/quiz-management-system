import apiClient from "../Client";
import type { 
  StudentProfile,
  StudentDashboard,
  StudentQuiz,
  StudentSubmission,
  QuizSubmissionStart,
  QuizSubmissionCurrent,
  QuizSubmissionResults,
  AnswerMultipleChoice,
  AnswerShortAnswer,
  SubmitQuiz,
  CursorPaginatedResponse,
  QuizDetailResponse,
  StartQuizSubmissionRequest,
  StartQuizSubmissionResponse,
  AnswerMultipleChoiceRequest,
  AnswerShortAnswerRequest,
  SubmitQuizRequest,
  SubmitQuizResponse
} from "../../types/ApiTypes";

export const studentService = {
  // Profile Management
  getProfile: async (): Promise<StudentProfile> => {
    return apiClient.get<StudentProfile>("/api/student/profile");
  },

  updateProfile: async (data: {
    fullName: string;
    emailNotifications: boolean;
    profileImage?: File;
  }): Promise<void> => {
    const formData = new FormData();
    formData.append("FullName", data.fullName);
    formData.append("EmailNotifications", String(data.emailNotifications));

    if (data.profileImage) {
      formData.append("ProfileImage", data.profileImage);
    }

    // Don't set Content-Type header - browser will set it with boundary automatically
    await apiClient.put("/api/student/profile", formData);
  },

  // Dashboard
  getDashboard: async (): Promise<StudentDashboard> => {
    return apiClient.get<StudentDashboard>("/api/students/dashboard");
  },

  // Quizzes
  getAvailableQuizzes: async (cursor?: string): Promise<CursorPaginatedResponse<StudentQuiz>> => {
    const queryString = cursor ? `?cursor=${cursor}` : '';
    return apiClient.get<CursorPaginatedResponse<StudentQuiz>>(`/api/students/quizzes${queryString}`);
  },

  getQuizById: async (quizId: string): Promise<QuizDetailResponse> => {
    return apiClient.get<QuizDetailResponse>(`/api/quizzes/${quizId}`);
  },

  // Submissions
  getMySubmissions: async (
    cursor?: string,
    options?: {
      pageSize?: number;
      courseId?: string;
      status?: 'InProgress' | 'Submitted' | 'Released';
    }
  ): Promise<CursorPaginatedResponse<StudentSubmission>> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
    if (options?.courseId) params.append('courseId', options.courseId);
    if (options?.status) params.append('status', options.status);
    
    const queryString = params.toString();
    return apiClient.get<CursorPaginatedResponse<StudentSubmission>>(
      `/api/QuizSubmissions/my-submissions${queryString ? `?${queryString}` : ''}`
    );
  },

  // Quiz Attempt
  startQuiz: async (data: StartQuizSubmissionRequest): Promise<StartQuizSubmissionResponse> => {
    return apiClient.post<StartQuizSubmissionResponse>("/api/QuizSubmissions/start", data);
  },

  getCurrentSubmission: async (quizId: string): Promise<QuizSubmissionCurrent> => {
    return apiClient.get<QuizSubmissionCurrent>(`/api/QuizSubmissions/quiz/${quizId}/current`);
  },

  answerMultipleChoice: async (data: AnswerMultipleChoiceRequest): Promise<void> => {
    await apiClient.post("/api/QuizSubmissions/answer/multiple-choice", data);
  },

  answerShortAnswer: async (data: AnswerShortAnswerRequest): Promise<void> => {
    await apiClient.post("/api/QuizSubmissions/answer/short-answer", data);
  },

  submitQuiz: async (data: SubmitQuizRequest): Promise<SubmitQuizResponse> => {
    return apiClient.post<SubmitQuizResponse>("/api/QuizSubmissions/submit", data);
  },

  getSubmissionResults: async (submissionId: string): Promise<QuizSubmissionResults> => {
    return apiClient.get<QuizSubmissionResults>(`/api/QuizSubmissions/${submissionId}/results`);
  },
};
