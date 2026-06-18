"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  length?: number;
};

export default function OtpInput({ value, onChange, length = 6 }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  useEffect(() => {
    const idx = Math.min(value.length, length - 1);
    refs.current[idx]?.focus();
  }, [value.length, length]);

  const setDigit = (index: number, nextDigits: string[]) => {
    onChange(nextDigits.join("").slice(0, length));
  };

  return (
    <div className="auth-otp">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={d}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (!raw) return;

            if (raw.length > 1) {
              const pasted = raw.slice(0, length);
              onChange(pasted);
              const focusIdx = Math.min(pasted.length, length - 1);
              refs.current[focusIdx]?.focus();
              return;
            }

            const next = digits.map((x, j) => (j === i ? raw : x));
            setDigit(i, next);
            if (i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              if (d) {
                const next = digits.map((x, j) => (j === i ? "" : x));
                setDigit(i, next);
              } else if (i > 0) {
                const next = digits.map((x, j) => (j === i - 1 ? "" : x));
                setDigit(i - 1, next);
                refs.current[i - 1]?.focus();
              }
            }
            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!pasted) return;
            onChange(pasted);
            const focusIdx = Math.min(pasted.length, length - 1);
            refs.current[focusIdx]?.focus();
          }}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
