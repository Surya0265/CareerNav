import apiClient from './apiClient'

export const getTimelinePlanById = async (id: string) => {
  const { data } = await apiClient.get(`/timeline/${id}`);
  return data;
};

export const regeneratePlanById = async (id: string) => {
  const { data } = await apiClient.post(`/timeline/${id}/regenerate`);
  return data;
};
