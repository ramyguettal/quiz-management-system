import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';
import type { 
  Group, 
  PaginatedResponse, 
  QueryParams 
} from '../../types/ApiTypes';

export const groupService = {
  getGroups: async (params?: QueryParams): Promise<PaginatedResponse<Group>> => {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return apiClient.get<PaginatedResponse<Group>>(
      `${ENDPOINTS.groups.list}${queryString ? `?${queryString}` : ''}`
    );
  }
};