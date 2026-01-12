import type { 
  User, 
  PaginatedResponse, 
  QueryParams,
  CreateInstructorRequest,
  CreateStudentRequest,
  CreateAdminRequest,
  UserResponse,
  GetUsersParams
} from '../../types/ApiTypes';
import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';

export const userService = {
  getUsers: async (params?: GetUsersParams): Promise<UserResponse[]> => {
    const queryString = params?.role ? `?role=${params.role}` : '';
    return apiClient.get<UserResponse[]>(`${ENDPOINTS.users.list}${queryString}`);
  },
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>(ENDPOINTS.users.profile);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return apiClient.put<User>(ENDPOINTS.users.updateProfile, data);
  },

  createInstructor: async (data: CreateInstructorRequest): Promise<void> => {
    await apiClient.post(ENDPOINTS.users.createinstructor, data);
  },

  createStudent: async (data: CreateStudentRequest): Promise<void> => {
    await apiClient.post(ENDPOINTS.users.createstudent, data);
  },

  createAdmin: async (data: CreateAdminRequest): Promise<void> => {
    await apiClient.post(ENDPOINTS.users.createadmin, data);
  },

  deactivateUser: async (userId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.users.delete(userId), {});
  },

  activateUser: async (userId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.users.restore(userId), {});
  },
};
