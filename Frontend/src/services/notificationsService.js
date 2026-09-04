import { apiClient } from "./apiClient";

const query = filters => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ""));
  return params.toString() ? `?${params}` : "";
};

export const listNotifications = (filters = {}) => apiClient.get(`/notifications${query(filters)}`);
export const markNotificationRead = id => apiClient.patch(`/notifications/${id}/read`, {});
export const markAllNotificationsRead = (filters = {}) => apiClient.patch(`/notifications/read-all${query(filters)}`, {});
export const deleteNotification = id => apiClient.delete(`/notifications/${id}`);
export const clearAllNotifications = (filters = {}) => apiClient.delete(`/notifications${query(filters)}`);
export const createAppointmentReminder = async () => null;
export const createBookingStatusNotification = async () => null;
