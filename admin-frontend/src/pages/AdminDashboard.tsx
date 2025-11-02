import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminLogsService } from '../services/admin'
import { AdminLayout } from '../components/AdminLayout'
import { Button } from '../components/shared/Button'
import { Spinner } from '../components/shared/Spinner'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { RefreshCw } from 'lucide-react'
import type { Analytics, ActivityLog } from '../types/admin'

export const AdminDashboard: React.FC = () => {
  const { token, isLoading: authLoading } = useAdminAuth()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    if (token && !authLoading) {
      loadDashboardData()
    }
  }, [token, authLoading])

  // Load logs when page changes
  useEffect(() => {
    if (token && page > 0) {
      loadLogsByPage()
    }
  }, [page, token])
  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Load analytics
      const analyticsData = await adminLogsService.getAnalytics(30)
      console.log('Analytics data received:', analyticsData)
      setAnalytics(analyticsData)

      // Load recent logs
      const logsData = await adminLogsService.getLogs({ page: 1, limit: 10 })
      console.log('Logs data received:', logsData)
      setLogs(logsData.data)
      setTotalPages(logsData.pagination.pages)
      setPage(1)
    } catch (err: any) {
      console.error('Dashboard load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadLogsByPage = async () => {
    try {
      setLogsLoading(true)
      const logsData = await adminLogsService.getLogs({ page, limit: 10 })
      setLogs(logsData.data)
      setTotalPages(logsData.pagination.pages)
    } catch (err: any) {
      console.error('Load logs error:', err)
    } finally {
      setLogsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setPage(1)
    await loadDashboardData()
  }

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4', '#84cc16', '#d946ef']

  // Show loading spinner during initial data load
  if (isLoading && !analytics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900"></h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Total Logs', value: analytics.totalLogs, color: 'bg-blue-50 text-blue-600' },
              { label: 'Total Users', value: analytics.totalUsers, color: 'bg-green-50 text-green-600' },
            ].map((stat, idx) => (
              <div key={idx} className={`${stat.color} p-4 rounded-lg border border-current border-opacity-20`}>
                <p className="text-sm font-medium opacity-80">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        {analytics && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Activity Chart */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Daily Activity</h2>
              {analytics?.dailyLogs && analytics.dailyLogs.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyLogs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-8 text-slate-500">No daily log data available</p>
              )}
            </div>

            {/* Top Actions Chart */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Actions</h2>
              {analytics?.topActions && analytics.topActions.length > 0 ? (
                <ResponsiveContainer width="100%" height={550}>
                  <PieChart margin={{ top: -100, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={analytics.topActions}
                      dataKey="count"
                      nameKey="action"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={false}
                      labelLine={false}
                    >
                      {analytics.topActions.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => `${value}`}
                      labelFormatter={(label: any) => `${label}`}
                      contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px' }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ paddingBottom: '120px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-8 text-slate-500">No action data available</p>
              )}
            </div>
          </div>
        )}

        {/* Activity Section */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          </div>

          {logsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">{log.action}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {typeof log.userId === 'object' && log.userId ? log.userId.name : log.userId}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-2 text-slate-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-8 text-slate-500">No logs found</p>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
