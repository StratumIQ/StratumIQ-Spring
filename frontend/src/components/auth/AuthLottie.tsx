/**
 * AuthLottie.tsx — StratumIQ
 * Redesigned: wider viewBox, LIVE badge cleanly separated from metric rows.
 * Zero JS overhead, fully SSR-safe CSS animations.
 */
export default function AuthLottie() {
  return (
    <div className="auth-lottie">
      <svg
        viewBox="0 0 320 130"
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
          <filter id="al-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Left: concentric rotating rings (centred at 65,65) ── */}
        <g transform="translate(65 65)">
          {/* outer ring track */}
          <circle cx="0" cy="0" r="52" fill="none" stroke="#E5E7EB" strokeWidth="3" />
          {/* outer ring progress — orange, clockwise */}
          <circle
            cx="0" cy="0" r="52"
            fill="none"
            stroke="url(#al-ring-a)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="245 327"
            strokeDashoffset="82"
            style={{ transformOrigin: "0 0", animation: "auth-spin 7s linear infinite" }}
          />

          {/* middle ring track */}
          <circle cx="0" cy="0" r="36" fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
          {/* middle ring — blue, counter */}
          <circle
            cx="0" cy="0" r="36"
            fill="none"
            stroke="url(#al-ring-b)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="135 226"
            strokeDashoffset="45"
            style={{ transformOrigin: "0 0", animation: "auth-spin 5s linear infinite reverse" }}
          />

          {/* inner ring track */}
          <circle cx="0" cy="0" r="20" fill="none" stroke="#E5E7EB" strokeWidth="2" />
          {/* inner ring — orange, fast */}
          <circle
            cx="0" cy="0" r="20"
            fill="none"
            stroke="#E8692C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="94 126"
            strokeDashoffset="31"
            style={{ transformOrigin: "0 0", animation: "auth-spin 3.5s linear infinite" }}
          />

          {/* orbiting dot — outer ring */}
          <circle
            cx="0" cy="-52" r="5"
            fill="#E8692C"
            filter="url(#al-glow)"
            style={{ transformOrigin: "0 0", animation: "auth-spin 7s linear infinite" }}
          />
          {/* orbiting dot — middle ring */}
          <circle
            cx="0" cy="-36" r="4"
            fill="#3B82F6"
            filter="url(#al-glow)"
            style={{ transformOrigin: "0 0", animation: "auth-spin 5s linear infinite reverse" }}
          />

          {/* centre hub */}
          <circle cx="0" cy="0" r="10" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="5" fill="#E8692C"
            style={{ animation: "auth-pulse 2s ease-in-out infinite" }} />
        </g>

        {/* ── Right panel: LIVE badge row + metric bars ────────── */}
        {/* Starts at x=146, giving plenty of room from the 130px-wide rings */}
        <g transform="translate(146 18)">

          {/* ── LIVE badge — its own row, clear of everything ── */}
          <rect x="0" y="0" width="46" height="18" rx="9"
            fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.3)" strokeWidth="1" />
          <circle cx="10" cy="9" r="3.5" fill="#22C55E"
            style={{ animation: "auth-blink 1.6s ease-in-out infinite" }} />
          <text x="17" y="13" fontSize="8" fontWeight="700" fill="#22C55E"
            letterSpacing="0.06em" fontFamily="system-ui">LIVE</text>

          {/* ── LIVE METRICS label — below the badge with breathing room ── */}
          <text x="0" y="34" fontSize="8" fontWeight="700" fill="#9CA3AF"
            letterSpacing="0.08em" fontFamily="system-ui">LIVE METRICS</text>

          {/* ── Divider ── */}
          <rect x="0" y="40" width="160" height="1" fill="#F3F4F6" />

          {/* ── Row 1: Productivity ── */}
          <text x="0" y="58" fontSize="10" fontWeight="600" fill="#374151" fontFamily="system-ui">Productivity</text>
          <text x="133" y="58" fontSize="9" fontWeight="700" fill="#E8692C" fontFamily="system-ui" textAnchor="end">84%</text>
          <rect x="0" y="62" width="160" height="6" rx="3" fill="#F3F4F6" />
          <rect x="0" y="62" width="134" height="6" rx="3" fill="#E8692C"
            style={{ animation: "auth-pulse 3s ease-in-out infinite" }} />

          {/* ── Row 2: Fleet Uptime ── */}
          <text x="0" y="86" fontSize="10" fontWeight="600" fill="#374151" fontFamily="system-ui">Fleet Uptime</text>
          <text x="133" y="86" fontSize="9" fontWeight="700" fill="#22C55E" fontFamily="system-ui" textAnchor="end">98%</text>
          <rect x="0" y="90" width="160" height="6" rx="3" fill="#F3F4F6" />
          <rect x="0" y="90" width="157" height="6" rx="3" fill="#22C55E"
            style={{ animation: "auth-pulse 4s 0.5s ease-in-out infinite" }} />

          {/* ── Row 3: Maint. Alerts ── */}
          <text x="0" y="114" fontSize="10" fontWeight="600" fill="#374151" fontFamily="system-ui">Maint. Alerts</text>
          <text x="133" y="114" fontSize="9" fontWeight="700" fill="#F59E0B" fontFamily="system-ui" textAnchor="end">3</text>
          <rect x="0" y="118" width="160" height="6" rx="3" fill="#F3F4F6" />
          <rect x="0" y="118" width="30" height="6" rx="3" fill="#F59E0B"
            style={{ animation: "auth-pulse 3.5s 1s ease-in-out infinite" }} />

        </g>
      </svg>
    </div>
  );
}