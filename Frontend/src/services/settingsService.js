import { apiClient } from "./apiClient";
export const getClinicSettings = () => apiClient.get("/settings");
export const updateClinicSettings = patch => apiClient.patch("/settings", patch);
