import type { AxiosError } from "axios";
import apiClient from "./apiClient.ts";
import type { ResumeUploadResponse } from "../types/resume.ts";

export interface ResumeUploadPayload {
  file: File;
  industries?: string[];
  goals?: string;
  location?: string;
}

export const uploadResume = async (
  payload: ResumeUploadPayload
): Promise<ResumeUploadResponse> => {
  const formData = new FormData();
  formData.append("resume", payload.file);
  if (payload.industries) {
    formData.append("industries", JSON.stringify(payload.industries));
  }
  if (payload.goals !== undefined) {
    formData.append("goals", payload.goals);
  }
  if (payload.location !== undefined) {
    formData.append("location", payload.location);
  }

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

export const fetchLatestResume = async (): Promise<ResumeUploadResponse | null> => {
  try {
    const { data } = await apiClient.get<ResumeUploadResponse>("/resume/latest");
    return data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export interface ResumeFinalizePayload {
  personalInfo: {
    name?: string;
    email?: string;
  };
  preferences: {
    industries: string[];
    goals: string;
    location: string;
  };
  sections: {
    technicalSkills: string[];
    experienceEntries: string[];
    projectEntries: string[];
  };
}

export const finalizeResume = async (
  payload: ResumeFinalizePayload
): Promise<ResumeUploadResponse> => {
  const { data } = await apiClient.post<ResumeUploadResponse>(
    "/resume/finalize",
    payload
  );

  return data;
};
