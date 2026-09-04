"use client";

import { useAuth } from "../context/AuthContext";
import PublicLanding from "../screens/PublicLanding";

// "/" always shows the public landing page, logged in or not, for every
// role — LandingNavbar shows the signed-in user's name + a dashboard
// shortcut instead of the login button, and Topbar has a matching button
// to come back here from inside any dashboard.
export default function RootPage() {
  const { ready } = useAuth();
  if (!ready) return null;
  return <PublicLanding />;
}
