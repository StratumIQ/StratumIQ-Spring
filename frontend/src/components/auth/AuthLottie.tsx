/**
 * AuthLottie.tsx — StratumIQ
 * Replaces the lottie-react dependency with a self-contained
 * CSS-animated SVG: rotating data-ring + live metric ticks.
 * Zero JS overhead, fully SSR-safe.
 */
export default function AuthLottie() {
  return (
    <div className="auth-lottie">
      <svg
        viewBox="0 0 200 96"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto", display: "block" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="al-ring-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E8692C" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="al-ring-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <filter id="al-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Left: concentric rotating rings ──────────── */}
        <g transform="translate(48 48)">
          {/* outer ring track */}
          <circle cx="0" cy="0" r="40" fill="none" stroke="#E5E7EB" strokeWidth="3" />
          {/* outer ring progress arc — orange */}
          <circle
            cx="0" cy="0" r="40"
            fill="none"
            stroke="url(#al-ring-a)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="188 251"       /* ~75% of circumference */
            strokeDashoffset="63"
            style={{
              transformOrigin: "0 0",
              animation: "auth-spin 7s linear infinite",
            }}
          />

          {/* middle ring track */}
          <circle cx="0" cy="0" r="28" fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
          {/* middle ring — blue, counter-spin */}
          <circle
            cx="0" cy="0" r="28"
            fill="none"
            stroke="url(#al-ring-b)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="105 176"       /* ~60% */
            strokeDashoffset="44"
            style={{
              transformOrigin: "0 0",
              animation: "auth-spin 5s linear infinite reverse",
            }}
          />

          {/* inner ring track */}
          <circle cx="0" cy="0" r="16" fill="none" stroke="#E5E7EB" strokeWidth="2" />
          {/* inner ring — orange, fast */}
          <circle
            cx="0" cy="0" r="16"
            fill="none"
            stroke="#E8692C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="75 101"        /* ~74% */
            strokeDashoffset="25"
            style={{
              transformOrigin: "0 0",
              animation: "auth-spin 3.5s linear infinite",
            }}
          />

          {/* orbiting dot on outer ring */}
          <circle
            cx="0" cy="-40" r="4.5"
            fill="#E8692C"
            filter="url(#al-glow)"
            style={{
              transformOrigin: "0 0",
              animation: "auth-spin 7s linear infinite",
            }}
          />

          {/* orbiting dot on middle ring */}
          <circle
            cx="0" cy="-28" r="3.5"
            fill="#3B82F6"
            filter="url(#al-glow)"
            style={{
              transformOrigin: "0 0",
              animation: "auth-spin 5s linear infinite reverse",
            }}
          />

          {/* centre hub */}
          <circle cx="0" cy="0" r="8" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="4" fill="#E8692C"
            style={{ animation: "auth-pulse 2s ease-in-out infinite" }} />
        </g>

        {/* ── Right: live metric bars ───────────────────── */}
        <g transform="translate(108 12)">
          {/* title */}
          <text x="0" y="10" fontSize="7.5" fontWeight="700" fill="#9CA3AF"
            letterSpacing="0.08em" fontFamily="system-ui">LIVE METRICS</text>

          {/* row 1 — productivity */}
          <text x="0" y="26" fontSize="8.5" fontWeight="600" fill="#374151" fontFamily="system-ui">Productivity</text>
          <rect x="0" y="30" width="84" height="5" rx="2.5" fill="#F3F4F6" />
          <rect x="0" y="30" width="71" height="5" rx="2.5" fill="#E8692C"
            style={{ animation: "auth-pulse 3s 0s ease-in-out infinite" }} />
          <text x="76" y="36" fontSize="7.5" fontWeight="700" fill="#E8692C" fontFamily="system-ui">84%</text>

          {/* row 2 — uptime */}
          <text x="0" y="50" fontSize="8.5" fontWeight="600" fill="#374151" fontFamily="system-ui">Fleet Uptime</text>
          <rect x="0" y="54" width="84" height="5" rx="2.5" fill="#F3F4F6" />
          <rect x="0" y="54" width="82" height="5" rx="2.5" fill="#22C55E"
            style={{ animation: "auth-pulse 4s 0.5s ease-in-out infinite" }} />
          <text x="76" y="60" fontSize="7.5" fontWeight="700" fill="#22C55E" fontFamily="system-ui">98%</text>

          {/* row 3 — maintenance */}
          <text x="0" y="74" fontSize="8.5" fontWeight="600" fill="#374151" fontFamily="system-ui">Maint. Alerts</text>
          <rect x="0" y="78" width="84" height="5" rx="2.5" fill="#F3F4F6" />
          <rect x="0" y="78" width="20" height="5" rx="2.5" fill="#F59E0B"
            style={{ animation: "auth-pulse 3.5s 1s ease-in-out infinite" }} />
          <text x="76" y="84" fontSize="7.5" fontWeight="700" fill="#F59E0B" fontFamily="system-ui">3</text>

          {/* blinking live indicator */}
          <circle cx="6" cy="10" r="3" fill="#22C55E"
            style={{ animation: "auth-blink 1.6s ease-in-out infinite" }} />
          <text x="12" y="13" fontSize="7" fontWeight="600" fill="#22C55E" fontFamily="system-ui">LIVE</text>
        </g>
      </svg>
    </div>
  );
}