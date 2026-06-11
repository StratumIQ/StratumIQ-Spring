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

export const WHY_CHOOSE_DATA = [
  { title: "Built for Crushing & Screening",   description: "Purpose-built for quarry operations — not generic software adapted for heavy equipment.",                icon: "⚙️" },
  { title: "Fleet-Based Intelligence",         description: "Track and manage all machines with centralized visibility, predictive alerts, and usage analytics.",   icon: "🚛" },
  { title: "Region-Aware Services",            description: "Get matched with nearby technicians and verified service providers for fast on-site support.",         icon: "📍" },
  { title: "Verified Dealers & Providers",     description: "Only trusted sellers and technicians — every listing is reviewed before going live.",                 icon: "✅" },
  { title: "AI-Powered Insights",              description: "Predictive maintenance, intelligent parts planning, and AI-driven machine selection assistance.",      icon: "🤖" },
  { title: "Enterprise-Grade Security",        description: "JWT auth, OTP verification, role-based access, and encrypted data at rest and in transit.",           icon: "🔒" },
] as const;

export const TESTIMONIALS = [
  { name: "Ramesh Kumar",  company: "RK Quarry Pvt Ltd",      quote: "StratumIQ completely transformed how we manage our fleet. Parts procurement used to take days — now it's a few clicks.",    rating: 5 },
  { name: "Suresh Iyer",   company: "Iyer Crushing Solutions", quote: "Finding qualified technicians used to take days of phone calls. Now it's instant — the platform just works.",               rating: 5 },
  { name: "Anil Traders",  company: "Spare Parts Dealer",      quote: "We've reached customers across 3 states without relying on middlemen. Our inquiry volume went up 4x.",                      rating: 4 },
] as const;

export const EQUIPMENT_STATUS_CONFIG = {
  active:      { label: "Active",      color: "#16A34A", bg: "rgba(22,163,74,0.08)"   },
  idle:        { label: "Idle",        color: "#D97706", bg: "rgba(217,119,6,0.08)"   },
  maintenance: { label: "Maintenance", color: "#E8692C", bg: "rgba(232,105,44,0.08)"  },
  retired:     { label: "Retired",     color: "#6B7280", bg: "rgba(107,114,128,0.08)" },
} as const;

export const ALERT_CONFIG = {
  critical: { color: "#DC2626", bg: "rgba(220,38,38,0.08)"  },
  warning:  { color: "#D97706", bg: "rgba(217,119,6,0.08)"  },
  info:     { color: "#2563EB", bg: "rgba(37,99,235,0.08)"  },
  success:  { color: "#16A34A", bg: "rgba(22,163,74,0.08)"  },
} as const;

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";