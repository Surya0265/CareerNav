import apiClient from "./apiClient.ts";

export const requestPasswordReset = async (email: string) => {
  const { data } = await apiClient.post<{
    message: string;
    email: string;
  }>("/auth/forgot-password", { email });
  return data;
};

export const verifyResetToken = async (token: string, email: string) => {
  const { data } = await apiClient.post<{
    message: string;
    email: string;
  }>("/auth/verify-reset-token", { token, email });
  return data;
};

export const resetPassword = async (
  token: string,
  email: string,
  newPassword: string,
  confirmPassword: string
) => {
  const { data } = await apiClient.post<{
    message: string;
  }>("/auth/reset-password", {
    token,
    email,
    newPassword,
    confirmPassword,
  });
  return data;
};
