import type { ApiError } from '../types/ApiTypes';
import { ENDPOINTS } from './Routes';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  skipAuthRefresh?: boolean;
}

class ApiClient {
  private baseURL: string;
  private token: string | null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async refreshToken(): Promise<boolean> {
    // If already refreshing, wait for that promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.attemptRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async attemptRefresh(): Promise<boolean> {
    try {
      // Get deviceId from localStorage
      const deviceId = localStorage.getItem('deviceId') || '';
      
      const response = await fetch(`${this.baseURL}${ENDPOINTS.auth.refresh}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': '1.0',
        },
        credentials: 'include',
        body: JSON.stringify({ deviceId }),
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Version': '1.0',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    try {
      let response = await fetch(url, config);

      // If unauthorized and not already a refresh attempt, try to refresh token
      if (response.status === 401 && !options.skipAuthRefresh) {
        const refreshed = await this.refreshToken();
        
        if (refreshed) {
          // Retry the original request
          response = await fetch(url, config);
        } else {
          // Refresh failed, clear token and redirect to login
          this.setToken(null);
          window.dispatchEvent(new CustomEvent('auth:logout'));
          throw {
            message: 'Session expired. Please log in again.',
            status: 401,
          } as ApiError;
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: `HTTP Error: ${response.status}`,
        }));
        
        throw {
          message: error.detail || error.title || error.message || 'An error occurred',
          status: response.status || error.status,
          errors: error.errors,
          errorCode: error.ErrorCode,
          errorType: error.type || error.ErrorType,
        } as ApiError;
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {} as T;
      }
      return JSON.parse(text);
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: (error as Error).message || 'Network error',
        status: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://api.quizflow.online').replace(/\/$/, '');
const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;

