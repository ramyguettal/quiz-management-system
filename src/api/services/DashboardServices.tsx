import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';


export const dashboardService = {
  getInstructorStats: async (): Promise<any> => {
    return apiClient.get<any>(ENDPOINTS.dashboards.instructorStats());
  },
};