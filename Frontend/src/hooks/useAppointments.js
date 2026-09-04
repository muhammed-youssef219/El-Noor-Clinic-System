import { useAsync } from "./useAsync";
import { listAppointments } from "../services/appointmentsService";

export function useAppointments(filters = {}) {
  const key = JSON.stringify(filters);
  return useAsync(() => listAppointments(filters), [key]);
}
