import { apiClient } from "./apiClient";
export const listUsers = () => apiClient.get("/users");
export const createStaffUser = data => apiClient.post("/users", data);
export const deleteStaffUser = id => apiClient.delete(`/users/${id}`);
export const updateStaffCredentials = (id, patch) => apiClient.patch(`/users/${id}`, patch);
export const resetStaffPassword = () => Promise.reject(new Error("استخدم تدفق إعادة تعيين كلمة المرور الآمن من الخادم."));
export const changeStaffPassword = (_id, currentPassword, newPassword) => apiClient.post("/auth/change-password", { currentPassword, password: newPassword, password_confirmation: newPassword });
