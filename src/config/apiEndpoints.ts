/**
 * API端点统一配置
 * 所有API路径都在这里定义，方便统一管理和维护
 */

export const API_ENDPOINTS = {
  // 面试相关
  interviews: {
    create: '/interviews/create',
    createMock: (jobseekerId: number) => `/interviews/create_mock_interview/${jobseekerId}`,
    getList: '/interviews/getList/',
    getById: (id: number | string) => `/interviews/${id}`,
    redirectUrl: '/interviews/redirect-url/',
    report: (id: number | string) => `/interviews/interview_report/${id}`,
    myAiInterviews: '/interviews/my_ai_interviews',
    enterpriseAiInterviews: '/interviews/enterprise_ai_interviews',
  },

  // 面试问题相关
  interviewQuestions: {
    generateOne: '/interview-questions/generateOneQuestion',
    generateOneStream: '/interview-questions/generateOneQuestionStream',
    generateBatch: '/interview-questions/generateQuestion',
    generateStream: '/interview-questions/generateQuestionStream',
    generateParallelStream: '/interview-questions/generateQuestionsParallelStream',
  },

  // 求职者相关
  jobseekers: {
    byUser: '/jobseekers/by-user/',
    create: '/jobseekers/create',
    update: (id: number) => `/jobseekers/${id}`,
  },

  // 职位相关
  positions: {
    getInfo: (id: number | string) => `/positions/get-positions-info/${id}`,
    list: '/positions/list',
  },

  // 面试结果相关
  interviewResults: {
    evaluationWithScore: (id: number | string) => `/interview-results/evaluation_with_score/${id}/finalize`,
  },

  // 文件相关
  files: {
    upload: '/files/upload',
    download: (filename: string) => `/files/${filename}`,
  },

  // 用户相关
  users: {
    login: '/users/login',
    profile: '/users/profile',
    updateProfile: '/users/update-profile',
  },
} as const

// 导出类型，方便在其他地方使用
export type ApiEndpoints = typeof API_ENDPOINTS