import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';
import type { 
  Group, 
  PaginatedResponse, 
  QueryParams 
} from '../../types/ApiTypes';

export const groupService = {
  getGroups: async (yearId?: string): Promise<Group[]> => {
    const queryString = yearId ? `?yearId=${yearId}` : '';
    return apiClient.get<Group[]>(
      `${ENDPOINTS.groups.list}${queryString}`
    );
  }
};