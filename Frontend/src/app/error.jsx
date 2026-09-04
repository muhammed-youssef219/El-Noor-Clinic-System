"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({ reset }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
      <div>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <AlertTriangle size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px" }}>حصل خطأ غير متوقع</h1>
        <p style={{ color: "var(--ink-faint)", fontSize: 13.5, margin: "0 0 24px", maxWidth: 380 }}>حاول تاني، ولو المشكلة استمرت كلّم الدعم الفني.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => reset()}>
            <RefreshCw size={15} /> حاول تاني
          </button>
          <Link href="/" className="btn btn-outline">
            <Home size={15} /> الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
