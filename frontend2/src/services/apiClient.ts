import axios from "axios";

const defaultBaseUrl = "http://localhost:3011/api";
const baseURL = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl;

export const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

export const setAuthToken = (token?: string) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export default apiClient;
