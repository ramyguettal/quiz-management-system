import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';

interface MultipleChoiceQuestionData {
  text: string;
  points: number;
  shuffleOptions: boolean;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

interface ShortAnswerQuestionData {
  text: string;
  points: number;
  expectedAnswer: string;
}

export const questionService = {
  /**
   * Adds a multiple-choice question to a quiz
   * @param quizId - The ID of the quiz
   * @param data - The question data
   * @returns Promise<void>
   */
  createMultipleChoiceQuestion: async (quizId: string, data: MultipleChoiceQuestionData): Promise<void> => {
    return apiClient.post<void>(ENDPOINTS.questions.createMultipleChoice(quizId), data);
  },

  /**
   * Adds a short-answer question to a quiz
   * @param quizId - The ID of the quiz
   * @param data - The question data
   * @returns Promise<void>
   */
  createShortAnswerQuestion: async (quizId: string, data: ShortAnswerQuestionData): Promise<void> => {
    return apiClient.post<void>(ENDPOINTS.questions.createShortAnswer(quizId), data);
  },

  /**
   * Updates a multiple-choice question
   * @param questionId - The ID of the question
   * @param data - The updated question data
   * @returns Promise<void>
   */
  updateMultipleChoiceQuestion: async (questionId: string, data: MultipleChoiceQuestionData): Promise<void> => {
    return apiClient.put<void>(ENDPOINTS.questions.updateMultipleChoice(questionId), data);
  },

  /**
   * Updates a short-answer question
   * @param questionId - The ID of the question
   * @param data - The updated question data
   * @returns Promise<void>
   */
  updateShortAnswerQuestion: async (questionId: string, data: ShortAnswerQuestionData): Promise<void> => {
    return apiClient.put<void>(ENDPOINTS.questions.updateShortAnswer(questionId), data);
  },

  /**
   * Deletes a question from a quiz
   * @param questionId - The ID of the question to delete
   * @returns Promise<void>
   */
  deleteQuestion: async (questionId: string): Promise<void> => {
    return apiClient.delete<void>(ENDPOINTS.questions.delete(questionId));
  },
};
