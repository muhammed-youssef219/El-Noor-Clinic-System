import { apiClient } from "./apiClient";
export const listLeaves = (filters = {}) => apiClient.get(`/leaves?${new URLSearchParams(filters)}`);
export const createLeave = data => apiClient.post("/leaves", data);
export const updateLeaveStatus = (id, status) => apiClient.patch(`/leaves/${id}`, { status });
export function isOnLeave(leaves, doctorId, dateISO) { return (leaves || []).some(leave => leave.doctorId === doctorId && (!leave.status || leave.status === "approved") && dateISO >= leave.from && dateISO <= leave.to); }
