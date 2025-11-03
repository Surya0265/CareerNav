import { createContext, useContext } from "react";
import type { ResumeUploadResponse } from "../../types/resume.ts";
import type { TimelineResponse } from "../../types/timeline.ts";

export interface CareerDataContextValue {
  latestResume?: ResumeUploadResponse;
  setLatestResume: (data?: ResumeUploadResponse) => void;
  latestTimeline?: TimelineResponse;
  setLatestTimeline: (data?: TimelineResponse) => void;
  isResumeBeingReplaced: boolean;
  setIsResumeBeingReplaced: (value: boolean) => void;
}

export const CareerDataContext = createContext<CareerDataContextValue | null>(null);

export const useCareerData = () => {
  const ctx = useContext(CareerDataContext);
  if (!ctx) {
    throw new Error("useCareerData must be used within a CareerDataProvider");
  }
  return ctx;
};
