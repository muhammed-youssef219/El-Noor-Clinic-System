"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { NAV } from "../lib/constants";

export default function RequireRole({ role, children }) {
  const { auth, ready } = useAuth();
  const router = useRouter();

  const redirectTo = !ready ? null : !auth ? "/login" : auth.role !== role ? `/${auth.role}/${NAV[auth.role][0].id}` : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!ready || redirectTo) return null;
  return children;
}
