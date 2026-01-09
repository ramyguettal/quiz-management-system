import apiClient from '../Client';
import { ENDPOINTS } from '../Routes';
import type { AcademicYear } from '../../types/ApiTypes';

export const academicYearService = {
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    return apiClient.get<AcademicYear[]>(ENDPOINTS.academicYears.list);
  },
};
