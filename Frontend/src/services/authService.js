import { apiClient } from "./apiClient";
export const login = (email, password, role) => apiClient.post("/auth/login", { email, password, role });
export const logout = () => apiClient.post("/auth/logout");
export const currentUser = () => apiClient.get("/auth/me");
export const changePassword = (currentPassword, password) => apiClient.post("/auth/change-password", { currentPassword, password, password_confirmation: password });
export const loginDoctor = (email, password) => login(email, password, "doctor");
export const loginStaff = (email, password, role) => login(email, password, role);
