import { useAsync } from "./useAsync";
import { listMedicalRecords } from "../services/medicalRecordsService";

export function useMedicalRecords(filters = {}) {
  const key = JSON.stringify(filters);
  return useAsync(() => listMedicalRecords(filters), [key]);
}
