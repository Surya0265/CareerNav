import type { CareerRecommendations, SkillImprovement, ResumeAnalysis, LearningPath } from "./resume.ts";

export interface ExistingAnalysisRequest {
  industry: string;
  goals: string;
  experienceLevel?: string;
}

export interface ExistingAnalysisResponse {
  message: string;
  analysis: {
    recommended_roles?: CareerRecommendations["recommended_roles"];
    industry_insights?: CareerRecommendations["industry_insights"];
    next_steps?: CareerRecommendations["next_steps"];
    confidence_score?: number;
  } & Record<string, unknown>;
  userSkills: {
    technical?: string[];
    soft?: string[];
  };
  preferences: Record<string, unknown>;
}

export interface ResumeAnalysisResponse {
  message: string;
  analysis?: {
    career_recommendations?: CareerRecommendations;
    skill_improvements?: SkillImprovement;
    resume_analysis?: ResumeAnalysis;
    learning_path?: LearningPath;
  };
}

export interface SkillSuggestionRequest {
  targetRoles: string[];
  preferences?: Record<string, unknown>;
}

export interface SkillSuggestionResponse {
  message: string;
  suggestions: Record<string, unknown>;
  currentSkills: string[];
}
