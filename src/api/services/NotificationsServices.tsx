import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';
import type { NotificationsResponse } from '../../types/ApiTypes';

export const notificationsService = {
  getNotifications: async (): Promise<NotificationsResponse> => {
    return apiClient.get<NotificationsResponse>(ENDPOINTS.notifications.getNotifications);
  },
  markAsRead: async (id: string): Promise<void> => {
    return apiClient.patch<void>(ENDPOINTS.notifications.markAsRead(id));
  },    
  markAllAsRead: async (): Promise<void> => {
    return apiClient.patch<void>(ENDPOINTS.notifications.markAllAsRead);
  },
  deleteNotifications: async (notificationIds: string[]): Promise<void> => {
    return apiClient.delete<void>(ENDPOINTS.notifications.deleteNotification, { 
      body: JSON.stringify({ notificationIds }) 
    });
  },
  deleteAllNotifications: async (): Promise<void> => {
    return apiClient.delete<void>(ENDPOINTS.notifications.deleteAllNotifications);
  },
};