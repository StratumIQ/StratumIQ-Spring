"use client";

/**
 * Auth Page — StratumIQ
 * Split screen: LEFT = brand panel, RIGHT = auth card (login ↔ signup flip)
 * NO vertical scroll — everything fits 100vh on all devices.
 */

import { useState, useEffect, Suspense, memo, useCallback, useRef, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/utils";

/* ─── TOKENS ─────────────────────────────────────────── */
const C = {
  orange:     "#E8692C",
  orangeDk:   "#C9531A",
  orangeGlow: "rgba(232,105,44,0.30)",
  orangeDim:  "rgba(232,105,44,0.10)",
  bg:         "#0B0F1A",
  panel:      "#111827",
  card:       "#161D2E",
  border:     "rgba(255,255,255,0.07)",
  borderFoc:  "rgba(232,105,44,0.60)",
  text:       "#EFF2F7",
  muted:      "rgba(239,242,247,0.45)",
  faint:      "rgba(239,242,247,0.20)",
  shadow:     "0 24px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
} as const;

/* ─── PREMIUM SVG ICONS ───────────────────────────────── */
const Logo = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M15 6C15 4.067 13.433 2.5 11.5 2.5H8C5.515 2.5 5.515 7.5 8 7.5H11.5C13.985 7.5 13.985 12.5 11.5 12.5H7"
      stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeIcon = ({ off }: { off?: boolean }) => off ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const SpinIcon = () => (
  <svg style={{ animation: "auth-spin .75s linear infinite", flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(239,242,247,0.20)" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#E8692C" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

/* Feature icons */
const FleetIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E8692C" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="14" height="12" rx="2"/>
    <path d="M15 7h4l3 3v5h-7V7z"/>
    <circle cx="5" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>
  </svg>
);
const PartsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E8692C" strokeWidth="1.7" strokeLinecap="round">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
  </svg>
);
const MaintIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E8692C" strokeWidth="1.7" strokeLinecap="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const AIIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E8692C" strokeWidth="1.7" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
);

const FEATURES = [
  { Icon: FleetIcon, title: "Fleet Intelligence",     desc: "Real-time visibility across all machines & sites." },
  { Icon: PartsIcon, title: "Parts Marketplace",      desc: "OEM & aftermarket parts with smart inventory alerts." },
  { Icon: MaintIcon, title: "Predictive Maintenance", desc: "AI risk scores prevent breakdowns before they happen." },
  { Icon: AIIcon,    title: "AI Copilot",             desc: "Configure equipment and plan operations instantly." },
];

/* ─── STABLE COMPONENTS (defined outside to prevent recreation) ───────────────── */

function FL({ ch }: { ch: React.ReactNode }) {
  return <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", color: C.muted, textTransform: "uppercase" as const }}>{ch}</span>;
}

// Stable Input component
const Input = memo(({ 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  right, 
  compact 
}: {
  type?: string; 
  value: string; 
  onChange: (v: string) => void;
  placeholder?: string; 
  disabled?: boolean; 
  right?: React.ReactNode; 
  compact?: boolean;
}) => {
  const [foc, setFoc] = useState(false);
  
  // Stable handler using useCallback
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);
  
  return (
    <div style={{ position: "relative" }}>
      <input 
        type={type} 
        value={value} 
        disabled={disabled}
        onChange={handleChange}
        placeholder={placeholder}
        onFocus={() => setFoc(true)} 
        onBlur={() => setFoc(false)}
        style={{
          width: "100%", 
          height: compact ? 40 : 44,
          padding: right ? "0 42px 0 14px" : "0 14px",
          borderRadius: 9, 
          border: `1.5px solid ${foc ? C.borderFoc : C.border}`,
          background: foc ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
          color: disabled ? C.muted : C.text, 
          fontSize: 13.5,
          fontFamily: "var(--font-body), sans-serif", 
          outline: "none",
          transition: "border-color .15s, box-shadow .15s",
          boxShadow: foc ? `0 0 0 3px ${C.orangeDim}` : "none",
        }}
      />
      {right && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>{right}</div>}
    </div>
  );
});

Input.displayName = "Input";

// Stable OTPRow component
const OTPRow = memo(({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const newValue = digits.map((d, j) => j === i ? e.key : d).join("");
      onChange(newValue);
      if (i < 5 && inputRefs.current[i + 1]) {
        inputRefs.current[i + 1]?.focus();
      }
    } else if (e.key === "Backspace") {
      e.preventDefault();
      const newValue = digits.map((d, j) => j === i ? "" : d).join("");
      onChange(newValue);
      if (i > 0 && inputRefs.current[i - 1]) {
        inputRefs.current[i - 1]?.focus();
      }
    }
  }, [digits, onChange]);
  
  return (
    <div style={{ display: "flex", gap: 7, justifyContent: "center", width: "100%" }}>
      {digits.map((d, i) => (
        <input 
          key={i} 
          ref={el => { inputRefs.current[i] = el; }}
          type="text" 
          inputMode="numeric" 
          maxLength={1}
          value={d} 
          onChange={() => {}} 
          onKeyDown={(e) => handleKeyDown(e, i)}
          style={{
            width: 42, height: 50, textAlign: "center", borderRadius: 9,
            border: `2px solid ${d ? C.orange : C.border}`,
            background: d ? C.orangeDim : "rgba(255,255,255,0.02)",
            color: C.text, fontSize: 20, fontWeight: 800,
            fontFamily: "var(--font-body), sans-serif", outline: "none", transition: "all .15s",
          }}
          onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orangeDim}`; }}
          onBlur={e => { if (!d) { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; } }}
        />
      ))}
    </div>
  );
});

OTPRow.displayName = "OTPRow";

function PBtn({ children, type = "button", loading, onClick }: {
  children: React.ReactNode; 
  type?: "button"|"submit"; 
  loading?: boolean; 
  onClick?: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={loading}
      onMouseEnter={() => setHov(true)} 
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", 
        height: 44, 
        borderRadius: 10, 
        border: "none",
        background: loading ? `${C.orange}80` : hov ? C.orangeDk : C.orange,
        color: "#fff", 
        fontSize: 13.5, 
        fontWeight: 700, 
        fontFamily: "var(--font-body), sans-serif",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        gap: 8,
        transition: "background .15s, transform .15s, box-shadow .15s",
        boxShadow: hov && !loading ? `0 6px 22px ${C.orangeGlow}` : `0 3px 10px rgba(232,105,44,0.2)`,
        transform: hov && !loading ? "translateY(-1px)" : "none",
      }}>
      {loading && <SpinIcon />}{children}
    </button>
  );
}

function SBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button 
      type="button" 
      onClick={onClick}
      onMouseEnter={() => setHov(true)} 
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", 
        height: 40, 
        borderRadius: 10,
        border: `1px solid ${hov ? "rgba(232,105,44,0.35)" : C.border}`,
        background: hov ? C.orangeDim : "rgba(255,255,255,0.02)",
        color: hov ? C.orange : C.muted, 
        fontSize: 13, 
        fontWeight: 600,
        fontFamily: "var(--font-body), sans-serif", 
        cursor: "pointer", 
        transition: "all .15s",
      }}>
      {children}
    </button>
  );
}

function Err({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{ 
      padding: "8px 12px", 
      borderRadius: 8, 
      marginBottom: 8,
      background: "rgba(239,68,68,0.07)", 
      border: "1px solid rgba(239,68,68,0.22)",
      fontSize: 12, 
      color: "#FCA5A5", 
      lineHeight: 1.5 
    }}>
      {msg}
    </div>
  );
}

function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button 
      type="button" 
      onClick={toggle}
      style={{ 
        background: "none", 
        border: "none", 
        cursor: "pointer", 
        color: C.muted, 
        padding: 0, 
        display: "flex" 
      }}>
      <EyeIcon off={show} />
    </button>
  );
}

function Dots({ cur, total }: { cur: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 12 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ 
          height: 3, 
          borderRadius: 99, 
          width: i === cur ? 20 : 6,
          background: i <= cur ? C.orange : C.border, 
          transition: "all .3s" 
        }} />
      ))}
    </div>
  );
}

function Div({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0" }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontSize: 11, color: C.faint }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

// Animated wrapper without any key
const AnimatedWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ animation: "auth-slide .26s cubic-bezier(0.16,1,0.3,1) both" }}>
    {children}
  </div>
);

/* ─── LEFT BRAND PANEL ───────────────────────────────── */
function BrandPanel() {
  const [fi, setFi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFi(p => (p + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);
  const { Icon, title, desc } = FEATURES[fi];

  return (
    <div style={{
      width: "100%", 
      height: "100%", 
      position: "relative", 
      overflow: "hidden",
      background: "linear-gradient(150deg,#0C1120 0%,#0F1928 55%,#0D1E32 100%)",
      display: "flex", 
      flexDirection: "column",
      padding: "clamp(24px,3.5vh,44px) clamp(24px,3.5vw,48px)",
    }}>
      <div style={{ 
        position:"absolute",
        inset:0,
        opacity:0.3,
        backgroundImage:"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
        backgroundSize:"36px 36px",
        pointerEvents:"none" 
      }} />
      <div style={{ 
        position:"absolute",
        top:"20%",
        left:"0%",
        width:"70%",
        height:"50%",
        background:`radial-gradient(ellipse,rgba(232,105,44,0.22) 0%,transparent 65%)`,
        filter:"blur(50px)",
        pointerEvents:"none" 
      }} />
      <div style={{ 
        position:"absolute",
        bottom:"0%",
        right:"-10%",
        width:"50%",
        height:"40%",
        background:"radial-gradient(ellipse,rgba(37,99,235,0.12) 0%,transparent 65%)",
        filter:"blur(40px)",
        pointerEvents:"none" 
      }} />

      <div style={{ 
        position:"relative",
        display:"flex",
        flexDirection:"column",
        height:"100%",
        justifyContent:"space-between" 
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ 
            width:34,
            height:34,
            borderRadius:9,
            flexShrink:0,
            background:`linear-gradient(135deg,${C.orange},${C.orangeDk})`,
            boxShadow:`0 0 16px ${C.orangeGlow}`,
            display:"flex",
            alignItems:"center",
            justifyContent:"center" 
          }}>
            <Logo />
          </div>
          <span style={{ 
            fontSize:15,
            fontWeight:800,
            color:C.text,
            letterSpacing:"-0.02em",
            fontFamily:"var(--font-heading),sans-serif" 
          }}>
            Stratum<span style={{ color:C.orange }}> IQ</span>
          </span>
        </div>

        <div>
          <h1 style={{ 
            fontSize:"clamp(22px,2.8vw,38px)",
            fontWeight:800,
            color:C.text,
            lineHeight:1.08,
            letterSpacing:"-0.04em",
            margin:"0 0 clamp(8px,1.2vh,14px)",
            fontFamily:"var(--font-heading),sans-serif" 
          }}>
            Run your quarry<br />
            <span style={{ 
              background:`linear-gradient(88deg,${C.orange},#F5A133)`,
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              backgroundClip:"text" 
            }}>
              smarter, not harder.
            </span>
          </h1>
          <p style={{ 
            fontSize:"clamp(12px,1vw,13.5px)",
            color:C.muted,
            lineHeight:1.7,
            maxWidth:300,
            margin:0 
          }}>
            Fleet, parts, maintenance, and AI — in one unified workspace for heavy equipment operators.
          </p>
        </div>

        <div style={{ 
          background:"rgba(255,255,255,0.04)",
          backdropFilter:"blur(10px)",
          border:`1px solid ${C.border}`,
          borderRadius:12,
          padding:"clamp(12px,1.5vh,16px) 14px",
          boxShadow:"0 8px 28px rgba(0,0,0,0.25)" 
        }}>
          <div style={{ display:"flex", gap:11, alignItems:"flex-start" }}>
            <div style={{ 
              width:34,
              height:34,
              borderRadius:8,
              flexShrink:0,
              background:"rgba(232,105,44,0.12)",
              border:"1px solid rgba(232,105,44,0.22)",
              display:"flex",
              alignItems:"center",
              justifyContent:"center" 
            }}>
              <Icon />
            </div>
            <div>
              <div style={{ fontSize:12.5, fontWeight:700, color:C.text, marginBottom:2 }}>{title}</div>
              <div style={{ fontSize:11.5, color:C.muted, lineHeight:1.55 }}>{desc}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:4, marginTop:10 }}>
            {FEATURES.map((_,i) => (
              <button 
                key={i} 
                onClick={() => setFi(i)} 
                style={{ 
                  height:3,
                  flex:1,
                  borderRadius:99,
                  border:"none",
                  cursor:"pointer",
                  background:i===fi ? C.orange : C.border,
                  transition:"background .3s" 
                }} 
              />
            ))}
          </div>
        </div>

        <div style={{ display:"flex", gap:8 }}>
          {[["2,400+","Machines"],["98.2%","Uptime"],["47%","Less Downtime"]].map(([v,l],i) => (
            <div key={i} style={{ 
              flex:1,
              background:"rgba(255,255,255,0.025)",
              borderRadius:9,
              border:`1px solid ${C.border}`,
              padding:"clamp(8px,1vh,12px) 6px",
              textAlign:"center" 
            }}>
              <div style={{ 
                fontSize:"clamp(13px,1.3vw,17px)",
                fontWeight:800,
                color:C.orange,
                letterSpacing:"-0.03em",
                fontFamily:"var(--font-heading),sans-serif",
                lineHeight:1 
              }}>{v}</div>
              <div style={{ 
                fontSize:9.5,
                color:C.faint,
                marginTop:3,
                fontWeight:600,
                letterSpacing:"0.04em" 
              }}>{l}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ display:"flex", gap:3, alignItems:"center", marginBottom:5 }}>
            {[...Array(5)].map((_,i) => <StarIcon key={i} />)}
            <span style={{ fontSize:11, color:C.muted, marginLeft:5 }}>Trusted by 800+ operators</span>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" as const }}>
            {["🔒 SOC 2","⚡ 99.9% SLA","🌏 Pan-India"].map(s => (
              <span key={s} style={{ fontSize:10.5, color:C.faint }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── AUTH FORMS ─────────────────────────────────────── */
type Mode = "login"|"register";
type Step = "login"|"register"|"verify-email"|"verify-phone"|"done";

function AuthForms() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const init         = (searchParams?.get("mode") as Mode) ?? "login";

  const [mode,    setMode]   = useState<Mode>(init);
  const [step,    setStep]   = useState<Step>(init);
  const [loading, setLoad]   = useState(false);
  const [error,   setError]  = useState("");
  const [userId,  setUID]    = useState<number|null>(null);

  const [lEmail, setLE] = useState("");
  const [lPw,    setLP] = useState("");
  const [showLP, setSLP] = useState(false);

  const [rFirst, setRF] = useState("");
  const [rLast,  setRL] = useState("");
  const [rEmail, setRE] = useState("");
  const [rPw,    setRP] = useState("");
  const [rPhone, setPH] = useState("");
  const [showRP, setSRP] = useState(false);

  const [eOTP, setEOTP] = useState("");
  const [pOTP, setPOTP] = useState("");

  const nav = useCallback((s: Step) => { 
    setError(""); 
    setStep(s); 
  }, []);
  
  const sw = useCallback((m: Mode) => { 
    if (mode===m) return; 
    setError(""); 
    setMode(m); 
    nav(m); 
  }, [mode, nav]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(""); 
    setLoad(true);
    try {
      const r = await authAPI.login({ email: lEmail.trim(), password: lPw });
      if (r.accessToken) { 
        localStorage.setItem("token", r.accessToken); 
        router.push("/dashboard"); 
      }
    } catch (err: unknown) { 
      setError(err instanceof Error ? err.message : "Login failed."); 
    } finally { 
      setLoad(false); 
    }
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError("");
    if (rPw.length < 8)               return setError("Password: min 8 characters.");
    if (!/[A-Z]/.test(rPw))           return setError("Password: at least one uppercase.");
    if (!/[0-9]/.test(rPw))           return setError("Password: at least one number.");
    if (!/[!@#$%^&*]/.test(rPw))      return setError("Password: at least one special char.");
    if (!/^\+?[0-9]{10,15}$/.test(rPhone)) return setError("Phone: 10–15 digits, with optional +");
    setLoad(true);
    try {
      const r = await authAPI.register({ 
        firstName: rFirst, 
        lastName: rLast, 
        email: rEmail, 
        password: rPw, 
        phone: rPhone 
      });
      if (r.userId) { 
        setUID(r.userId); 
        nav("verify-email"); 
      }
    } catch (err: unknown) { 
      setError(err instanceof Error ? err.message : "Registration failed."); 
    } finally { 
      setLoad(false); 
    }
  };

  const doVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || eOTP.length < 6) return setError("Enter the full 6-digit code.");
    setError(""); 
    setLoad(true);
    try {
      await authAPI.verifyEmailOTP({ userId, otp: eOTP });
      await authAPI.sendPhoneOTP({ userId, phone: rPhone });
      nav("verify-phone");
    } catch (err: unknown) { 
      setError(err instanceof Error ? err.message : "Verification failed."); 
    } finally { 
      setLoad(false); 
    }
  };

  const doVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || pOTP.length < 6) return setError("Enter the full 6-digit code.");
    setError(""); 
    setLoad(true);
    try {
      const r = await authAPI.verifyPhoneOTP({ userId, otp: pOTP });
      if (r.accessToken) {
        localStorage.setItem("token", r.accessToken);
        nav("done");
        setTimeout(() => router.push("/dashboard"), 900);
      }
    } catch (err: unknown) { 
      setError(err instanceof Error ? err.message : "Verification failed."); 
    } finally { 
      setLoad(false); 
    }
  };

  // Render different forms based on step
  if (step === "login") {
    return (
      <AnimatedWrapper>
        <h2 style={{ 
          fontSize:"clamp(19px,1.9vw,25px)",
          fontWeight:800,
          color:C.text,
          letterSpacing:"-0.04em",
          margin:"0 0 3px",
          fontFamily:"var(--font-heading),sans-serif" 
        }}>
          Welcome back.
        </h2>
        <p style={{ fontSize:12.5, color:C.muted, margin:"0 0 14px" }}>Sign in to your workspace</p>
        <Err msg={error} />
        <form onSubmit={doLogin} style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <FL ch="Email address" />
            <Input 
              type="email" 
              value={lEmail} 
              onChange={setLE} 
              placeholder="you@company.com" 
              compact 
            />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <FL ch="Password" />
              <button 
                type="button" 
                style={{ 
                  background:"none",
                  border:"none",
                  fontSize:11,
                  color:C.orange,
                  cursor:"pointer",
                  fontFamily:"inherit",
                  padding:0 
                }}>
                Forgot password?
              </button>
            </div>
            <Input 
              type={showLP ? "text" : "password"} 
              value={lPw} 
              onChange={setLP}
              placeholder="Your password" 
              compact
              right={<EyeBtn show={showLP} toggle={() => setSLP(p => !p)} />} 
            />
          </div>
          <div style={{ marginTop:2 }}>
            <PBtn type="submit" loading={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </PBtn>
          </div>
        </form>
        <Div label="New to StratumIQ?" />
        <SBtn onClick={() => sw("register")}>Create a free account →</SBtn>
      </AnimatedWrapper>
    );
  }

  if (step === "register") {
    return (
      <AnimatedWrapper>
        <h2 style={{ 
          fontSize:"clamp(19px,1.9vw,25px)",
          fontWeight:800,
          color:C.text,
          letterSpacing:"-0.04em",
          margin:"0 0 3px",
          fontFamily:"var(--font-heading),sans-serif" 
        }}>
          Create account.
        </h2>
        <p style={{ fontSize:12.5, color:C.muted, margin:"0 0 10px" }}>
          Join operators running on StratumIQ
        </p>
        <Dots cur={0} total={3} />
        <Err msg={error} />
        <form onSubmit={doRegister} style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <FL ch="First name" />
              <Input value={rFirst} onChange={setRF} placeholder="Ramesh" compact />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <FL ch="Last name" />
              <Input value={rLast} onChange={setRL} placeholder="Kumar" compact />
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <FL ch="Email address" />
            <Input type="email" value={rEmail} onChange={setRE} placeholder="you@company.com" compact />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <FL ch="Password" />
            <Input 
              type={showRP ? "text" : "password"} 
              value={rPw} 
              onChange={setRP}
              placeholder="8+ chars · A–Z · 0–9 · symbol" 
              compact              right={<EyeBtn show={showRP} toggle={() => setSRP(p => !p)} />} 
            />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <FL ch="Phone number" />
            <Input type="tel" value={rPhone} onChange={setPH} placeholder="+91 98765 43210" compact />
          </div>
          <div style={{ marginTop:2 }}>
            <PBtn type="submit" loading={loading}>
              {loading ? "Creating account…" : "Create Account →"}
            </PBtn>
          </div>
        </form>
        <Div label="Already have an account?" />
        <SBtn onClick={() => sw("login")}>Sign in instead</SBtn>
      </AnimatedWrapper>
    );
  }

  if (step === "verify-email") {
    return (
      <AnimatedWrapper>
        <div style={{ textAlign:"center", marginBottom:12 }}>
          <h2 style={{ 
            fontSize:"clamp(18px,1.8vw,23px)",
            fontWeight:800,
            color:C.text,
            letterSpacing:"-0.04em",
            margin:"0 0 6px",
            fontFamily:"var(--font-heading),sans-serif" 
          }}>
            Check your email.
          </h2>
          <Dots cur={1} total={3} />
          <p style={{ fontSize:12.5, color:C.muted, lineHeight:1.6, margin:"0 0 16px" }}>
            Code sent to <strong style={{ color:C.text }}>{rEmail}</strong>
          </p>
        </div>
        <Err msg={error} />
        <form onSubmit={doVerifyEmail} style={{ display:"flex", flexDirection:"column", gap:14, alignItems:"center" }}>
          <OTPRow value={eOTP} onChange={setEOTP} />
          <PBtn type="submit" loading={loading}>
            {loading ? "Verifying…" : "Verify Email →"}
          </PBtn>
          <button 
            type="button" 
            onClick={() => { setEOTP(""); setError(""); }}
            style={{ 
              background:"none",
              border:"none",
              fontSize:12,
              color:C.muted,
              cursor:"pointer",
              fontFamily:"inherit" 
            }}>
            Resend code
          </button>
        </form>
      </AnimatedWrapper>
    );
  }

  if (step === "verify-phone") {
    return (
      <AnimatedWrapper>
        <div style={{ textAlign:"center", marginBottom:12 }}>
          <h2 style={{ 
            fontSize:"clamp(18px,1.8vw,23px)",
            fontWeight:800,
            color:C.text,
            letterSpacing:"-0.04em",
            margin:"0 0 6px",
            fontFamily:"var(--font-heading),sans-serif" 
          }}>
            Verify your phone.
          </h2>
          <Dots cur={2} total={3} />
          <p style={{ fontSize:12.5, color:C.muted, lineHeight:1.6, margin:"0 0 16px" }}>
            Code sent to <strong style={{ color:C.text }}>{rPhone}</strong>
          </p>
        </div>
        <Err msg={error} />
        <form onSubmit={doVerifyPhone} style={{ display:"flex", flexDirection:"column", gap:14, alignItems:"center" }}>
          <OTPRow value={pOTP} onChange={setPOTP} />
          <PBtn type="submit" loading={loading}>
            {loading ? "Activating…" : "Activate Account →"}
          </PBtn>
          <button 
            type="button"
            onClick={() => userId && authAPI.sendPhoneOTP({ userId, phone: rPhone }).catch(()=>{})}
            style={{ 
              background:"none",
              border:"none",
              fontSize:12,
              color:C.muted,
              cursor:"pointer",
              fontFamily:"inherit" 
            }}>
            Resend code
          </button>
        </form>
      </AnimatedWrapper>
    );
  }

  // done step
  return (
    <AnimatedWrapper>
      <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:44, marginBottom:10 }}>🎉</div>
        <h2 style={{ 
          fontSize:22,
          fontWeight:800,
          color:C.text,
          letterSpacing:"-0.04em",
          margin:"0 0 6px",
          fontFamily:"var(--font-heading),sans-serif" 
        }}>
          You're in!
        </h2>
        <p style={{ fontSize:13, color:C.muted, marginBottom:16 }}>Setting up your workspace…</p>
        <div style={{ display:"flex", justifyContent:"center" }}><SpinIcon /></div>
      </div>
    </AnimatedWrapper>
  );
}

/* ─── PAGE ROOT ──────────────────────────────────────── */
export default function AuthPage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; }
        @keyframes auth-spin  { to { transform: rotate(360deg); } }
        @keyframes auth-slide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 820px) {
          .auth-brand { display: none !important; }
          .auth-right { overflow-y: auto !important; align-items: flex-start !important; padding-top: 32px !important; }
        }
      `}</style>

      <div style={{ 
        display:"flex",
        height:"100vh",
        width:"100vw",
        overflow:"hidden",
        background:C.bg,
        fontFamily:"var(--font-body), sans-serif" 
      }}>
        <div className="auth-brand" style={{ width:"50%", flexShrink:0, overflow:"hidden" }}>
          <BrandPanel />
        </div>

        <div className="auth-right" style={{ 
          flex:1,
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          background:C.panel,
          position:"relative",
          overflow:"hidden",
          padding:"clamp(16px,2.5vw,36px)" 
        }}>
          <div style={{ 
            position:"absolute",
            inset:0,
            opacity:0.18,
            backgroundImage:"linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px)",
            backgroundSize:"28px 28px",
            pointerEvents:"none" 
          }} />
          
          <div style={{ width:"100%", maxWidth:390, display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <div style={{ 
                width:26,
                height:26,
                borderRadius:7,
                flexShrink:0,
                background:`linear-gradient(135deg,${C.orange},${C.orangeDk})`,
                display:"flex",
                alignItems:"center",
                justifyContent:"center" 
              }}>
                <Logo />
              </div>
              <span style={{ 
                fontSize:12.5,
                fontWeight:800,
                color:C.text,
                letterSpacing:"-0.02em",
                fontFamily:"var(--font-heading),sans-serif" 
              }}>
                Stratum<span style={{ color:C.orange }}> IQ</span>
              </span>
            </div>

            <div style={{ 
              background:C.card,
              border:`1px solid ${C.border}`,
              borderRadius:14,
              padding:"clamp(18px,2.5vh,26px) clamp(16px,2vw,26px)",
              boxShadow:C.shadow 
            }}>
              <Suspense fallback={null}>
                <AuthForms />
              </Suspense>
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, marginTop:10 }}>
              <ShieldIcon />
              <span style={{ fontSize:10.5, color:C.faint }}>JWT auth · OTP verified · Encrypted in transit</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}