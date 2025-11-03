import apiClient from "./apiClient.ts";
import type { JobRecommendationsResponse, JobRecommendationsRequest } from "../types/jobs.ts";

export const getJobRecommendations = async (
  params: JobRecommendationsRequest
): Promise<JobRecommendationsResponse> => {
  if (params.type === "upload") {
    // Upload new resume
    if (!params.resume) {
      throw new Error("Resume file is required for upload");
    }

    const formData = new FormData();
    formData.append("resume", params.resume);
    formData.append("city", params.city);
    formData.append("country", params.country);
    if (params.experience) {
      formData.append("experience", params.experience.toString());
    }

    const { data } = await apiClient.post<JobRecommendationsResponse>(
      "/jobs/jobs-by-resume",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  } else if (params.type === "existing") {
    // Use existing skills from DB
    const payload: any = {
      city: params.city,
      country: params.country,
    };
    
    if (params.experience) {
      payload.experience = params.experience;
    }
    
    console.log("Sending existing skills request with payload:", payload);
    
    const { data } = await apiClient.post<JobRecommendationsResponse>(
      "/jobs/jobs-by-skills",
      payload
    );
    return data;
  }

  throw new Error("Invalid request type");
};

export const getJobRecommendationsHistory = async () => {
  const { data } = await apiClient.get('/jobs/history');
  return data;
};
