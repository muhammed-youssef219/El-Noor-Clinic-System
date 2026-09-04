"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { NAV } from "../../lib/constants";
import LoginScreen from "../../screens/LoginScreen";

export default function LoginPage() {
  const { auth, ready } = useAuth();
  const router = useRouter();
  const shouldRedirect = ready && !!auth;

  useEffect(() => {
    if (shouldRedirect) router.replace(`/${auth.role}/${NAV[auth.role][0].id}`);
  }, [shouldRedirect, auth, router]);

  if (!ready || shouldRedirect) return null;
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}
