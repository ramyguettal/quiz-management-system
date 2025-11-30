import type { User, PaginatedResponse, QueryParams } from '../../types/ApiTypes';
import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';
export const userService = {
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>(ENDPOINTS.users.profile);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return apiClient.put<User>(ENDPOINTS.users.updateProfile, data);
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    return apiClient.post(ENDPOINTS.users.changePassword, data);
  },
};