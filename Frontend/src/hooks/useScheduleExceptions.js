import { useAsync } from "./useAsync";
import { listScheduleExceptions } from "../services/scheduleExceptionsService";

export function useScheduleExceptions(filters = {}) {
  const key = JSON.stringify(filters);
  return useAsync(() => listScheduleExceptions(filters), [key]);
}
