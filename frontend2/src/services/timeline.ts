import apiClient from "./apiClient.ts";
import type { TimelineRequest, TimelineResponse } from "../types/timeline.ts";

export const generateTimeline = async (
  payload: TimelineRequest
): Promise<TimelineResponse> => {
  const { data } = await apiClient.post<TimelineResponse>(
    "/timeline/generate-timeline",
    payload
  );
  return data;
};

export const generatePlan = async (
  payload: Omit<TimelineRequest, "additional_context"> & {
    additional_context?: Record<string, unknown>;
  }
): Promise<Record<string, unknown>> => {
  const { data } = await apiClient.post<Record<string, unknown>>(
    "/timeline/generate-plan",
    payload
  );
  return data;
};

export const getTimelineHistory = async () => {
  const { data } = await apiClient.get('/timeline/history');
  return data;
};

export const completePhase = async (payload: { planId: string; phaseOrder: number }) => {
  const { data } = await apiClient.post('/timeline/complete-phase', payload);
  return data;
};
