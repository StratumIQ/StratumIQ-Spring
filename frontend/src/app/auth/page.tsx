"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Loader2, Shield, Truck, Wrench, Sparkles,
  CheckCircle2,
} from "lucide-react";
import { authAPI } from "@/lib/utils";
import { API_URL } from "@/lib/constants";
import { getDashboardPath } from "@/lib/routing/dashboardRoutes";
import { notify } from "@/lib/toast";
import AuthToaster from "@/components/auth/AuthToaster";
import AuthIllustration from "@/components/auth/AuthIllustration";
import AuthLottie from "@/components/auth/AuthLottie";
import OtpInput from "@/components/auth/OtpInput";
import {
  checkPassword,
  isValidEmail,
  normalizeIndianPhone,
  passwordStrength,
  validateIndianPhone,
} from "@/lib/validation";

type Mode = "login" | "register";
type Step = "login" | "register-1" | "register-2" | "register-3" | "verify-email" | "verify-phone" | "done";

const REMEMBER_KEY = "auth_remember_email";

function AuthForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const init = (searchParams?.get("mode") as Mode) ?? "login";

  const [mode, setMode] = useState<Mode>(init);
  const [step, setStep] = useState<Step>(init === "register" ? "register-1" : "login");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [lEmail, setLEmail] = useState("");
  const [lPw, setLPw] = useState("");
  const [showLPw, setShowLPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  const [rFirst, setRFirst] = useState("");
  const [rLast, setRLast] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPw, setRPw] = useState("");
  const [rConfirm, setRConfirm] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [showRPw, setShowRPw] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const [eOtp, setEOtp] = useState("");
  const [pOtp, setPOtp] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) { setLEmail(saved); setRemember(true); }
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep(m === "register" ? "register-1" : "login");
    setRegErrors({});
    setLoginErrors({});
  };

  const validateLogin = () => {
    const errs: typeof loginErrors = {};
    if (!lEmail.trim() || !isValidEmail(lEmail)) errs.email = "Enter a valid email address";
    if (!lPw) errs.password = "Password is required";
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegStep = (s: Step) => {
    const errs: Record<string, string> = {};
    if (s === "register-1") {
      if (!rFirst.trim()) errs.firstName = "First name is required";
      if (!rLast.trim()) errs.lastName = "Last name is required";
    }
    if (s === "register-2") {
      if (!rEmail.trim() || !isValidEmail(rEmail)) errs.email = "Enter a valid email address";
      const pwCheck = checkPassword(rPw);
      if (!pwCheck.minLength) errs.password = "Minimum 8 characters required";
      else if (!pwCheck.uppercase) errs.password = "Include at least one uppercase letter";
      else if (!pwCheck.lowercase) errs.password = "Include at least one lowercase letter";
      else if (!pwCheck.number) errs.password = "Include at least one number";
      else if (!pwCheck.special) errs.password = "Include at least one special character";
      if (rPw !== rConfirm) errs.confirm = "Passwords do not match";
    }
    if (s === "register-3") {
      const phoneErr = validateIndianPhone(rPhone);
      if (phoneErr) errs.phone = phoneErr;
    }
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const r = await authAPI.login({ email: lEmail.trim(), password: lPw });
      // Token is now in httpOnly cookie; no need to store it
      if (remember) localStorage.setItem(REMEMBER_KEY, lEmail.trim());
      else localStorage.removeItem(REMEMBER_KEY);
      setSuccess(true);
      notify.success("Signed in successfully");
      // Fetch profile using credentials (cookies sent automatically)
      const profile = await fetch(`${API_URL}/dashboard/profile`, {
        credentials: "include",
      }).then((res) => res.json()).catch(() => null);
      router.push(getDashboardPath(profile?.role ?? profile?.user?.role ?? "USER"));
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async () => {
    if (!validateRegStep("register-3")) return;
    setLoading(true);
    try {
      const r = await authAPI.register({
        firstName: rFirst.trim(),
        lastName: rLast.trim(),
        email: rEmail.trim(),
        password: rPw,
        phone: normalizeIndianPhone(rPhone),
      });
      if (r.userId) {
        setUserId(r.userId);
        setStep("verify-email");
        notify.success("Account created. Check your email for the verification code.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      if (/email already/i.test(msg)) setRegErrors((prev) => ({ ...prev, email: "This email is already registered" }));
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const doVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || eOtp.length < 6) { notify.error("Enter the full 6-digit code"); return; }
    setLoading(true);
    try {
      await authAPI.verifyEmailOTP({ userId, otp: eOtp });
      await authAPI.sendPhoneOTP({ userId, phone: normalizeIndianPhone(rPhone) });
      setStep("verify-phone");
      notify.success("Email verified");
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const doVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || pOtp.length < 6) { notify.error("Enter the full 6-digit code"); return; }
    setLoading(true);
    try {
      const r = await authAPI.verifyPhoneOTP({ userId, otp: pOtp });
      // Token is now in httpOnly cookie; no need to store it
      setStep("done");
      notify.success("Account activated");
      // Fetch profile using credentials (cookies sent automatically)
      const profile = await fetch(`${API_URL}/dashboard/profile`, {
        credentials: "include",
      }).then((res) => res.json()).catch(() => null);
      setTimeout(() => router.push(getDashboardPath(profile?.role ?? profile?.user?.role ?? "USER")), 800);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const pwStr = passwordStrength(rPw);
  const pwCheck = checkPassword(rPw);
  const regStepIndex = step.startsWith("register") ? parseInt(step.split("-")[1] ?? "1") - 1 : 0;

  const renderContent = () => {
    if (step === "login") {
      return (
        <motion.div key="login" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
          <h2>Welcome back</h2>
          <p className="auth-card-sub">Sign in to your StratumIQ workspace</p>
          <form onSubmit={doLogin}>
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input className={`auth-input ${loginErrors.email ? "auth-input--error" : ""}`} type="email" value={lEmail} onChange={(e) => setLEmail(e.target.value)} placeholder="you@company.com" />
              {loginErrors.email && <p className="auth-field-error">{loginErrors.email}</p>}
            </div>
            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
                <button type="button" className="auth-link" onClick={() => notify.info("Password reset will be available soon.")}>Forgot password?</button>
              </div>
              <div className="auth-input-wrap">
                <input className={`auth-input has-toggle ${loginErrors.password ? "auth-input--error" : ""}`} type={showLPw ? "text" : "password"} value={lPw} onChange={(e) => setLPw(e.target.value)} placeholder="Your password" />
                <button type="button" className="auth-eye" onClick={() => setShowLPw((p) => !p)} aria-label="Toggle password">{showLPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              {loginErrors.password && <p className="auth-field-error">{loginErrors.password}</p>}
            </div>
            <div className="auth-row">
              <label className="auth-check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
            </div>
            <button type="submit" className={`auth-btn ${success ? "auth-btn--success" : ""}`} disabled={loading}>
              {loading ? <Loader2 size={16} className="auth-spin" /> : success ? <CheckCircle2 size={16} /> : null}
              {loading ? "Signing in…" : success ? "Success" : "Sign In"}
            </button>
          </form>
          <div className="auth-divider">New to StratumIQ?</div>
          <button type="button" className="auth-btn-secondary" onClick={() => switchMode("register")}>Create a free account</button>
        </motion.div>
      );
    }

    if (step.startsWith("register")) {
      return (
        <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
          <h2>Create account</h2>
          <p className="auth-card-sub">Step {regStepIndex + 1} of 3</p>
          <div className="auth-progress">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`auth-progress-seg ${i < regStepIndex ? "done" : ""} ${i === regStepIndex ? "active" : ""}`} />
            ))}
          </div>

          {step === "register-1" && (
            <>
              <div className="auth-grid-2">
                <div className="auth-field">
                  <label className="auth-label">First name</label>
                  <input className={`auth-input ${regErrors.firstName ? "auth-input--error" : ""}`} value={rFirst} onChange={(e) => setRFirst(e.target.value)} placeholder="Ramesh" />
                  {regErrors.firstName && <p className="auth-field-error">{regErrors.firstName}</p>}
                </div>
                <div className="auth-field">
                  <label className="auth-label">Last name</label>
                  <input className={`auth-input ${regErrors.lastName ? "auth-input--error" : ""}`} value={rLast} onChange={(e) => setRLast(e.target.value)} placeholder="Kumar" />
                  {regErrors.lastName && <p className="auth-field-error">{regErrors.lastName}</p>}
                </div>
              </div>
              <button type="button" className="auth-btn" onClick={() => validateRegStep("register-1") && setStep("register-2")}>Continue</button>
            </>
          )}

          {step === "register-2" && (
            <>
              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <input className={`auth-input ${regErrors.email ? "auth-input--error" : ""}`} type="email" value={rEmail} onChange={(e) => setREmail(e.target.value)} placeholder="you@company.com" />
                {regErrors.email && <p className="auth-field-error">{regErrors.email}</p>}
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <input className={`auth-input has-toggle ${regErrors.password ? "auth-input--error" : ""}`} type={showRPw ? "text" : "password"} value={rPw} onChange={(e) => setRPw(e.target.value)} placeholder="Create a strong password" />
                  <button type="button" className="auth-eye" onClick={() => setShowRPw((p) => !p)}>{showRPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {rPw && (
                  <div className="auth-pw-meter">
                    <div className="auth-strength">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="auth-strength-bar" style={{ background: i <= pwStr.score ? pwStr.color : undefined }} />
                      ))}
                    </div>
                    <p className="auth-field-hint" style={{ color: pwStr.color }}>Password strength: {pwStr.label}</p>
                    <ul className="auth-pw-rules">
                      {[
                        { ok: pwCheck.minLength, label: "At least 8 characters" },
                        { ok: pwCheck.uppercase, label: "One uppercase letter" },
                        { ok: pwCheck.lowercase, label: "One lowercase letter" },
                        { ok: pwCheck.number, label: "One number" },
                        { ok: pwCheck.special, label: "One special character" },
                      ].map(({ ok, label }) => (
                        <li key={label} className={ok ? "auth-pw-rule--ok" : ""}>{label}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {regErrors.password && <p className="auth-field-error">{regErrors.password}</p>}
              </div>
              <div className="auth-field">
                <label className="auth-label">Confirm password</label>
                <input className={`auth-input ${regErrors.confirm ? "auth-input--error" : ""}`} type="password" value={rConfirm} onChange={(e) => setRConfirm(e.target.value)} placeholder="Repeat password" />
                {regErrors.confirm && <p className="auth-field-error">{regErrors.confirm}</p>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="auth-btn-secondary" style={{ flex: 1 }} onClick={() => setStep("register-1")}>Back</button>
                <button type="button" className="auth-btn" style={{ flex: 2 }} onClick={() => validateRegStep("register-2") && setStep("register-3")}>Continue</button>
              </div>
            </>
          )}

          {step === "register-3" && (
            <>
              <div className="auth-field">
                <label className="auth-label">Phone number</label>
                <input
                  className={`auth-input ${regErrors.phone ? "auth-input--error" : ""}`}
                  type="tel"
                  inputMode="numeric"
                  value={rPhone}
                  onChange={(e) => setRPhone(e.target.value.replace(/[^\d+\s]/g, ""))}
                  placeholder="9876543210"
                  maxLength={14}
                />
                {regErrors.phone && <p className="auth-field-error">{regErrors.phone}</p>}
                <p className="auth-field-hint">India: 10 digits only · Used for OTP verification</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="auth-btn-secondary" style={{ flex: 1 }} onClick={() => setStep("register-2")}>Back</button>
                <button type="button" className="auth-btn" style={{ flex: 2 }} disabled={loading} onClick={doRegister}>
                  {loading ? <Loader2 size={16} className="auth-spin" /> : null}
                  {loading ? "Creating…" : "Create Account"}
                </button>
              </div>
            </>
          )}

          <div className="auth-divider">Already have an account?</div>
          <button type="button" className="auth-btn-secondary" onClick={() => switchMode("login")}>Sign in instead</button>
        </motion.div>
      );
    }

    if (step === "verify-email" || step === "verify-phone") {
      const isEmail = step === "verify-email";
      return (
        <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
          <h2>{isEmail ? "Verify your email" : "Verify your phone"}</h2>
          <p className="auth-card-sub">Code sent to <strong>{isEmail ? rEmail : rPhone}</strong></p>
          <form onSubmit={isEmail ? doVerifyEmail : doVerifyPhone}>
            <OtpInput value={isEmail ? eOtp : pOtp} onChange={isEmail ? setEOtp : setPOtp} length={6} />
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <Loader2 size={16} className="auth-spin" /> : null}
              {loading ? "Verifying…" : isEmail ? "Verify Email" : "Activate Account"}
            </button>
          </form>
        </motion.div>
      );
    }

    return (
      <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="auth-card-sub" style={{ textAlign: "center", padding: "24px 0" }}>
        <CheckCircle2 size={48} color="#16A34A" style={{ marginBottom: 12 }} />
        <h2 style={{ marginBottom: 8 }}>You&apos;re all set</h2>
        <p>Setting up your workspace…</p>
        <Loader2 size={20} className="auth-spin" style={{ marginTop: 16 }} />
      </motion.div>
    );
  };

  return (
    <div className="auth-card">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </div>
  );
}

export default function AuthPage() {
  return (
    <>
      <AuthToaster />
      <div className="auth-root">
        <aside className="auth-brand">
          <div className="auth-brand-grid" />
          <div className="auth-brand-glow" />
          <div className="auth-logo">
            <div className="auth-logo-mark">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M15 6C15 4.067 13.433 2.5 11.5 2.5H8C5.515 2.5 5.515 7.5 8 7.5H11.5C13.985 7.5 13.985 12.5 11.5 12.5H7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="auth-logo-text">Stratum<span style={{ color: "#E8692C" }}>IQ</span></span>
          </div>
          <div className="auth-hero">
            <h1>Run your quarry<br /><span>smarter, not harder</span></h1>
            <p>Fleet intelligence, predictive maintenance, and AI copilot — unified for heavy equipment operators.</p>
            <AuthIllustration />
            <AuthLottie />
          </div>
          <div className="auth-features">
            {[
              { Icon: Truck, title: "Fleet Intelligence", desc: "Real-time visibility across machines and sites." },
              { Icon: Wrench, title: "Predictive Maintenance", desc: "AI risk scores before breakdowns happen." },
              { Icon: Sparkles, title: "AI Copilot", desc: "Configure equipment and plan operations instantly." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="auth-feature">
                <div className="auth-feature-icon"><Icon size={17} /></div>
                <div><div className="auth-feature-title">{title}</div><div className="auth-feature-desc">{desc}</div></div>
              </div>
            ))}
          </div>
          <div className="auth-stats">
            {[["2,400+", "Machines"], ["98.2%", "Uptime"], ["47%", "Less Downtime"]].map(([v, l]) => (
              <div key={l} className="auth-stat"><div className="auth-stat-value">{v}</div><div className="auth-stat-label">{l}</div></div>
            ))}
          </div>
        </aside>
        <main className="auth-panel">
          <div className="auth-card-wrap">
            <Suspense fallback={<div className="auth-card"><Loader2 className="auth-spin" /></div>}>
              <AuthForms />
            </Suspense>
            <div className="auth-footer-note"><Shield size={12} /><span>JWT auth · OTP verified · Encrypted in transit</span></div>
          </div>
        </main>
      </div>
    </>
  );
}
