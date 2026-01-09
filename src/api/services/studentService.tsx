import apiClient from "../Client";
import { StudentProfile } from "../../types/ApiTypes";

export const studentService = {
  getProfile: async (): Promise<StudentProfile> => {
    return apiClient.get<StudentProfile>("/student/profile");
  },

  updateProfile: async (data: {
    fullName: string;
    emailNotifications: boolean;
    profileImage?: File;
  }): Promise<void> => {
    const formData = new FormData();
    formData.append("FullName", data.fullName);
    formData.append("EmailNotifications", String(data.emailNotifications));

    if (data.profileImage) {
      formData.append("ProfileImage", data.profileImage);
    }

    await apiClient.put("/student/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
