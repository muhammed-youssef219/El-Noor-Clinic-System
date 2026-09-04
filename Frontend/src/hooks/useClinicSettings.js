import { useAsync } from "./useAsync";
import { getClinicSettings } from "../services/settingsService";

export function useClinicSettings() {
  return useAsync(() => getClinicSettings(), []);
}
