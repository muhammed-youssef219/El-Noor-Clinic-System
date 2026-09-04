import { useAsync } from "./useAsync";
import { listPatients } from "../services/patientsService";

export function usePatients(query = "") {
  return useAsync(() => listPatients(query), [query]);
}
