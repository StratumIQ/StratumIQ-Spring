/**
 * AuthIllustration.tsx — StratumIQ
 * Premium inline SVG: excavator silhouette + real-time HUD overlay.
 * Pure CSS animations — no JS, no external deps.
 */
export default function AuthIllustration() {
  return (
    <div className="auth-illustration">
      <svg
        viewBox="0 0 380 210"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto", display: "block" }}
        aria-hidden="true"
      >
        <defs>
          {/* ground gradient */}
          <linearGradient id="ai-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8692C" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#E8692C" stopOpacity="0.04" />
          </linearGradient>

          {/* machine body gradient */}
          <linearGradient id="ai-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1F2937" />
          </linearGradient>

          {/* cabin glass */}
          <linearGradient id="ai-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
          </linearGradient>

          {/* orange accent */}
          <linearGradient id="ai-orange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#E8692C" />
          </linearGradient>

          {/* HUD card bg */}
          <linearGradient id="ai-hud" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#F9FAFB" stopOpacity="0.88" />
          </linearGradient>

          {/* scan line mask */}
          <clipPath id="ai-scan-clip">
            <rect x="20" y="30" width="120" height="70" rx="8" />
          </clipPath>

          <filter id="ai-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#00000022" />
          </filter>
        </defs>

        {/* ── Ground platform ────────────────────────────── */}
        <ellipse cx="175" cy="192" rx="148" ry="10" fill="url(#ai-ground)" />
        <rect x="28" y="183" width="295" height="5" rx="2.5" fill="#E5E7EB" />

        {/* ── Tracks ─────────────────────────────────────── */}
        {/* left track */}
        <rect x="50" y="168" width="90" height="18" rx="9" fill="#374151" />
        <rect x="54" y="171" width="82" height="12" rx="6" fill="#4B5563" />
        {[62, 74, 86, 98, 110, 122].map((x) => (
          <rect key={x} x={x} y="170" width="6" height="16" rx="1.5" fill="#6B7280" />
        ))}
        {/* right track */}
        <rect x="160" y="168" width="90" height="18" rx="9" fill="#374151" />
        <rect x="164" y="171" width="82" height="12" rx="6" fill="#4B5563" />
        {[172, 184, 196, 208, 220, 232].map((x) => (
          <rect key={x} x={x} y="170" width="6" height="16" rx="1.5" fill="#6B7280" />
        ))}

        {/* ── Main chassis ───────────────────────────────── */}
        <rect x="62" y="138" width="178" height="34" rx="5" fill="url(#ai-body)" />
        {/* orange accent stripe */}
        <rect x="62" y="138" width="178" height="5" rx="2" fill="url(#ai-orange)" />

        {/* ── Counterweight ──────────────────────────────── */}
        <rect x="192" y="110" width="48" height="30" rx="4" fill="#1F2937" />
        <rect x="196" y="114" width="40" height="4" rx="2" fill="#374151" />

        {/* ── Cab ────────────────────────────────────────── */}
        <rect x="68" y="108" width="62" height="32" rx="5" fill="#374151" filter="url(#ai-shadow)" />
        {/* cab glass */}
        <rect x="72" y="112" width="38" height="22" rx="3" fill="url(#ai-glass)" />
        {/* cab roof highlight */}
        <rect x="70" y="107" width="58" height="5" rx="2" fill="url(#ai-orange)" />

        {/* ── Boom arm (animated float) ───────────────────── */}
        <g style={{ transformOrigin: "140px 138px", animation: "auth-float 4s ease-in-out infinite" }}>
          {/* lower boom */}
          <rect
            x="128" y="78" width="14" height="64"
            rx="5"
            fill="#4B5563"
            transform="rotate(-18 128 138)"
          />
          {/* stick */}
          <rect
            x="140" y="40" width="10" height="56"
            rx="4"
            fill="#6B7280"
            transform="rotate(8 140 90)"
          />
          {/* bucket */}
          <g transform="translate(156 42)">
            <path
              d="M0 0 L20 0 L24 22 L-4 22 Z"
              fill="#374151"
              stroke="#E8692C"
              strokeWidth="1.5"
            />
            <path d="M-4 22 Q10 32 24 22" fill="#1F2937" stroke="#E8692C" strokeWidth="1.5" />
            {/* bucket teeth */}
            {[1, 7, 13, 19].map((x) => (
              <rect key={x} x={x} y="22" width="3" height="6" rx="1" fill="#E8692C" />
            ))}
          </g>
          {/* hydraulic cylinder */}
          <line x1="135" y1="120" x2="152" y2="88" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
          <line x1="152" y1="88" x2="165" y2="68" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* ── Dust particles (pulse) ──────────────────────── */}
        {[
          { cx: 176, cy: 175, r: 3, delay: "0s" },
          { cx: 155, cy: 178, r: 2, delay: "0.4s" },
          { cx: 192, cy: 177, r: 2.5, delay: "0.8s" },
        ].map(({ cx, cy, r, delay }, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="#D1D5DB"
            style={{ animation: `auth-pulse 2.4s ${delay} ease-in-out infinite` }}
          />
        ))}

        {/* ── HUD card — Fuel ────────────────────────────── */}
        <g filter="url(#ai-shadow)" style={{ animation: "auth-float 5s 0.5s ease-in-out infinite" }}>
          <rect x="274" y="62" width="94" height="52" rx="8" fill="url(#ai-hud)" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
          {/* label */}
          <text x="282" y="78" fontSize="8" fontWeight="700" fill="#9CA3AF" letterSpacing="0.08em" fontFamily="system-ui">FUEL LEVEL</text>
          {/* value */}
          <text x="282" y="95" fontSize="18" fontWeight="800" fill="#111111" fontFamily="system-ui">78%</text>
          {/* bar */}
          <rect x="282" y="103" width="78" height="4" rx="2" fill="#E5E7EB" />
          <rect x="282" y="103" width="60" height="4" rx="2" fill="#E8692C"
            style={{ animation: "auth-pulse 3s ease-in-out infinite" }} />
        </g>

        {/* ── HUD card — Engine temp ──────────────────────── */}
        <g filter="url(#ai-shadow)" style={{ animation: "auth-float 4.5s 1s ease-in-out infinite" }}>
          <rect x="274" y="122" width="94" height="48" rx="8" fill="url(#ai-hud)" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
          <text x="282" y="138" fontSize="8" fontWeight="700" fill="#9CA3AF" letterSpacing="0.08em" fontFamily="system-ui">ENGINE TEMP</text>
          <text x="282" y="155" fontSize="18" fontWeight="800" fill="#111111" fontFamily="system-ui">
            82
            <tspan fontSize="11" fontWeight="600" fill="#6B7280">°C</tspan>
          </text>
          {/* green ok dot */}
          <circle cx="353" cy="152" r="4" fill="#22C55E"
            style={{ animation: "auth-blink 2.8s 0.3s ease-in-out infinite" }} />
        </g>

        {/* ── Scan line overlay ───────────────────────────── */}
        <g clipPath="url(#ai-scan-clip)" opacity="0.18">
          <rect
            x="20" y="30" width="120" height="3"
            fill="#E8692C"
            style={{ animation: "auth-scan 2s linear infinite" }}
          />
        </g>

        {/* ── Signal arcs (top-right) ─────────────────────── */}
        {[14, 22, 30].map((r, i) => (
          <circle
            key={i}
            cx="346" cy="34" r={r}
            fill="none"
            stroke="#E8692C"
            strokeWidth="1.5"
            strokeOpacity={0.6 - i * 0.15}
            strokeDasharray={`${r * 0.9} 9999`}
            strokeLinecap="round"
            style={{ animation: `auth-pulse ${2 + i * 0.5}s ${i * 0.3}s ease-in-out infinite` }}
          />
        ))}
        <circle cx="346" cy="34" r="4" fill="#E8692C" />
      </svg>
    </div>
  );
}