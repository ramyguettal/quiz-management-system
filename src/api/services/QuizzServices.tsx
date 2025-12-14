import type { Quiz, Question, QuizSubmission, QuizStatistics, PaginatedResponse, QueryParams } from '../../types/ApiTypes';
import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';

export const quizService = {
  getQuizzes: async (params?: QueryParams): Promise<PaginatedResponse<Quiz>> => {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return apiClient.get<PaginatedResponse<Quiz>>(
      `${ENDPOINTS.quizzes.list}${queryString ? `?${queryString}` : ''}`
    );
  },

  getQuizzesByCourse: async (courseId: string): Promise<Quiz[]> => {
    return apiClient.get<Quiz[]>(ENDPOINTS.quizzes.byCourse(courseId));
  },

  getQuiz: async (id: string): Promise<Quiz> => {
    return apiClient.get<Quiz>(ENDPOINTS.quizzes.detail(id));
  },

  createQuiz: async (data: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> => {
    return apiClient.post<Quiz>(ENDPOINTS.quizzes.create, data);
  },

  updateQuiz: async (id: string, data: Partial<Quiz>): Promise<Quiz> => {
    return apiClient.put<Quiz>(ENDPOINTS.quizzes.update(id), data);
  },

  deleteQuiz: async (id: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.quizzes.delete(id));
  },

  publishQuiz: async (id: string): Promise<Quiz> => {
    return apiClient.post<Quiz>(ENDPOINTS.quizzes.publish(id));
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
    return apiClient.delete(ENDPOINTS.questions.delete(quizId, questionId));
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
};
