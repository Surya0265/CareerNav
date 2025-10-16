import { useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { ResumeUploadResponse } from "../../types/resume.ts";
import type { TimelineResponse } from "../../types/timeline.ts";
import { CareerDataContext } from "./CareerDataContext.ts";
import type { CareerDataContextValue } from "./CareerDataContext.ts";

export const CareerDataProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [latestResume, setLatestResumeState] = useState<ResumeUploadResponse | undefined>();
  const [latestTimeline, setLatestTimelineState] = useState<TimelineResponse | undefined>();

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
      },
    }),
    [latestResume, latestTimeline]
  );

  return <CareerDataContext.Provider value={value}>{children}</CareerDataContext.Provider>;
};
