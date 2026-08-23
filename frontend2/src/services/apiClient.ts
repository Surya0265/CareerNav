import axios from "axios";

const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return `http://${window.location.hostname}:3011/api`;
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return "http://localhost:3011/api";
};

const baseURL = getBaseUrl();

export const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

// Add request interceptor to dynamically rewrite URLs and log requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined" && window.location.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      if (config.baseURL && config.baseURL.includes("localhost")) {
        config.baseURL = config.baseURL.replace("localhost", window.location.hostname);
      }
      if (config.url && config.url.includes("localhost")) {
        config.url = config.url.replace("localhost", window.location.hostname);
      }
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL || ""}${config.url}`, {
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
