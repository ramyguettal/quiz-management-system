
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
    restore: (id: string) => `/api/users/${id}/activate`,
    profile: '/users/profile',
    updateProfile: '/users/profile',
    updatePassword:'/api/users/update-password',
    createinstructor:'/api/instructors',
    createstudent:'/api/students',
    createadmin: '/api/admins',
  },
  courses: {
    list: '/api/Courses',
    detail: (id: string) => `/api/Courses/${id}`,
    detailI: (id: string) => `/api/Courses/instructor/${id}`,
    detailY: (id: string) => `/api/Courses/year/${id}`,
    create: '/api/Courses',
    assign : (id: string) => `/api/Courses/instructor/${id}/courses`,
    students: (courseId: string) => `/api/instructor/courses/${courseId}/students`,
  },
  dashboards: {
    instructorStats: () => `/api/Instructors/dashboard`,
  },
  groups: {
    list: '/api/groups',
  },
  notifications: {
    getNotifications: '/api/notifications',
    markAsRead: (id: string) => `/api/notifications/${id}/read`,
    markAllAsRead: '/api/notifications/read-all',
    deleteNotification: `/api/notifications/bulk`,
    deleteAllNotifications: `/api/notifications/all`,
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
    list: (quizId: string) => `/api/quizzes/${quizId}/questions`,
    detail: (quizId: string, questionId: string) => `/api/quizzes/${quizId}/questions/${questionId}`,
    create: (quizId: string) => `/api/quizzes/${quizId}/questions`,
    createMultipleChoice: (quizId: string) => `/api/quizzes/${quizId}/questions/multiple-choice`,
    createShortAnswer: (quizId: string) => `/api/quizzes/${quizId}/questions/short-answer`,
    updateMultipleChoice: (questionId: string) => `/api/quizzes/questions/multiple-choice/${questionId}`,
    updateShortAnswer: (questionId: string) => `/api/quizzes/questions/short-answer/${questionId}`,
    update: (quizId: string, questionId: string) => `/api/quizzes/${quizId}/questions/${questionId}`,
    delete: (questionId: string) => `/api/quizzes/questions/${questionId}`,
    bulkCreate: (quizId: string) => `/api/quizzes/${quizId}/questions/bulk`,
  },
  submissions: {
    list: (quizId: string) => `/quizzes/${quizId}/submissions`,
    detail: (quizId: string, submissionId: string) => `/quizzes/${quizId}/submissions/${submissionId}`,
    statistics: (quizId: string) => `/quizzes/${quizId}/statistics`,
  },
  academicYears: {
    list: '/api/AcademicYears',
  },
  RecentActivities: {
    list : '/api/recent-activities',
    delete : '/api/recent-activities'
  }
} as const;
