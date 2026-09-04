import { apiClient } from "./apiClient";
const query = filters => { const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value)); return params.toString() ? `?${params}` : ""; };
export const listAppointments = (filters = {}) => apiClient.get(`/appointments${query(filters)}`);
export const createAppointment = data => apiClient.post("/appointments", data);
export const updateAppointmentStatus = (id, status) => apiClient.patch(`/appointments/${id}/status`, { status });
export const getAvailability = (doctorId, date) => apiClient.get(`/doctors/${doctorId}/availability?date=${encodeURIComponent(date)}`);
