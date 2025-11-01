export interface Admin {
  _id: string
  name: string
  email: string
  verified: boolean
  role: 'admin' | 'super_admin'
  permissions: string[]
  avatar?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AdminSignupRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminAuthResponse {
  success: boolean
  message: string
  data: {
    admin: Admin
    token: string
  }
}

export interface ActivityLog {
  _id: string
  userId: string | { _id: string; name: string; email: string }
  action: string
  details: string
  ipAddress: string
  userAgent: string
  status: 'success' | 'failed' | 'pending'
  timestamp: string
  metadata?: Record<string, any>
}

export interface Analytics {
  totalLogs: number
  totalUsers: number
  totalSessions: number
  avgResponseTime: number
  errorRate: number
  topActions: Array<{ action: string; count: number }>
  dailyLogs: Array<{ date: string; count: number }>
  errorBreakdown: Record<string, number>
}

export interface LogsResponse {
  success: boolean
  data: ActivityLog[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface ApiError {
  success: boolean
  message: string
  error?: string
}
