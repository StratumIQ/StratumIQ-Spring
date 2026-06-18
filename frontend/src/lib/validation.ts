export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export type PasswordCheck = {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
};

export function checkPassword(pw: string): PasswordCheck {
  return {
    minLength: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
  };
}

export function passwordStrength(pw: string): { score: number; label: string; color: string } {
  const checks = checkPassword(pw);
  const score = Object.values(checks).filter(Boolean).length;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#DC2626", "#F59E0B", "#D97706", "#2563EB", "#16A34A"];
  const idx = Math.max(0, Math.min(score - 1, 4));
  return { score, label: labels[idx], color: colors[idx] };
}

/** India: 10 digits, optional +91 prefix and spaces */
export function validateIndianPhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "Phone number is required";

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const local = digits.slice(2);
    if (local.length !== 10) return "Indian numbers must be 10 digits after +91";
    if (!/^[6-9]/.test(local)) return "Enter a valid Indian mobile number";
    return null;
  }

  if (digits.length !== 10) return "Enter exactly 10 digits (India)";
  if (!/^[6-9]/.test(digits)) return "Enter a valid Indian mobile number";
  return null;
}

export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return digits;
}
