import apiClient from '../Client';

const ENDPOINTS = {
  profile: {
    get: '/api/instructor/profile',
    update: '/api/instructor/profile',
  },
};

export interface InstructorProfile {
  id: string;
  fullName: string;
  email: string;
  title: string;
  phoneNumber: string;
  department: string;
  officeLocation: string;
  bio: string;
  profileImageUrl: string;
  emailNotifications: boolean;
  createdAtUtc: string;
}

export interface UpdateInstructorProfileRequest {
  fullName: string;
  title: string;
  phoneNumber: string;
  department: string;
  officeLocation: string;
  bio: string;
  emailNotifications: boolean;
  profileImage?: File;
}

class InstructorService {
  async getProfile(): Promise<InstructorProfile> {
    const response = await apiClient.get<InstructorProfile>(ENDPOINTS.profile.get);
    return response;
  }

  async updateProfile(data: UpdateInstructorProfileRequest): Promise<void> {
    const formData = new FormData();
    formData.append('FullName', data.fullName);
    formData.append('Title', data.title);
    formData.append('PhoneNumber', data.phoneNumber);
    formData.append('Department', data.department);
    formData.append('OfficeLocation', data.officeLocation);
    formData.append('Bio', data.bio);
    formData.append('EmailNotifications', data.emailNotifications.toString());
    
    if (data.profileImage) {
      formData.append('ProfileImage', data.profileImage);
    }

    // Use fetch directly to handle multipart/form-data properly
    const token = localStorage.getItem('token');
    const response = await fetch(`https://api.quizflow.online${ENDPOINTS.profile.update}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Version': '1.0',
        // Don't set Content-Type - browser will set it with boundary
      },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}` }));
      throw {
        status: response.status,
        message: error.message || `HTTP Error: ${response.status}`,
        ...error
      };
    }
  }
}

export const instructorService = new InstructorService();
