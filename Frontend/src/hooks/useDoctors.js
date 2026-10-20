import { useAsync } from "./useAsync";
import { listDoctors } from "../services/doctorsService";

export function useDoctors() {
  return useAsync(() => listDoctors(), []);
}
