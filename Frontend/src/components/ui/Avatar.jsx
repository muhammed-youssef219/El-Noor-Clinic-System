export default function Avatar({ name = "", size = 38, src }) {
  const initials = name.replace("د.", "").trim().split(" ").slice(0, 2).map(w => w[0]).join("");

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", background: "var(--primary-soft)",
        color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
