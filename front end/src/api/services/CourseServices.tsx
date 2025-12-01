import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';
import type { Course, Student, PaginatedResponse, QueryParams } from '../../types/ApiTypes';

export const courseService = {
  getCourses: async (params?: QueryParams): Promise<PaginatedResponse<Course>> => {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return apiClient.get<PaginatedResponse<Course>>(
      `${ENDPOINTS.courses.list}${queryString ? `?${queryString}` : ''}`
    );
  },

  getCourse: async (id: string): Promise<Course> => {
    return apiClient.get<Course>(ENDPOINTS.courses.detail(id));
  },

  createCourse: async (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> => {
    return apiClient.post<Course>(ENDPOINTS.courses.create, data);
  },

  updateCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
    return apiClient.put<Course>(ENDPOINTS.courses.update(id), data);
  },

  deleteCourse: async (id: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.courses.delete(id));
  },

  getCourseStudents: async (id: string): Promise<Student[]> => {
    return apiClient.get<Student[]>(ENDPOINTS.courses.students(id));
  },
};