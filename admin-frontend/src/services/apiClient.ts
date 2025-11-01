import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API] Response error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
    })

    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized - clearing auth and redirecting to login')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    // Return the full error object so the calling code can access response.data
    return Promise.reject(error)
  },
)

export { apiClient }
