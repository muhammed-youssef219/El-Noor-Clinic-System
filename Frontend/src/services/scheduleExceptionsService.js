import { apiClient } from "./apiClient";
export const listScheduleExceptions = (filters = {}) => apiClient.get(`/schedule-exceptions?${new URLSearchParams(filters)}`);
export const createScheduleException = ({ date, from, to, note }) => apiClient.post("/schedule-exceptions", { date, from, to, note });
export const deleteScheduleException = id => apiClient.delete(`/schedule-exceptions/${id}`);
