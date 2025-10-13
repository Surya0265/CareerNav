import apiClient from "./apiClient.ts";
import type {
  ExistingAnalysisRequest,
  ExistingAnalysisResponse,
  SkillSuggestionRequest,
  SkillSuggestionResponse,
} from "../types/analysis.ts";
import type { ResumeUploadResponse } from "../types/resume.ts";

export const analyzeExistingSkills = async (
  payload: ExistingAnalysisRequest
): Promise<ExistingAnalysisResponse> => {
  const { data } = await apiClient.post<ExistingAnalysisResponse>(
    "/ai/analyze-existing",
    payload
  );
  return data;
};

export const analyzeResume = async (
  payload: FormData
): Promise<ResumeUploadResponse> => {
  const { data } = await apiClient.post<ResumeUploadResponse>(
    "/ai/analyze-resume",
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};

export const fetchSkillSuggestions = async (
  payload: SkillSuggestionRequest
): Promise<SkillSuggestionResponse> => {
  const { data } = await apiClient.post<SkillSuggestionResponse>(
    "/ai/skill-suggestions",
    payload
  );
  return data;
};
