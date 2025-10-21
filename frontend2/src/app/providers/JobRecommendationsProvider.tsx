import { useMemo, useState, useEffect } from "react";
import type { PropsWithChildren } from "react";
import type { JobRecommendationsResponse } from "../../types/jobs.ts";
import { JobRecommendationsContext } from "./JobRecommendationsContext.ts";
import type { JobRecommendationsContextValue } from "./JobRecommendationsContext.ts";

const STORAGE_KEY = "careernav_job_recommendations";

export const JobRecommendationsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [jobsData, setJobsDataState] = useState<JobRecommendationsResponse | null | undefined>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as JobRecommendationsResponse) : undefined;
    } catch (e) {
      console.warn("JobRecommendationsProvider: failed to parse stored jobs", e);
      return undefined;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setJobsDataState(JSON.parse(raw) as JobRecommendationsResponse);
    } catch (e) {
      console.warn("JobRecommendationsProvider: error loading from localStorage", e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<JobRecommendationsContextValue>(
    () => ({
      jobsData,
      setJobsData: (data?: JobRecommendationsResponse | null) => {
        console.log('JobRecommendationsProvider: setJobsData called, hasData=', !!data);
        setJobsDataState(data as JobRecommendationsResponse | undefined | null);
        try {
          if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          else localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          console.warn("JobRecommendationsProvider: failed to persist jobs", e);
        }
      },
      clearJobsData: () => {
        console.log('JobRecommendationsProvider: clearJobsData called');
        setJobsDataState(undefined);
        localStorage.removeItem(STORAGE_KEY);
      }
    }),
    [jobsData]
  );

  return (
    <JobRecommendationsContext.Provider value={value}>
      {children}
    </JobRecommendationsContext.Provider>
  );
};

export default JobRecommendationsProvider;
