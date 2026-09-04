import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

// Auto-logs out a signed-in staff/doctor/patient session after a period of
// no activity — reception/admin stations especially can sit unattended with
// sensitive medical/financial data still on screen.
export function useIdleLogout() {
  const { logout } = useAuth();
  const router = useRouter();
  const timerRef = useRef(null);

  useEffect(() => {
    function handleIdle() {
      logout();
      router.replace("/login?reason=idle");
    }
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleIdle, IDLE_TIMEOUT_MS);
    }
    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, resetTimer));
    resetTimer();
    return () => {
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
