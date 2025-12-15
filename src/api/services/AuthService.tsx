import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';
import type { LoginCredentials, AuthResponse, User } from '../../types/ApiTypes';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.auth.login,
      credentials
    );
    return response;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(ENDPOINTS.auth.logout);
    apiClient.setToken(null);
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>(ENDPOINTS.auth.me);
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.auth.refresh);
    return response;
  },
};
