export interface ResumePreferences {
  industries: string[];
  goals: string;
  location: string;
}

export interface ExtractedInfo {
  text_length?: number;
  email?: string | null;
  phone?: string | null;
  detected_skills?: string[];
  skills_by_category?: Record<string, string[]>;
  total_skills_found?: number;
  has_experience_keywords?: boolean;
  has_education_keywords?: boolean;
}

export interface AiInsights {
  career_recommendations?: CareerRecommendations;
  skill_improvements?: SkillImprovement;
  resume_analysis?: ResumeAnalysis;
  learning_path?: LearningPath;
  error?: string;
}

export interface CareerRole {
  title: string;
  match_percentage?: number;
  required_skills?: string[];
  missing_skills?: string[];
  salary_range?: string;
  growth_potential?: string;
  industry?: string;
  reasoning?: string;
}

export interface CareerRecommendations {
  recommended_roles?: CareerRole[];
  industry_insights?: {
    trending_industries?: string[];
    growth_sectors?: string[];
    recommendations?: string;
  };
  next_steps?: string[];
  confidence_score?: number;
}

export interface SkillImprovement {
  skill_gaps?: Array<{
    skill: string;
    importance?: string;
    current_level?: string;
    target_level?: string;
    learning_priority?: number;
    estimated_time?: string;
    resources?: string[];
  }>;
  learning_path?: Array<{
    phase: string;
    duration?: string;
    skills_to_focus?: string[];
    milestones?: string[];
  }>;
  certifications?: Array<{
    name: string;
    provider?: string;
    relevance?: string;
    estimated_cost?: string;
  }>;
  practice_projects?: string[];
}

export interface ResumeAnalysis {
  overall_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  missing_sections?: string[];
  skill_presentation?: {
    well_presented?: string[];
    needs_improvement?: string[];
    missing_keywords?: string[];
  };
  suggestions?: Array<{
    category?: string;
    priority?: string;
    suggestion?: string;
  }>;
  ats_compatibility?: {
    score?: number;
    issues?: string[];
    improvements?: string[];
  };
}

export interface LearningPath {
  learning_path?: {
    total_duration?: string;
    phases?: Array<{
      phase_number?: number;
      title?: string;
      duration?: string;
      skills?: string[];
      resources?: Array<{
        type?: string;
        name?: string;
        provider?: string;
        duration?: string;
        cost?: string;
      }>;
      projects?: string[];
      milestones?: string[];
    }>;
  };
  alternative_paths?: Array<{
    path_name?: string;
    duration?: string;
    focus?: string;
  }>;
  budget_breakdown?: {
    free_resources?: number;
    paid_courses?: number;
    estimated_total?: string;
  };
  success_metrics?: string[];
}

export interface ResumeUploadResponse {
  summary: string;
  extracted_info: ExtractedInfo;
  preferences: {
    industries?: string[] | string;
    goals?: string;
    location?: string;
  };
  ai_insights: AiInsights;
}
