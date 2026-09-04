import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import Avatar from "../ui/Avatar";
import { fileToCompressedDataUrl } from "../../lib/image";

export default function PhotoUploadField({ name, photo, onChange, size = 84 }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("من فضلك اختر ملف صورة");
      return;
    }
    setError("");
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <label>الصورة الشخصية</label>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <Avatar name={name} src={photo} size={size} />
          <button
            type="button"
            className="btn btn-primary"
            style={{ position: "absolute", bottom: -2, left: -2, padding: 6, borderRadius: "50%" }}
            onClick={() => inputRef.current?.click()}
            aria-label="تغيير الصورة"
          >
            <Camera size={13} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button type="button" className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => inputRef.current?.click()}>
            <Camera size={13} /> {photo ? "تغيير الصورة" : "رفع صورة"}
          </button>
          {photo && (
            <button type="button" className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)", alignSelf: "flex-start" }} onClick={() => onChange(null)}>
              <X size={12} /> إزالة الصورة
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      </div>
      {error && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
