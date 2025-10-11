import apiClient from "./apiClient.ts";
import type {
  AuthResponse,
  LoginPayload,
  SignupPayload,
  User,
} from "../types/auth.ts";

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/users/login", payload);
  return data;
};

export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/users/signup", payload);
  return data;
};

export const fetchProfile = async (): Promise<User> => {
  const { data } = await apiClient.get<User>("/users/profile");
  return data;
};
