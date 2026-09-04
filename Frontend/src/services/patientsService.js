import { apiClient } from "./apiClient";
export const listPatients = (query = "") => apiClient.get(`/patients${query ? `?query=${encodeURIComponent(query)}` : ""}`);
export const getPatient = id => apiClient.get(`/patients/${id}`);
export const createPatient = data => apiClient.post("/patients", data);
export const registerPatient = data => apiClient.post("/patients/register", data);
export const updatePatient = (id, patch) => apiClient.patch(`/patients/${id}`, patch);
export const deletePatient = () => Promise.reject(new Error("لا يدعم الخادم حذف سجلات المرضى حفاظاً على السجل الطبي."));
