import type { JobRecommendationsResponse } from "../../types/jobs.ts";
import { createContext } from "react";

export type JobRecommendationsContextValue = {
  jobsData?: JobRecommendationsResponse | null;
  setJobsData: (data?: JobRecommendationsResponse | null) => void;
  clearJobsData: () => void;
};

export const JobRecommendationsContext = createContext<JobRecommendationsContextValue>({
  jobsData: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setJobsData: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearJobsData: () => {},
});
