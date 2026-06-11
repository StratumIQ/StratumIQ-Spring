"use client";

import { useState, useRef, useEffect } from "react";
import { BRAND, DASH } from "@/lib/constants";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are the StratumIQ AI Assistant — helpful, concise, professional.
You help users set up their fleet, manage parts inventory, plan maintenance, and navigate platform features.
Keep responses concise (2–4 sentences). Use bullet points for steps. Always guide users toward completing their StratumIQ setup.`;

const SUGGESTED = ["Add Your Equipment", "Plan Inventory", "View Demo", "Chat with Copilot"];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Msg[]>([{
    role: "assistant",
    content: "Welcome! I'm your StratumIQ AI Assistant. I can help you add equipment, plan inventory, or explore the platform.",
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res  = await fetch("/api/ai-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...messages, userMsg], system: SYSTEM_PROMPT }) });
      const data = await res.json();
      setMessages(p => [...p, { role: "assistant", content: data.content ?? "Sorry, I couldn't process that." }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: 264, flexShrink: 0, background: DASH.surface, border: `1px solid ${DASH.border}`, borderRadius: 14, boxShadow: DASH.shadowMd, display: "flex", flexDirection: "column", overflow: "hidden", alignSelf: "flex-start", position: "sticky", top: "calc(58px + 28px)", maxHeight: "calc(100vh - 58px - 56px)" }}>

      {/* Header */}
      <div style={{ padding: "12px 14px", background: BRAND.navy, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(232,105,44,.18)", border: "1px solid rgba(232,105,44,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
              <path d="M14 5C14 3.34 12.66 2 11 2H7C4.79 2 4.79 7 7 7H11C13.21 7 13.21 12 11 12H6" stroke={BRAND.orange} strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff" }}>AI Onboarding Assistant</span>
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.5)", padding: 2 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 15l-6-6-6 6" strokeLinecap="round"/> : <path d="M6 9l6 6 6-6" strokeLinecap="round"/>}
          </svg>
        </button>
      </div>

      {open && (
        <>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "11px 12px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 300 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 6 }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 19, height: 19, borderRadius: 6, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeHover})`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                    <svg width="8" height="8" viewBox="0 0 18 18" fill="none"><path d="M14 5C14 3.34 12.66 2 11 2H7C4.79 2 4.79 7 7 7H11C13.21 7 13.21 12 11 12H6" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
                  </div>
                )}
                <div style={{ maxWidth: "82%", padding: "7px 10px", borderRadius: msg.role === "user" ? "10px 10px 2px 10px" : "2px 10px 10px 10px", background: msg.role === "user" ? BRAND.orange : DASH.surface2, border: msg.role === "assistant" ? `1px solid ${DASH.border}` : "none", fontSize: 12.5, lineHeight: 1.55, color: msg.role === "user" ? "#fff" : DASH.text }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 19, height: 19, borderRadius: 6, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeHover})`, flexShrink: 0 }} />
                <div style={{ padding: "7px 10px", background: DASH.surface2, border: `1px solid ${DASH.border}`, borderRadius: "2px 10px 10px 10px", display: "flex", gap: 3 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: DASH.text3, animation: `ai-bounce 1s ease-in-out ${i * 0.15}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick actions */}
          <div style={{ padding: "5px 12px 9px", display: "flex", flexDirection: "column", gap: 4, borderTop: `1px solid ${DASH.border}` }}>
            {SUGGESTED.map(s => (
              <button key={s} onClick={() => sendMessage(s)} style={{ width: "100%", padding: "6px 10px", borderRadius: 7, background: BRAND.navy, color: "#fff", border: "none", fontSize: 11.5, fontWeight: 600, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "opacity .15s" }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.opacity = ".8")}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >{s}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ borderTop: `1px solid ${DASH.border}`, padding: "9px 12px", display: "flex", gap: 7 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask anything…"
              style={{ flex: 1, padding: "6px 10px", background: DASH.surface2, border: `1px solid ${DASH.border}`, borderRadius: 7, fontSize: 12.5, color: DASH.text, fontFamily: "inherit", outline: "none" }}
              onFocus={e => (e.target.style.borderColor = BRAND.orange)} onBlur={e => (e.target.style.borderColor = DASH.border)}
            />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{ width: 30, height: 30, borderRadius: 7, background: BRAND.orange, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: !input.trim() || loading ? 0.5 : 1, transition: "opacity .15s" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </>
      )}

      <style>{`@keyframes ai-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}