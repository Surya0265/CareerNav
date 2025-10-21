import { useMemo, useState, useEffect } from "react";
import type { PropsWithChildren } from "react";
import type { YouTubeRecommendationsResponse } from "../../services/youtube.ts";
import { YouTubeRecommendationsContext } from "./YouTubeRecommendationsContext.ts";
import type { YouTubeRecommendationsContextValue } from "./YouTubeRecommendationsContext.ts";

const STORAGE_KEY = "careernav_youtube_recommendations";

export const YouTubeRecommendationsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [youtubeData, setYouTubeDataState] = useState<YouTubeRecommendationsResponse | undefined>();

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as YouTubeRecommendationsResponse;
        console.log('YouTubeRecommendationsProvider: Loaded data from localStorage:', {
          hasData: !!parsedData,
          videosCount: parsedData?.youtube_resources?.length || 0,
          tipsCount: parsedData?.tips?.length || 0
        });
        setYouTubeDataState(parsedData);
      }
    } catch (error) {
      console.error('YouTubeRecommendationsProvider: Error loading from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<YouTubeRecommendationsContextValue>(
    () => ({
      youtubeData,
      setYouTubeData: (data?: YouTubeRecommendationsResponse) => {
        console.log('YouTubeRecommendationsProvider: setYouTubeData called with:', {
          hasData: !!data,
          videosCount: data?.youtube_resources?.length || 0,
          tipsCount: data?.tips?.length || 0
        });
        setYouTubeDataState(data);
        
        // Persist to localStorage
        if (data) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch (error) {
            console.error('YouTubeRecommendationsProvider: Error saving to localStorage:', error);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      },
      clearYouTubeData: () => {
        console.log('YouTubeRecommendationsProvider: clearYouTubeData called');
        setYouTubeDataState(undefined);
        localStorage.removeItem(STORAGE_KEY);
      }
    }),
    [youtubeData]
  );

  return (
    <YouTubeRecommendationsContext.Provider value={value}>
      {children}
    </YouTubeRecommendationsContext.Provider>
  );
};