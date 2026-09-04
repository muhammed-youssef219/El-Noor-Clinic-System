import { useAsync } from "./useAsync";
import { listInvoices } from "../services/invoicesService";

export function useInvoices(filters = {}) {
  const key = JSON.stringify(filters);
  return useAsync(() => listInvoices(filters), [key]);
}
