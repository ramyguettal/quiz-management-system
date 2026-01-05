import { ForgotPassword } from "@/components/ForgotPassword";
import { create } from "domain";

export const ENDPOINTS = {
  auth: {
    login: '/api/identity/login',
    logout: '/api/identity/logout',
    register: '/api/admins',
    ForgotPassword:'/api/identity/forgot-password',
    refresh: '/api/identity/refresh',//refresh token endpoint
    googleLogin: '/api/identity/login/google',
    googleCallback: '/api/identity/google/callback',
    me: '/api/identity/me',
    reset:'/api/identity/reset-password'
  },
  users: {
    list: '/api/users',
    detail: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/api/users/${id}/deactivate`,
    profile: '/users/profile',
    updateProfile: '/users/profile',
    updatePassword:'/api/users/update-password',
    createinstructor:'/api/instructors',
    createstudent:'/api/students',
    createadmin: '/api/admins',
  },
  courses: {
    list: '/api/Courses',
    detailI: (id: string) => `/api/Courses/instructor/${id}`,
    detailY: (id: string) => `/api/Courses/year/${id}`,
    create: '/api/Courses',
    assign : (id: string) => `/api/Courses/instructor/${id}/courses`,
    update : (id: string) => `/api/Courses/${id}`,
    delete : (id: string) => `/api/Courses/${id}`,
  },
  quizzes: {
    list: '/api/quizzes',
    detail: (status: string) => `/api/quizzes/${status}`,
    create: '/quizzes',
    update: (id: string) => `/quizzes/${id}`,
    delete: (id: string) => `/quizzes/${id}`,
    publish: (id: string) => `/quizzes/${id}/publish`,
    byCourse: (courseId: string) => `/courses/${courseId}/quizzes`,
  },
  questions: {
    list: (quizId: string) => `/quizzes/${quizId}/questions`,
    detail: (quizId: string, questionId: string) => `/quizzes/${quizId}/questions/${questionId}`,
    create: (quizId: string) => `/quizzes/${quizId}/questions`,
    update: (quizId: string, questionId: string) => `/quizzes/${quizId}/questions/${questionId}`,
    delete: (quizId: string, questionId: string) => `/quizzes/${quizId}/questions/${questionId}`,
    bulkCreate: (quizId: string) => `/quizzes/${quizId}/questions/bulk`,
  },
  submissions: {
    list: (quizId: string) => `/quizzes/${quizId}/submissions`,
    detail: (quizId: string, submissionId: string) => `/quizzes/${quizId}/submissions/${submissionId}`,
    statistics: (quizId: string) => `/quizzes/${quizId}/statistics`,
  },
  academicYears: {
    list: '/api/AcademicYears',
  },
} as const;
