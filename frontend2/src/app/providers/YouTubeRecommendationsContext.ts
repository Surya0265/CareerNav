import { createContext, useContext } from "react";
import type { YouTubeRecommendationsResponse } from "../../services/youtube.ts";

export interface YouTubeRecommendationsContextValue {
  youtubeData?: YouTubeRecommendationsResponse;
  setYouTubeData: (data?: YouTubeRecommendationsResponse) => void;
  clearYouTubeData: () => void;
}

export const YouTubeRecommendationsContext = createContext<YouTubeRecommendationsContextValue | null>(null);

export const useYouTubeRecommendations = () => {
  const ctx = useContext(YouTubeRecommendationsContext);
  if (!ctx) {
    throw new Error("useYouTubeRecommendations must be used within a YouTubeRecommendationsProvider");
  }
  return ctx;
};