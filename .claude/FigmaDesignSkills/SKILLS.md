## 1. Purpose

This document defines the common Figma design system and implementation standards for StratumIQ.

The goal is to create a consistent, scalable, accessible, responsive, and enterprise-grade user experience for:

- Customers
- Quarry and plant operators
- Fleet managers
- Equipment owners
- Vendors
- Service providers
- Administrators
- Future SaaS modules

StratumIQ should visually communicate:

**Industrial + Intelligent + Operational + Trustworthy + Modern**

The target experience is:

> Industrial operations software with AI intelligence layered naturally into the workflow.

Every important screen should help users answer:

1. What is happening?
2. What needs attention?
3. Why did it happen?
4. What should I do next?

---

## 2. Product Design Direction

The interface should feel:

- Premium
- Industrial
- Modern
- Enterprise-grade
- AI-powered
- Trustworthy
- Operational
- Fast
- Clear

Avoid:

- Generic admin templates
- Bootstrap-style layouts
- Consumer-app appearance
- Excessive gradients
- Toy-like animations
- Cryptocurrency dashboard styling
- Excessive glassmorphism
- Decorative charts without operational meaning
- Too many equally prominent cards

The design language should combine:

- Heavy equipment and industrial operations
- Modern enterprise SaaS
- Clear operational intelligence
- Contextual AI assistance
- Role-based workflows

---

## 3. Figma File Architecture

Create one master Figma project with the following pages:

| Page | Purpose |
|---|---|
| `00 — Cover` | Product identity and design principles |
| `01 — Foundations` | Colors, typography, grid, spacing, radius, elevation |
| `02 — Icons & Assets` | Lucide icons and industrial visual assets |
| `03 — Components` | Buttons, inputs, cards, badges, tables, modals |
| `04 — Navigation` | Header, sidebar, breadcrumbs, tabs |
| `05 — Data Visualization` | KPIs, charts, gauges, trends |
| `06 — Equipment Components` | Equipment cards and health widgets |
| `07 — Plant Operations` | Plant flow and process monitoring |
| `08 — Fleet Intelligence` | Fleet dashboards and asset tracking |
| `09 — Maintenance` | Work orders and predictive maintenance |
| `10 — Parts & Aftermarket` | Parts discovery and ordering |
| `11 — Vendor Portal` | Vendor workflows |
| `12 — Service Portal` | Service workflows |
| `13 — AI Copilot` | AI interaction patterns |
| `14 — Authentication` | Login, registration, invitation, password reset |
| `15 — Responsive` | Desktop, tablet, and mobile patterns |
| `16 — Templates` | Reusable page templates |
| `17 — Prototype Flows` | Connected end-to-end workflows |

### Core Rule

Screens must be built from the shared component library. Do not independently style each screen.

---

## 4. Theme Strategy

Use light as the default theme everywhere, with dark reserved for a narrow, specific case. This is a deliberate revision from an earlier draft of this doc that called for a uniformly dark operational app — that direction was tried and reverted. Data-dense configuration, comparison, and catalog work (the majority of the operational app) reads and scans better on light surfaces, matching how procurement/engineering buyers already work in adjacent tools (SAP, Oracle, spec-comparison tools). Reserve dark for screens whose entire purpose is glanceable, ambient, real-time status — not for general app chrome.

### 4.1 Marketing and Authentication

Use:

- Light neutral backgrounds
- Strong industrial imagery or technical equipment visualization
- Dark typography
- Orange primary actions
- Subtle blue AI accents
- Clean white surfaces
- Strong trust messaging

### 4.2 Operational Application — Light by default

Use light, clean, data-dense surfaces for the vast majority of the operational app: equipment configurator, comparison tools, parts/aftermarket catalog, fleet management, maintenance, settings, support, and most admin data screens. Favor:

- White/near-white card surfaces on a soft neutral page background
- Clear filter sidebars and structured, scannable layouts
- Dark typography for maximum legibility of specs and data
- Orange for primary actions, consistent with brand
- Generous use of comparison cards, tables, and structured data grids

This should feel like a premium enterprise SaaS configuration/procurement tool — closer to a well-designed admin/config panel than a "cockpit."

### 4.3 Live-Monitoring Dark Variant — reserved, scoped, opt-in

Reserve the dark industrial theme *only* for views whose entire purpose is real-time, glanceable, ambient status monitoring — e.g. a live Alerts feed, live plant/equipment telemetry, or a control-room-style monitoring view. Do **not** apply it to configuration, comparison, or data-entry screens, and do not apply it to persistent chrome (sidebar/topbar), which stays light everywhere so the app doesn't flicker between themes as a user navigates.

Implementation pattern (already in `dashboard.css`): a `.dash-live` modifier class layers dark tokens on top of `.dash-root`, scoped to a single page's content wrapper (e.g. `<PageShell className="dash-live">`). This renders that page's content as a self-contained dark panel while the surrounding light dashboard chrome (sidebar, topbar) is untouched — so dark mode never has to apply globally or flip mid-navigation.

Dark variant should feel like a modern operational control environment without becoming visually exhausting — used sparingly, only where real-time monitoring is the screen's actual job.

---

## 5. Color System

Never use raw colors directly in components. Use semantic Figma variables and matching Tailwind design tokens.

### 5.1 Foundation Palette

Note: the dark neutrals below (`950`–`700`) are for the **live-monitoring dark variant only** (§4.3), not the default app theme. Everywhere else, use white/near-white surfaces with dark text on top of these same tokens inverted (e.g. `neutral/850` as text-on-light, `neutral/0` as a light surface).

| Token | Value | Purpose |
|---|---|---|
| `neutral/950` | `#050505` | Main dark background |
| `neutral/900` | `#0D1117` | Application background |
| `neutral/850` | `#111827` | Main surfaces |
| `neutral/800` | `#1F2937` | Elevated surfaces |
| `neutral/700` | `#374151` | Borders and secondary surfaces |
| `neutral/500` | `#6B7280` | Disabled text |
| `neutral/400` | `#9CA3AF` | Secondary text |
| `neutral/200` | `#E5E7EB` | Primary dark-mode text |
| `neutral/0` | `#FFFFFF` | High-emphasis text |

### 5.2 Brand Colors

| Token | Value | Purpose |
|---|---|---|
| `brand/orange` | `#E8692C` | Primary action (matches landing page, dashboard `--or`, admin `--ap`) |
| `brand/orange-hover` | `#D45A1F` | Primary hover |
| `brand/orange-active` | `#B84A15` | Primary active/pressed |
| `brand/orange-soft` | `rgba(232,105,44,.10)` | Light accent surface / tint background |
| `intelligence/blue` | `#0A84FF` | AI and intelligence (used for "info" badges/status, per §5.3) |

Note: an earlier draft of this doc specified `#FF6A00` as the brand orange. That was never implemented — every surface in the app (marketing, dashboard, admin) uses `#E8692C`. Treat `#E8692C` as the single source of truth; do not introduce `#FF6A00` anywhere.

### 5.3 Operational Status Tokens

Create semantic tokens:

- `status/success`
- `status/warning`
- `status/critical`
- `status/information`
- `status/offline`
- `status/maintenance`

Rules:

- Orange represents brand actions and primary interactions.
- Red is reserved for genuinely critical conditions.
- Green represents healthy, successful, or completed states.
- Blue represents intelligence, information, predictions, and AI.
- Amber represents warnings and attention.
- Grey represents inactive, disconnected, disabled, or unavailable states.

---

## 6. Typography System

### Font Family

Two typefaces, both injected via `next/font/google` in `app/layout.tsx` and exposed as CSS variables consumed everywhere else:

- `--font-body` → **Inter** — all body text, labels, inputs, buttons.
- `--font-heading` → **Space Grotesk** — all `h1`–`h6` only. (An earlier draft used Syne; it was swapped for Space Grotesk for better legibility at display sizes while keeping a modern/technical character appropriate for an industrial platform. Do not reintroduce Syne.)

Never hardcode a font-family in a component — always reference `var(--font-body)` / `var(--font-heading)` (with the existing fallback chains already set on `body`/`h1`–`h6` in `globals.css`).

### Scale (dashboard app, defined in `dashboard.css` `.dash-root` tokens)

| Token / class | Size | Weight | Usage |
|---|---|---|---|
| `.d-page-title` | `19px` | `700` | Page-level heading in `PageShell` (e.g. "Fleet", "Support Center"). Deliberately restrained — a previous version used `clamp(22-28px)` at weight `800` and was reported as "too big"; do not go back above 19px/700 for page titles. |
| `.d-page-desc` / `.d-page-subtitle` | `13px` | `400` | Page subtitle under the title. |
| `.d-section-title` | `14.5px` | `700` | In-page section headers (e.g. "Filters", "Recommended for You"). |
| `.d-label` | `12.5px` | `600` | Form field labels. |
| `.d-modal-title` | `17px` | `700` | Modal dialog headings. |
| `.d-kpi-value` | `18px` | `700` | Stat tile numbers (see §9.2 — kept deliberately small; a stacked 28px/800 version was tried and reverted for being disproportionate). |
| `.d-kpi-label` | `11.5px` | `600` | Stat tile label, muted (`var(--t3)`). |

General rule: when in doubt, go smaller and lighter-weight than feels natural — this codebase's recurring UI feedback has consistently been "text is too big," never "too small."

---

## 7. Spacing & Layout

Defined as CSS custom properties on `.dash-root` (`dashboard.css`): `--space-1` (4px) through `--space-8` (32px), 4px base grid. Prefer these tokens in new component CSS; existing inline-styled components mix in raw pixel values (8/12/16/24px are the most common and all sit on the 4px grid) — match that grid even when not referencing the token directly.

Radius tokens: `--r2` (4px) through `--r10` (24px), plus `--rf` (pill/9999px) for badges and fully-rounded chips. Cards typically use `--r7`/`--r8` (14–16px).

---

## 8. Navigation & Chrome

### 8.1 Breadcrumbs

Breadcrumbs (`<PageShell breadcrumbs={...}>`) are **not used** anywhere except where a page's own header doesn't already communicate location clearly. In practice this means: no module list/detail/form page passes `breadcrumbs` — the page's own title (or, for placeholder pages, the `ComingSoon` header) is sufficient. Don't add breadcrumbs to new module pages; it was tried across all modules and removed for being redundant with the page title directly below it.

### 8.2 Sidebar (`Sidebar.tsx`)

- Desktop sidebar has two states: **collapsed** (icon-only, 72px) and **expanded** (256px, icons + labels). State persists in `localStorage` (`dash-sidebar-collapsed`).
- The StratumIQ "S" logo mark + wordmark is shown **only when expanded**. In the collapsed state, the logo strip shows *only* a hamburger (`Menu` icon) button, centered — do not render the logo icon alongside the hamburger in the collapsed state; there isn't enough width (72px) for both without cramping, which was explicitly reported as a bug.
- Clicking the hamburger toggles collapsed ⇄ expanded.
- Clicking any nav item **auto-collapses** the sidebar back to icon-only after navigating (`onNavigate` prop from `dashboard/layout.tsx`, distinct from the toggle handler — it force-collapses, it does not toggle). This is intentional: users open the sidebar to pick a destination, not to keep it pinned open.
- Quick access to `/dashboard` no longer lives on the sidebar logo when collapsed — see §8.3.

### 8.3 Top Bar (`TopBar.tsx`)

Icon-only actions are grouped together on the right side, in this order: **Home** (`/dashboard`) → **Notifications** (bell, with unread badge) → **Support** (`/dashboard/support`) → **User profile** (avatar + name/role + dropdown). All icon-only buttons use the shared `.topbar-icon-btn` class (36×36px) and carry a native `title` attribute so hovering shows a tooltip with the action's name ("Dashboard", "Notifications", "Support", "Account"). When adding a new global quick-action to the top bar, follow this same pattern — icon button, `.topbar-icon-btn`, `title` tooltip, grouped with the others — rather than placing it elsewhere (e.g. before the search box, which was tried and moved).

There is no floating/persistent support bubble anywhere in the app — that pattern (a `SupportLauncher` floating action button, bottom-right, on every page) was removed in favor of the top-bar Support icon above.

---

## 9. Module & Page Patterns

### 9.1 Unbuilt modules: `ComingSoon`

Any module whose backend doesn't exist yet (no controller/service/DB table — verify before assuming, several modules looked "almost done" on the frontend with nothing behind them) must render `components/dashboard/common/ComingSoon.tsx` inside a plain `<PageShell>` (no `title`, no `breadcrumbs` — `ComingSoon` renders its own header/icon/badge/description/feature-chip list). Do not let a page attempt a real API call that will 500 into a raw "Internal server error" — that is a worse experience than an honest "Coming soon" card, and it happened for real (Equipment Registry called a nonexistent `/api/equipment`). Before wiring a new module's UI to a real endpoint, confirm the endpoint actually exists server-side.

Current `ComingSoon` modules: Fleet-adjacent placeholders retired as real features shipped; as of this doc, **Equipment, Maintenance, Alerts, Parts, Configurator, Solutions, Settings** all use this pattern.

### 9.2 KPI / stat-count tiles

Module-level KPI grids (`.d-kpi-grid` + `KpiCard`) are **dashboard-home-only**. Do not add a KPI/count row to individual module pages (Fleet, Alerts, Maintenance, Parts, News, etc.) — this was done repeatedly during early builds and removed every time, because showing four "0" tiles on a page with no data yet (or redundant counts on a page that already lists the same data below) added height and noise without value.

`KpiCard` itself is a **compact horizontal tile**: small icon (32px box) on the left, label+value stacked tightly on the right, optional trend badge pushed right. Not a tall stacked card with a big icon and a large number — that version (42px icon, 28px/800 value, ~120px+ tall) was tried and reverted as disproportionately large.

---

## 10. Support Center Pattern

The customer-facing Support Center (`dashboard/support/page.tsx`) is a simple **contact hub**, not a ticket-management console. It intentionally does not include: KPI/count tiles, a search bar, or a status filter dropdown for tickets. Instead:

- Four equal quick-contact tiles (`.d-support-contact-tile`): **Call Us** (tel: link), **Email Us** (mailto: link), **Raise an Issue** (opens `SupportComposerModal`), **Live Chat** (opens the `AIAssistant` component in `floating` mode).
- Below that, a lightweight **"Your recent requests"** list — one compact single-line row per ticket (icon · ticket ID · subject, truncated · date · status badge), not a multi-line card with description text and a separate priority badge row. Clicking a row navigates to the full ticket detail page.
- The ticket composer (`SupportComposerModal`) auto-saves a draft to `localStorage` while typing (restored on reopen, with a "Discard draft" affordance) so users never lose in-progress input.
- Issue type and Priority fields default to an unselected placeholder (not a default value) and are both required — this was a deliberate fix for a bug where an unselected/default enum value caused a 500 on submit.

---