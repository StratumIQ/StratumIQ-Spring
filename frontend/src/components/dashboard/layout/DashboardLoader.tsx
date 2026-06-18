"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function DashboardLoader() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing platform...");

  useEffect(() => {
    const stages = [
      { at: 800,  pct: 28, text: "Authenticating session..." },
      { at: 1600, pct: 55, text: "Loading workspace..." },
      { at: 2400, pct: 78, text: "Fetching fleet data..." },
      { at: 3000, pct: 92, text: "Almost ready..." },
    ];

    const timers = stages.map(({ at, pct, text }) =>
      setTimeout(() => {
        setProgress(pct);
        setStatusText(text);
      }, at)
    );

    // Smooth progress fill from 0 → 18 quickly on mount
    const kickoff = setTimeout(() => setProgress(18), 100);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(kickoff);
    };
  }, []);

  return (
    <div className="dash-splash">
      {/* Animated ring container */}
      <div className="dash-splash-ring-wrap">
        <svg
          className="dash-splash-rings"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          {/* Track ring */}
          <circle
            cx="100" cy="100" r="88"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1.5"
          />
          {/* Outer rotating orange arc */}
          <circle
            className="dash-ring-outer"
            cx="100" cy="100" r="88"
            fill="none"
            stroke="#E8692C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="220 352"
            strokeDashoffset="0"
          />

          {/* Track ring inner */}
          <circle
            cx="100" cy="100" r="72"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1.5"
          />
          {/* Inner counter-rotating white arc */}
          <circle
            className="dash-ring-inner"
            cx="100" cy="100" r="72"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="120 332"
            strokeDashoffset="0"
          />

          {/* Orbit dots on outer ring */}
          <circle className="dash-dot-orbit" cx="100" cy="12" r="3" fill="#E8692C" />
          <circle className="dash-dot-orbit dash-dot-orbit--2" cx="188" cy="100" r="2.2" fill="rgba(255,255,255,0.5)" />
          <circle className="dash-dot-orbit dash-dot-orbit--3" cx="100" cy="188" r="2.5" fill="#E8692C" opacity="0.7" />
        </svg>

        {/* Logo in the center */}
        <div className="dash-splash-logo-wrap">
          <Image
            src="/logo-icon.png"
            alt="StratumIQ"
            width={68}
            height={68}
            className="dash-splash-logo-img"
            priority
          />
        </div>
      </div>

      {/* Wordmark */}
      <div className="dash-splash-brand">
        <span className="dash-splash-wordmark">
          Stratum<span>IQ</span>
        </span>
        <span className="dash-splash-tagline">Intelligence. Performance. Uptime.</span>
      </div>

      {/* Progress bar */}
      <div className="dash-splash-progress-wrap">
        <div className="dash-splash-progress-track">
          <div
            className="dash-splash-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="dash-splash-progress-text">{statusText}</span>
      </div>
    </div>
  );
}