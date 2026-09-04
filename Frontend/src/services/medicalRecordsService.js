import { apiClient } from "./apiClient";
const query = filters => { const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value)); return params.toString() ? `?${params}` : ""; };
export const listMedicalRecords = (filters = {}) => apiClient.get(`/medical-records${query(filters)}`);
export const createMedicalRecord = data => apiClient.post("/medical-records", data);
export const updateMedicalRecord = (id, patch) => apiClient.patch(`/medical-records/${id}`, patch);
