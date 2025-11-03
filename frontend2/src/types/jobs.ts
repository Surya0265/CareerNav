export interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
  applyLink: string;
}

export interface JobRecommendationsResponse {
  skills: string[];
  jobs: Job[];
  message?: string;
}

export interface JobRecommendationsRequest {
  type: "upload" | "existing";
  resume?: File;
  city: string;
  country: string;
  experience?: number;
}

export interface JobRecommendationsError {
  error?: string;
  message?: string;
}
