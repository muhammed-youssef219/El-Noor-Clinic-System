import { useAsync } from "./useAsync";
import { listAuditLog } from "../services/auditLogService";

export function useAuditLog() {
  return useAsync(() => listAuditLog(), []);
}
