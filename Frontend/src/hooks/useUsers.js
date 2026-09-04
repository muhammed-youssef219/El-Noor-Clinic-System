import { useAsync } from "./useAsync";
import { listUsers } from "../services/usersService";

export function useUsers() {
  return useAsync(() => listUsers(), []);
}
