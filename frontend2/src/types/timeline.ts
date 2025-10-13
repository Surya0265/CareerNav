export interface TimelineMilestone {
  title: string;
  description?: string;
  duration_weeks?: number;
  resources?: string[];
  dependencies?: string[];
  status?: "pending" | "in-progress" | "completed";
}

export interface TimelineResponse {
  summary?: string;
  timeline?: TimelineMilestone[];
  mermaid_chart?: string;
  tips?: string[];
}

export interface TimelineRequest {
  current_skills: string[];
  target_job: string;
  timeframe_months: number;
  additional_context?: Record<string, unknown>;
}
