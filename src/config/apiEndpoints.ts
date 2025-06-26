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
    reportStream: (id: number | string) => `/interviews/interview_report_stream/${id}`,
    myAiInterviews: '/interviews/my_ai_interviews/',
    enterpriseAiInterviews: '/interviews/enterprise_ai_interviews/',
    submitSingleQuestion: '/interviews/submit_single_question',
    submitInterview: '/interviews/submit_interview',
    asrCallback: '/interviews/asr_callback',
    evaluateStream: (id: number | string) => `/interviews/evaluate_interview_stream/${id}`,
    interviewDetails: (id: number | string) => `/interviews/interview_details/${id}`,
    notifyResult: (id: number | string) => `/interviews/notify_interview_result/${id}`,
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

  // 试卷相关
  testPapers: {
    create: '/test-papers/create',
    getById: (id: number | string) => `/test-papers/${id}`,
    update: (id: number | string) => `/test-papers/${id}`,
    delete: (id: number | string) => `/test-papers/${id}`,
    list: '/test-papers/',
  },

  // 试卷题目相关
  testPaperQuestions: {
    create: '/test-papers-questions/create',
    getById: (id: number | string) => `/test-papers-questions/${id}`,
    getByTestPaper: (testPaperId: number | string) => `/test-papers-questions/by-test-paper/${testPaperId}`,
    update: (id: number | string) => `/test-papers-questions/${id}`,
    delete: (id: number | string) => `/test-papers-questions/${id}`,
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

  // 审核相关
  audits: {
    list: '/audits/',
    getById: (id: number | string) => `/audits/${id}`,
    approve: (id: number | string) => `/audits/${id}/approve`,
    reject: (id: number | string) => `/audits/${id}/reject`,
    bulkApprove: '/audits/bulk_approve',
    bulkReject: '/audits/bulk_reject',
  },

  // 帧分析相关
  frameAnalysis: {
    analyze: (interviewId: number | string) => `/frame-analysis/analyze/${interviewId}`,
  },

  // TTS相关
  tts: {
    generate: '/tts/generate_speech',
  },
} as const

// 导出类型，方便在其他地方使用
export type ApiEndpoints = typeof API_ENDPOINTS