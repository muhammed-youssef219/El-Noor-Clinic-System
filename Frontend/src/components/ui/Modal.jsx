import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ title, onClose, children, width = 480 }) {
  const containerRef = useRef(null);

  // Escape closes the modal, and Tab is trapped inside it while it's open —
  // without this, keyboard-only users can tab straight through to whatever
  // is behind the overlay.
  useEffect(() => {
    const container = containerRef.current;
    const previouslyFocused = document.activeElement;
    const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
    (focusable[0] || container).focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.focus) previouslyFocused.focus();
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "var(--overlay)", display: "flex",
        alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", zIndex: 50, overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div ref={containerRef} tabIndex={-1} className="card" style={{ width: "100%", maxWidth: width, padding: 0, outline: "none" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>{title}</h3>
          <button className="btn btn-ghost" style={{ padding: 6 }} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}
