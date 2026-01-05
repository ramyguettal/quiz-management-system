import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';
import type { 
  Course, 
  Student, 
  PaginatedResponse, 
  QueryParams,
  AssignCoursesRequest,
  CourseListItem,
  CreateCourseRequest
} from '../../types/ApiTypes';

export const courseService = {
  getCourses: async (params?: QueryParams): Promise<PaginatedResponse<Course>> => {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return apiClient.get<PaginatedResponse<Course>>(
      `${ENDPOINTS.courses.list}${queryString ? `?${queryString}` : ''}`
    );
  },

  getAllCourses: async (): Promise<CourseListItem[]> => {
    return apiClient.get<CourseListItem[]>(ENDPOINTS.courses.list);
  },

  getInstructorCourses: async (instructorId: string): Promise<CourseListItem[]> => {
    return apiClient.get<CourseListItem[]>(ENDPOINTS.courses.detailI(instructorId));
  },

  getCourse: async (id: string): Promise<Course> => {
    return apiClient.get<Course>(ENDPOINTS.courses.detailI(id));
  },


  createCourse: async (data: CreateCourseRequest): Promise<CourseListItem> => {
    return apiClient.post<CourseListItem>(ENDPOINTS.courses.create, data);
  },

  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.courses.delete(id));
  },

  updateCourse: async (id: string, data: CreateCourseRequest): Promise<CourseListItem> => {
    return apiClient.put<CourseListItem>(ENDPOINTS.courses.update(id), data);
  },

  assignCoursesToInstructor: async (instructorId: string, data: AssignCoursesRequest): Promise<void> => {
    await apiClient.put(ENDPOINTS.courses.assign(instructorId), data);
  },
};
