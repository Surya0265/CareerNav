import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token and dynamic hostname rewrite to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && window.location.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    if (config.baseURL && config.baseURL.includes("localhost")) {
      config.baseURL = config.baseURL.replace("localhost", window.location.hostname);
    }
    if (config.url && config.url.includes("localhost")) {
      config.url = config.url.replace("localhost", window.location.hostname);
    }
  }
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
