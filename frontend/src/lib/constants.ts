/**
 * StratumIQ — Design Tokens & App Constants
 * Single source of truth. Import from here; never hardcode values.
 */

export const BRAND = {
  orange:      "#E8692C",
  orangeHover: "#D45A1F",
  orangeLight: "rgba(232,105,44,0.10)",
  orangeGlow:  "rgba(232,105,44,0.28)",
  navy:        "#111827",
  navyHover:   "#1F2937",
} as const;

export const DASH = {
  bg:       "var(--d-bg)",
  surface:  "var(--d-surface)",
  surface2: "var(--d-surface2)",
  text:     "var(--d-text)",
  text2:    "var(--d-text2)",
  text3:    "var(--d-text3)",
  border:   "var(--d-border)",
  border2:  "var(--d-border2)",
  shadowSm: "var(--d-shadow-sm)",
  shadowMd: "var(--d-shadow-md)",
  shadowLg: "var(--d-shadow-lg)",
  red:      "#DC2626",
  amber:    "#D97706",
  green:    "#16A34A",
  blue:     "#2563EB",
} as const;

export const NAV_ITEMS = [
  { label: "Platform",    href: "#platform"    },
  { label: "Equipment",   href: "#equipment"   },
  { label: "Aftermarket", href: "#aftermarket" },
  { label: "Services",    href: "#services"    },
  { label: "Blog",        href: "#blog"        },
] as const;

export const EQUIPMENT_CATEGORIES = [
  { title: "Crushers",      image: "/crusher.jpg"  },
  { title: "Screens",       image: "/services.jpg" },
  { title: "Conveyors",     image: "/parts.jpg"    },
  { title: "Wash Plants",   image: "/fleet.jpg"    },
  { title: "Mobile Plants", image: "/crush.jpg"    },
  { title: "Attachments",   image: "/config.jpg"   },
  { title: "Wear Parts",    image: "/parts.jpg"    },
  { title: "Consumables",   image: "/services.jpg" },
] as const;

export const AFTERMARKET_DATA = {
  parts: [
    "Genuine OEM parts",
    "Compatible aftermarket parts",
    "Wear parts & liners",
    "Consumables",
    "Inventory management",
  ],
  services: [
    "AMC (Annual Maintenance Contracts)",
    "Emergency breakdown support",
    "Preventive maintenance schedules",
    "Operator training programs",
    "Online troubleshooting & diagnostics",
  ],
} as const;

export const BLOG_POSTS = [
  { title: "How to Choose the Right Crusher for Your Quarry",    excerpt: "A complete guide to selecting crushing equipment based on material type, capacity, and site conditions.", image: "/crusher.jpg",  readTime: "5 min" },
  { title: "Top 5 Maintenance Tips to Reduce Equipment Downtime", excerpt: "Prevent costly breakdowns and increase operational efficiency with these essential maintenance practices.",  image: "/services.jpg", readTime: "4 min" },
  { title: "Understanding Wear Parts and When to Replace Them",   excerpt: "Learn how wear parts impact crushing performance and identify the right replacement intervals.",            image: "/parts.jpg",    readTime: "6 min" },
] as const;

/**
 * WHY_CHOOSE_DATA — icon is a lucide icon name string.
 * WhyChoose.tsx renders these via the ICON_MAP below.
 * No emojis — all icons are lucide SVGs.
 */
export const WHY_CHOOSE_DATA = [
  {
    title:       "Built for Crushing & Screening",
    description: "Purpose-built for quarry operations — not generic software adapted for heavy equipment.",
    icon:        "Settings2",
  },
  {
    title:       "Fleet-Based Intelligence",
    description: "Track and manage all machines with centralized visibility, predictive alerts, and usage analytics.",
    icon:        "Truck",
  },
  {
    title:       "Region-Aware Services",
    description: "Get matched with nearby technicians and verified service providers for fast on-site support.",
    icon:        "MapPin",
  },
  {
    title:       "Verified Dealers & Providers",
    description: "Only trusted sellers and technicians — every listing is reviewed before going live.",
    icon:        "BadgeCheck",
  },
  {
    title:       "AI-Powered Insights",
    description: "Predictive maintenance, intelligent parts planning, and AI-driven machine selection assistance.",
    icon:        "BrainCircuit",
  },
  {
    title:       "Data Protection Guarantee",
    description: "We guarantee the security of your data. Your information stays encrypted, access-controlled, and private — always.",
    icon:        "ShieldCheck",
  },
] as const;

export const TESTIMONIALS = [
  { name: "Ramesh Kumar",  company: "RK Quarry Pvt Ltd",      quote: "StratumIQ completely transformed how we manage our fleet. Parts procurement used to take days — now it's a few clicks.",    rating: 5 },
  { name: "Suresh Iyer",   company: "Iyer Crushing Solutions", quote: "Finding qualified technicians used to take days of phone calls. Now it's instant — the platform just works.",               rating: 5 },
  { name: "Anil Traders",  company: "Spare Parts Dealer",      quote: "We've reached customers across 3 states without relying on middlemen. Our inquiry volume went up 4x.",                      rating: 4 },
] as const;

export const EQUIPMENT_STATUS_CONFIG = {
  ACTIVE:      { label: "Active",      color: "#16A34A", bg: "rgba(22,163,74,0.08)"   },
  IDLE:        { label: "Idle",        color: "#D97706", bg: "rgba(217,119,6,0.08)"   },
  MAINTENANCE: { label: "Maintenance", color: "#E8692C", bg: "rgba(232,105,44,0.08)"  },
  RETIRED:     { label: "Retired",     color: "#6B7280", bg: "rgba(107,114,128,0.08)" },
} as const;

export const ALERT_CONFIG = {
  critical: { color: "#DC2626", bg: "rgba(220,38,38,0.08)"  },
  warning:  { color: "#D97706", bg: "rgba(217,119,6,0.08)"  },
  info:     { color: "#2563EB", bg: "rgba(37,99,235,0.08)"  },
  success:  { color: "#16A34A", bg: "rgba(22,163,74,0.08)"  },
} as const;

export const MARKETING = {
  DASHBOARD_LIMIT: 5,
  TYPES: ["NEWS", "ANNOUNCEMENT", "PRODUCT_LAUNCH", "PROMOTIONAL_BANNER", "MAINTENANCE_ALERT"] as const,
  STATUSES: ["DRAFT", "PUBLISHED", "ARCHIVED", "INACTIVE"] as const,
  STATUS_CONFIG: {
    DRAFT:     { label: "Draft",     color: "#64748b", bg: "rgba(100,116,139,0.12)" },
    PUBLISHED: { label: "Published", color: "#16a34a", bg: "rgba(22,163,74,0.12)"  },
    ARCHIVED:  { label: "Archived",  color: "#d97706", bg: "rgba(217,119,6,0.12)"  },
    INACTIVE:  { label: "Inactive",  color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  },
  AUTO_PLAY_MS: 5000,
  PAUSE_RESUME_DELAY_MS: 8000,
  BANNER_ASPECT: 16 / 9,
  THUMB_ASPECT:  4 / 3,
} as const;

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

/**
 * Session Management & Timeout Configuration
 * Must match backend values in application.yml
 * All values in milliseconds
 */
export const SESSION = {
  // Access token expiry (30 minutes)
  ACCESS_TOKEN_EXPIRY_MS: 1800000,
  
  // Refresh token expiry (7 days)
  REFRESH_TOKEN_EXPIRY_MS: 604800000,
  
  // Idle timeout before showing warning (25 minutes)
  IDLE_TIMEOUT_MS: 1500000,
  
  // Warning duration before auto-logout (5 minutes)
  WARNING_TIME_MS: 300000,
  
  // Total session timeout (idle + warning = 30 minutes)
  TOTAL_SESSION_TIMEOUT_MS: 1800000,
  
  // Remember Me duration (30 days)
  REMEMBER_ME_DURATION_MS: 2592000000,
  
  // Refresh token early (5 minutes before expiry)
  REFRESH_BEFORE_EXPIRY_MS: 300000,
  
  // Activity debounce (only track activity every 10 seconds)
  ACTIVITY_DEBOUNCE_MS: 10000,
  
  // Check for token expiry every 30 seconds
  TOKEN_CHECK_INTERVAL_MS: 30000,
} as const;

/** Resolve relative upload paths from the backend */
export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return url;
}

/** Global design tokens — typography, spacing, radius, shadows */
export const TOKENS = {
  typography: {
    xs:   "11px",
    sm:   "12px",
    base: "14px",
    md:   "15px",
    lg:   "17px",
    xl:   "20px",
    "2xl": "24px",
    "3xl": "30px",
  },
  spacing: {
    1: "4px",  2: "8px",  3: "12px", 4: "16px",
    5: "20px", 6: "24px", 7: "28px", 8: "32px",
  },
  radius: {
    sm: "6px", md: "10px", lg: "14px", xl: "16px", full: "9999px",
  },
  shadow: {
    xs: "var(--sx)", sm: "var(--ss)", md: "var(--sm)", lg: "var(--sl)",
  },
} as const;