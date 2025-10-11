import apiClient from "./apiClient.ts";
import type { ResumeUploadResponse } from "../types/resume.ts";

export interface ResumeUploadPayload {
  file: File;
  industries: string[];
  goals: string;
  location: string;
}

export const uploadResume = async (
  payload: ResumeUploadPayload
): Promise<ResumeUploadResponse> => {
  const formData = new FormData();
  formData.append("resume", payload.file);
  formData.append("industries", JSON.stringify(payload.industries));
  formData.append("goals", payload.goals);
  formData.append("location", payload.location);

  const { data } = await apiClient.post<ResumeUploadResponse>(
    "/resume/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};
