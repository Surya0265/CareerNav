import { useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { ResumeUploadResponse } from "../../types/resume.ts";
import type { TimelineResponse } from "../../types/timeline.ts";
import { CareerDataContext } from "./CareerDataContext.ts";
import type { CareerDataContextValue } from "./CareerDataContext.ts";

export const CareerDataProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Initialize state from localStorage to persist across refresh/navigation
  const [latestResume, setLatestResumeState] = useState<ResumeUploadResponse | undefined>(() => {
    try {
      const raw = localStorage.getItem("career_latest_resume");
      return raw ? (JSON.parse(raw) as ResumeUploadResponse) : undefined;
    } catch (e) {
      console.warn("CareerDataProvider: failed to parse stored resume", e);
      return undefined;
    }
  });

  const [latestTimeline, setLatestTimelineState] = useState<TimelineResponse | undefined>(() => {
    try {
      const raw = localStorage.getItem("career_latest_timeline");
      return raw ? (JSON.parse(raw) as TimelineResponse) : undefined;
    } catch (e) {
      console.warn("CareerDataProvider: failed to parse stored timeline", e);
      return undefined;
    }
  });

  const value = useMemo<CareerDataContextValue>(
    () => ({
      latestResume,
      setLatestResume: (data?: ResumeUploadResponse) => {
        console.log('CareerDataProvider: setLatestResume called with:', {
          hasData: !!data,
          hasAiInsights: !!data?.ai_insights,
          aiInsightsKeys: data?.ai_insights ? Object.keys(data.ai_insights) : []
        });
        setLatestResumeState(data);
        try {
          if (data) localStorage.setItem("career_latest_resume", JSON.stringify(data));
          else localStorage.removeItem("career_latest_resume");
        } catch (e) {
          console.warn("CareerDataProvider: failed to persist resume", e);
        }
      },
      latestTimeline,
      setLatestTimeline: (data?: TimelineResponse) => {
        console.log('CareerDataProvider: setLatestTimeline called with:', {
          hasData: !!data,
          hasTimeline: !!data?.timeline,
          timelineLength: data?.timeline?.length,
          fullData: JSON.stringify(data, null, 2)
        });
        setLatestTimelineState(data);
        try {
          if (data) localStorage.setItem("career_latest_timeline", JSON.stringify(data));
          else localStorage.removeItem("career_latest_timeline");
        } catch (e) {
          console.warn("CareerDataProvider: failed to persist timeline", e);
        }
      },
    }),
    [latestResume, latestTimeline]
  );

  return <CareerDataContext.Provider value={value}>{children}</CareerDataContext.Provider>;
};
