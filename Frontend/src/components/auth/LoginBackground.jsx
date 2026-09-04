import { Stethoscope, HeartPulse, Pill, Plus, Activity, Syringe } from "lucide-react";

// One heartbeat "unit" is 200 SVG units wide; repeating it and scrolling by
// exactly two units (-50% of a 4-unit strip) gives a perfectly seamless loop.
function heartbeatPath(units = 4, unitWidth = 200) {
  let d = "";
  for (let i = 0; i < units; i++) {
    const x = i * unitWidth;
    d += `M${x},30 H${x + 60} L${x + 75},10 L${x + 90},50 L${x + 105},15 L${x + 120},30 H${x + unitWidth} `;
  }
  return d;
}

const ICONS = [
  { Icon: Stethoscope, top: "10%", right: "8%", size: 84, anim: "clinic-float", duration: "9s", delay: "0s" },
  { Icon: HeartPulse, top: "62%", right: "4%", size: 64, anim: "clinic-float-alt", duration: "7s", delay: ".5s" },
  { Icon: Pill, top: "18%", left: "6%", size: 56, anim: "clinic-float-alt", duration: "8s", delay: "1s" },
  { Icon: Plus, top: "72%", left: "10%", size: 96, anim: "clinic-float", duration: "10s", delay: ".3s" },
  { Icon: Activity, top: "40%", left: "3%", size: 60, anim: "clinic-float", duration: "6.5s", delay: "1.2s" },
  { Icon: Syringe, top: "8%", left: "42%", size: 54, anim: "clinic-float-alt", duration: "9.5s", delay: ".8s" },
];

export default function LoginBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }} aria-hidden="true">
      {ICONS.map(({ Icon, size, anim, duration, delay, ...pos }, i) => (
        <div
          key={i}
          style={{
            position: "absolute", ...pos,
            animation: `${anim} ${duration} ease-in-out infinite`, animationDelay: delay,
            opacity: 0.1,
          }}
        >
          <Icon size={size} color="var(--primary)" strokeWidth={1.5} />
        </div>
      ))}

      <div style={{ position: "absolute", bottom: "8%", left: 0, width: "100%", height: 60, overflow: "hidden", opacity: 0.14 }}>
        <svg
          width="200%" height="60" viewBox="0 0 800 60" preserveAspectRatio="none"
          style={{ animation: "clinic-heartbeat-scroll 7s linear infinite" }}
        >
          <path d={heartbeatPath()} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
