import { useAsync } from "./useAsync";
import { listNotifications } from "../services/notificationsService";

export function useNotifications(filters = {}) {
  const key = JSON.stringify(filters);
  return useAsync(() => listNotifications(filters), [key]);
}
