import { apiClient } from "./apiClient";
export const listDoctors = () => apiClient.get("/doctors");
export const getDoctor = id => apiClient.get(`/doctors/${id}`);
export const createDoctor = data => apiClient.post("/doctors", data);
export const deleteDoctor = id => apiClient.delete(`/doctors/${id}`);
export const updateDoctorProfile = (id, patch) => apiClient.patch(`/doctors/${id}`, patch);
export async function uploadDoctorPhoto(id, photo) { const body = new FormData(); body.append("photo", photo); return apiClient.upload(`/doctors/${id}/photo`, body); }
export const resetDoctorPassword = () => Promise.reject(new Error("استخدم تدفق إعادة تعيين كلمة المرور الآمن من الخادم."));
export const changeDoctorPassword = (_id, currentPassword, newPassword) => apiClient.post("/auth/change-password", { currentPassword, password: newPassword, password_confirmation: newPassword });
