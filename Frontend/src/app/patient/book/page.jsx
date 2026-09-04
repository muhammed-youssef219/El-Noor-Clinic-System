"use client";

import { Suspense } from "react";
import PatientBook from "../../../screens/patient/Book";

// PatientBook reads useSearchParams() (for the ?doctorId= preset) — Next.js
// requires that behind a Suspense boundary.
export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <PatientBook />
    </Suspense>
  );
}
