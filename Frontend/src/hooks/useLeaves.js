import { useAsync } from "./useAsync";
import { listLeaves } from "../services/leavesService";

export function useLeaves(filters = {}) {
  const key = JSON.stringify(filters);
  return useAsync(() => listLeaves(filters), [key]);
}
