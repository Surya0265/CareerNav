import apiClient from "./apiClient.ts";

export interface YouTubeVideo {
  title: string;
  url: string;
  channel: string;
  views: string;
  duration: string;
}

export interface TimelinePhase {
  phase: string;
  skills: string[];
  resources: string[];
}

export interface YouTubeRecommendationsResponse {
  title: string;
  summary: string;
  youtube_resources: YouTubeVideo[];
  timeline: TimelinePhase[];
  advice: string;
}

export interface YouTubeRecommendationsRequest {
  current_skills: string[];
  target_job: string;
  timeframe_months: number;
  additional_context?: Record<string, unknown>;
}

export const getYouTubeRecommendations = async (
  payload: YouTubeRecommendationsRequest
): Promise<YouTubeRecommendationsResponse> => {
  const { data } = await apiClient.post<YouTubeRecommendationsResponse>(
    "/timeline",
    payload
  );
  return data;
};
