import axios from "axios";

const defaultBaseUrl = "/api";
const baseURL = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl;

export const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

// Add request interceptor to log requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error("[API Response Error]", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });
    
    // Create a better error message from the response data
    const errorMessage = error.response?.data?.error || error.message || "API request failed";
    const errorToThrow = new Error(errorMessage);
    (errorToThrow as any).response = error.response;
    
    return Promise.reject(errorToThrow);
  }
);

export const setAuthToken = (token?: string) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    console.log("[Auth] Token set");
  } else {
    delete apiClient.defaults.headers.common.Authorization;
    console.log("[Auth] Token cleared");
  }
};

export default apiClient;
