import { useAsync } from "./useAsync";
import { listServicesCatalog } from "../services/servicesCatalogService";

export function useServicesCatalog() {
  return useAsync(() => listServicesCatalog(), []);
}
