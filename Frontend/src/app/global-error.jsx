"use client";

// Only renders if the root layout itself throws (very rare — it's just
// providers) — can't rely on tokens.css necessarily being active, so this
// stays minimal and self-contained with inline styles only.
export default function GlobalError({ reset }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Tajawal, sans-serif", background: "#0a0f0e", color: "#f1f5f3" }}>
        <div style={{ textAlign: "center", padding: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px" }}>حصل خطأ في تحميل الموقع</h1>
          <p style={{ color: "#a3b0aa", fontSize: 13.5, margin: "0 0 20px" }}>حاول تاني بعد شوية.</p>
          <button
            onClick={() => reset()}
            style={{ background: "#0f6e6e", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}
          >
            حاول تاني
          </button>
        </div>
      </body>
    </html>
  );
}
