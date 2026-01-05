import type { Quiz, Question, QuizSubmission, QuizStatistics, QuizAnalytics, PaginatedResponse, QueryParams } from '../../types/ApiTypes';
import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';

export const quizService = {
  getQuizzes: async (params?: QueryParams): Promise<PaginatedResponse<Quiz>> => {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return apiClient.get<PaginatedResponse<Quiz>>(
      `${ENDPOINTS.quizzes.list}${queryString ? `?${queryString}` : ''}`
    );
  },

  getQuizzesByCourse: async (courseId: string): Promise<any> => {
    // Endpoint returns a paginated object with `items`, `nextCursor`, `hasNextPage`
    return apiClient.get<any>(ENDPOINTS.quizzes.byCourse(courseId));
  },

  getQuiz: async (id: string): Promise<Quiz> => {
    return apiClient.get<Quiz>(ENDPOINTS.quizzes.detail(id));
  },

  /**
   * Create a new quiz
   * Backend returns the created quiz id (string)
   */
  createQuiz: async (data: any): Promise<string> => {
    return apiClient.post<string>(ENDPOINTS.quizzes.create, data);
  },

  /**
   * Update existing quiz
   * Returns void (no body expected) or server may return updated object;
   * we treat it as void to match provided API description.
   */
  updateQuiz: async (id: string, data: any): Promise<void> => {
    await apiClient.put<void>(ENDPOINTS.quizzes.update(id), data);
  },

  deleteQuiz: async (id: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.quizzes.delete(id));
  },

  /**
   * Publish a quiz
   * Returns void (no body expected)
   */
  publishQuiz: async (id: string): Promise<void> => {
    await apiClient.post<void>(ENDPOINTS.quizzes.publish(id));
  },

  // Questions
  getQuestions: async (quizId: string): Promise<Question[]> => {
    return apiClient.get<Question[]>(ENDPOINTS.questions.list(quizId));
  },

  createQuestion: async (quizId: string, data: Omit<Question, 'id'>): Promise<Question> => {
    return apiClient.post<Question>(ENDPOINTS.questions.create(quizId), data);
  },

  bulkCreateQuestions: async (quizId: string, questions: Omit<Question, 'id'>[]): Promise<Question[]> => {
    return apiClient.post<Question[]>(ENDPOINTS.questions.bulkCreate(quizId), { questions });
  },

  updateQuestion: async (quizId: string, questionId: string, data: Partial<Question>): Promise<Question> => {
    return apiClient.put<Question>(ENDPOINTS.questions.update(quizId, questionId), data);
  },

  deleteQuestion: async (quizId: string, questionId: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.questions.delete(questionId));
  },

  // Submissions
  getSubmissions: async (quizId: string): Promise<QuizSubmission[]> => {
    return apiClient.get<QuizSubmission[]>(ENDPOINTS.submissions.list(quizId));
  },

  getSubmission: async (quizId: string, submissionId: string): Promise<QuizSubmission> => {
    return apiClient.get<QuizSubmission>(ENDPOINTS.submissions.detail(quizId, submissionId));
  },

  getStatistics: async (quizId: string): Promise<QuizStatistics> => {
    return apiClient.get<QuizStatistics>(ENDPOINTS.submissions.statistics(quizId));
  },

  // Analytics
  getAnalytics: async (quizId: string): Promise<QuizAnalytics> => {
    return apiClient.get<QuizAnalytics>(ENDPOINTS.quizzes.analytics(quizId));
  },
};
