import { apiClient } from './apiClient'

export const adminAuthService = {
  signup: async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    const response = await apiClient.post('/admin/signup', data)
    return response.data.data
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post('/admin/login', data)
    return response.data
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.get(`/admin/verify?token=${token}`)
    return response.data.data
  },

  resendVerification: async (email: string) => {
    await apiClient.post('/admin/resend-verification', { email })
  },

  getProfile: async () => {
    const response = await apiClient.get('/admin/profile')
    return response.data.data
  },

  updateProfile: async (data: { name?: string; notes?: string }) => {
    const response = await apiClient.put('/admin/profile', data)
    return response.data.data
  },

  changePassword: async (data: any) => {
    await apiClient.put('/admin/change-password', data)
  },

  forgotPassword: async (email: string) => {
    await apiClient.post('/admin/forgot-password', { email })
  },

  resetPassword: async (data: any) => {
    await apiClient.post('/admin/reset-password', data)
  },
}

export const adminLogsService = {
  getLogs: async (params?: any) => {
    const response = await apiClient.get('/admin/logs', { params })
    return response.data
  },

  getLogById: async (logId: string) => {
    const response = await apiClient.get(`/admin/logs/${logId}`)
    return response.data.data
  },

  getAnalytics: async (days?: number) => {
    const response = await apiClient.get('/admin/logs/analytics/stats', {
      params: { days },
    })
    const backendData = response.data.data

    // Transform backend response to match frontend Analytics type
    return {
      totalLogs: backendData.totalLogs || 0,
      totalUsers: backendData.topUsers?.length || 0,
      totalSessions: backendData.totalSessions || backendData.topUsers?.length || 0,
      avgResponseTime: 0, // Backend doesn't provide this yet
      errorRate: backendData.errorRate || 0,
      topActions: backendData.logsByAction?.map((action: any) => ({
        action: action._id,
        count: action.count,
      })) || [],
      dailyLogs: backendData.logsByDate?.map((log: any) => ({
        date: log._id,
        count: log.count,
      })) || [],
      errorBreakdown: {}, // Backend doesn't provide this yet
    }
  },

  getLogsByAction: async (action: string, page = 1, limit = 20) => {
    const response = await apiClient.get(`/admin/logs/action/${action}`, {
      params: { page, limit },
    })
    return response.data
  },

  exportLogs: async (params?: any) => {
    const response = await apiClient.get('/admin/logs/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}
