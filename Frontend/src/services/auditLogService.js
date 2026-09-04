import { apiClient } from "./apiClient";
export const listAuditLog = () => apiClient.get("/audit-log");
export const recordAudit = () => undefined;
