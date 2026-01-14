import apiClient, { API_BASE_URL } from '../Client';
import { ENDPOINTS } from '../Routes';
import type { 
  LoginCredentials, 
  AuthResponse, 
  User,
  ForgotPasswordRequest,
  RefreshTokenRequest,
  UpdatePasswordRequest,
  ResetPasswordRequest,
  ResetPasswordResponse
} from '../../types/ApiTypes';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.auth.login,
      credentials
    );
    return response;
  },

  // Initiates Google OAuth flow in a popup window and returns a Promise with the auth response
  loginWithGoogle: (): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
      
      // Store callback handler in window for popup to communicate back
      const callbackName = 'googleAuthCallback_' + Date.now();
      (window as any)[callbackName] = (response: AuthResponse) => {
        delete (window as any)[callbackName];
        resolve(response);
      };
      
      // Store the callback name and deviceId for the callback page
      localStorage.setItem('googleAuthCallback', callbackName);
      
      // Open popup for Google OAuth - redirect back to our frontend callback page
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      // Use frontend callback URL that will handle the response
      const redirectUrl = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
      
      const popup = window.open(
        `${API_BASE_URL}${ENDPOINTS.auth.googleLogin}?deviceId=${deviceId}&redirectUrl=${redirectUrl}`,
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top},popup=true`
      );
      
      if (!popup) {
        delete (window as any)[callbackName];
        localStorage.removeItem('googleAuthCallback');
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }
      
      // Listen for message from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          clearInterval(pollInterval);
          delete (window as any)[callbackName];
          localStorage.removeItem('googleAuthCallback');
          popup.close();
          resolve(event.data.payload as AuthResponse);
        } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
          window.removeEventListener('message', handleMessage);
          clearInterval(pollInterval);
          delete (window as any)[callbackName];
          localStorage.removeItem('googleAuthCallback');
          popup.close();
          reject(new Error(event.data.error || 'Google Sign In failed'));
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Poll for popup closure
      const pollInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollInterval);
          window.removeEventListener('message', handleMessage);
          delete (window as any)[callbackName];
          localStorage.removeItem('googleAuthCallback');
          reject(new Error('Sign in cancelled'));
        }
      }, 500);
      
      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        window.removeEventListener('message', handleMessage);
        delete (window as any)[callbackName];
        localStorage.removeItem('googleAuthCallback');
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error('Sign in timed out'));
      }, 5 * 60 * 1000);
    });
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.auth.refresh, data);
    return response;
  },
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post(ENDPOINTS.auth.ForgotPassword, data);
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    return apiClient.get<AuthResponse>(ENDPOINTS.auth.me);
  },

  logout: async (): Promise<void> => {
    const deviceId = localStorage.getItem('deviceId') || '';
    try {
      await apiClient.post(ENDPOINTS.auth.logout, { deviceId });
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('deviceId');
      apiClient.setToken(null);
    }
  },

  updatePassword: async (data: UpdatePasswordRequest): Promise<void> => {
    await apiClient.post(ENDPOINTS.users.updatePassword, data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    return apiClient.post<ResetPasswordResponse>(ENDPOINTS.auth.reset, data);
  },
};
