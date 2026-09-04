export function SkeletonBlock({ height = 16, width = "100%", radius = 8, style }) {
  return (
    <div
      style={{
        height, width, borderRadius: radius, background: "var(--line-soft)",
        animation: "clinic-pulse 1.3s ease-in-out infinite", ...style,
      }}
    />
  );
}

export function SkeletonRows({ rows = 4, cols = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: "flex", gap: 12 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBlock key={c} height={14} width={c === 0 ? "22%" : "18%"} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 3 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SkeletonBlock height={42} width={42} radius={999} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <SkeletonBlock height={12} width="70%" />
              <SkeletonBlock height={10} width="40%" />
            </div>
          </div>
          <SkeletonBlock height={10} width="90%" />
        </div>
      ))}
    </div>
  );
}
