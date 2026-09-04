import { apiClient } from "./apiClient";
export const listServicesCatalog = () => apiClient.get("/services-catalog");
export const createService = data => apiClient.post("/services-catalog", data);
export const updateService = (id, patch) => apiClient.patch(`/services-catalog/${id}`, patch);
export const deleteService = id => apiClient.delete(`/services-catalog/${id}`);
