# StratumIQ Frontend Design Audit

## Audit scope

This audit reviews the current frontend implementation across the dashboard experience, admin experience, support workflows, shared UI primitives, and shell layout in:
- [frontend/src/app/dashboard](frontend/src/app/dashboard)
- [frontend/src/app/dashboard-admin](frontend/src/app/dashboard-admin)
- [frontend/src/components/dashboard](frontend/src/components/dashboard)
- [frontend/src/components/layout](frontend/src/components/layout)
- [frontend/src/components/ui](frontend/src/components/ui)

The current UI already contains strong building blocks, but the product still feels like a collection of polished fragments rather than one intentionally designed operating system.

---

## 1. Typography system

- Current: The app currently uses a mixed font strategy in [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx) and [frontend/src/app/globals.css](frontend/src/app/globals.css), with body text using one family and headings using another.
- Problem: The visual tone shifts between friendly and display-like, which weakens premium enterprise credibility.
- Why it feels “AI generated”: The type system looks assembled from generic UI defaults instead of a deliberate product voice.
- Enterprise recommendation: Adopt one premium sans-serif family across the app, with a single scale and a strict weight hierarchy. Geist is the strongest fit for a modern premium dashboard experience; Inter is the safer fallback for maximum enterprise familiarity.
- Priority: High

---

## 2. Spacing system

- Current: Spacing is inconsistent across the app, especially in inline styles inside [frontend/src/app/dashboard/support/page.tsx](frontend/src/app/dashboard/support/page.tsx) and dashboard modules.
- Problem: Cards, forms, headers, and panels use inconsistent gaps and padding, making the UI feel uneven and less deliberate.
- Why it feels “AI generated”: The layout appears generated from repeated utility-like spacing choices rather than a governed system.
- Enterprise recommendation: Standardize around a 4/8/12/16/20/24/32/40/48/64 spacing scale and apply it everywhere.
- Priority: High

---

## 3. Border radius system

- Current: Radius values vary across cards, buttons, inputs, dialogs, badges, and shell surfaces in [frontend/src/app/dashboard/dashboard.css](frontend/src/app/dashboard/dashboard.css) and [frontend/src/app/dashboard-admin/admin.css](frontend/src/app/dashboard-admin/admin.css).
- Problem: The interface lacks a single visual rhythm; some surfaces feel too rounded, others too sharp.
- Why it feels “AI generated”: The product uses inconsistent corners that make each component feel like it came from a different design source.
- Enterprise recommendation: Use one radius scale for all core UI surfaces: small, medium, large, and pill only where appropriate.
- Priority: High

---

## 4. Shadow system

- Current: The app uses several shadow layers and glass-like treatments, especially in [frontend/src/components/dashboard/ui/GlassCard.tsx](frontend/src/components/dashboard/ui/GlassCard.tsx) and [frontend/src/app/dashboard/dashboard.css](frontend/src/app/dashboard/dashboard.css).
- Problem: Elevation is overused and inconsistent, which creates noise and visual fatigue.
- Why it feels “AI generated”: The product relies on decorative depth instead of clear hierarchy.
- Enterprise recommendation: Reduce the system to three elevations: small, medium, and large, and use them semantically.
- Priority: High

---

## 5. Color system

- Current: Colors are applied in many places with ad hoc values, especially in the dashboard and admin CSS files.
- Problem: The product has multiple competing color treatments instead of a semantic palette.
- Why it feels “AI generated”: The interface uses color as decoration rather than as a clear language for meaning and hierarchy.
- Enterprise recommendation: Define a semantic color system for primary, neutral, hover, pressed, selected, disabled, success, warning, danger, and info states.
- Priority: High

---

## 6. Button hierarchy

- Current: Buttons exist in [frontend/src/components/dashboard/ui/Button.tsx](frontend/src/components/dashboard/ui/Button.tsx), but usage varies widely across pages and modal patterns.
- Problem: The hierarchy is not consistently applied; some buttons feel too loud, others too weak, and some states are visually ambiguous.
- Why it feels “AI generated”: The product feels like it has multiple button styles stitched together rather than a coherent action model.
- Enterprise recommendation: Standardize a strict hierarchy: primary, secondary, ghost, outline, danger, success, icon, and loading states.
- Priority: High

---

## 7. Status and badge system

- Current: Badge usage exists in [frontend/src/components/dashboard/ui/Badge.tsx](frontend/src/components/dashboard/ui/Badge.tsx), but support, alerts, and maintenance surfaces still use mixed status styling patterns.
- Problem: Status colors are not applied consistently across labels, tickets, alerts, and asset states.
- Why it feels “AI generated”: Status semantics appear visually improvised rather than structured by product meaning.
- Enterprise recommendation: Create one semantic status system for open, assigned, in progress, waiting, resolved, closed, active, inactive, draft, published, success, failed, archived, and similar states.
- Priority: High

---

## 8. KPI cards

- Current: KPI cards are implemented in [frontend/src/components/dashboard/common/KpiCard.tsx](frontend/src/components/dashboard/common/KpiCard.tsx) and used in [frontend/src/components/dashboard/modules/home/DashboardHome.tsx](frontend/src/components/dashboard/modules/home/DashboardHome.tsx) and [frontend/src/app/dashboard-admin/page.tsx](frontend/src/app/dashboard-admin/page.tsx).
- Problem: They still contain too much decorative information and inconsistent layout rules.
- Why it feels “AI generated”: They look like dashboard components generated to fill space rather than carefully designed operational summaries.
- Enterprise recommendation: Simplify each KPI to icon, title, value, and optional trend or subtitle only.
- Priority: High

---

## 9. Cards and surface language

- Current: The app uses both [frontend/src/components/dashboard/ui/GlassCard.tsx](frontend/src/components/dashboard/ui/GlassCard.tsx) and several ad hoc card styles in the dashboard CSS.
- Problem: There are multiple card languages, including glassy panels, neutral cards, and heavily styled promotional panels.
- Why it feels “AI generated”: The visual system is trying to be everything at once and ends up feeling generic.
- Enterprise recommendation: Use one card system with one surface treatment, one border, one radius, and one hover state.
- Priority: High

---

## 10. Empty states

- Current: Empty states are rendered in [frontend/src/components/dashboard/ui/EmptyState.tsx](frontend/src/components/dashboard/ui/EmptyState.tsx), but many module surfaces still rely on minimal or placeholder content.
- Problem: Empty states are often visually under-designed and lack a clear hierarchy.
- Why it feels “AI generated”: They look like placeholders rather than thoughtfully designed states.
- Enterprise recommendation: Standardize empty states with one icon, one short title, one helpful description, and one primary or secondary action.
- Priority: Medium

---

## 11. Forms and validation

- Current: Forms are implemented in various places, including [frontend/src/components/dashboard/support/SupportComposerModal.tsx](frontend/src/components/dashboard/support/SupportComposerModal.tsx) and several equipment and fleet forms.
- Problem: Form patterns are not consistent, validation copy is generic, and field affordances vary too much.
- Why it feels “AI generated”: Form states feel mechanically generated rather than designed around task clarity and user recovery.
- Enterprise recommendation: Build a shared form system with clear labels, helper text, inline validation, focus states, loading states, and human-friendly error copy.
- Priority: High

---

## 12. Tables and data surfaces

- Current: The table styling exists in [frontend/src/app/dashboard/dashboard.css](frontend/src/app/dashboard/dashboard.css), but not all lists and records use it consistently.
- Problem: The app mixes table layouts, card-based lists, and custom row patterns without a consistent information architecture.
- Why it feels “AI generated”: The data surface is treated as a container for content rather than an intentional workspace.
- Enterprise recommendation: Use one enterprise table pattern with clear spacing, hover states, sorting, sticky headers, pagination, status badges, and action affordances.
- Priority: High

---

## 13. Loading states

- Current: Loading states are present through the shared skeleton component in [frontend/src/components/dashboard/ui/Skeleton.tsx](frontend/src/components/dashboard/ui/Skeleton.tsx) and the dashboard shell loaders.
- Problem: Loading treatment is not applied consistently across cards, tables, forms, and buttons.
- Why it feels “AI generated”: Some surfaces use skeletons while others still show generic spinners or blank states.
- Enterprise recommendation: Standardize skeleton loading for cards, lists, tables, and pages, and use button loading states for actions.
- Priority: Medium

---

## 14. Toast notifications

- Current: Toast messages are used via Sonner in the dashboard and support flows.
- Problem: The feedback language is inconsistent and the visual pattern is not yet tuned to a premium operations experience.
- Why it feels “AI generated”: Notifications appear as generic app messages rather than helpful system responses.
- Enterprise recommendation: Create a small semantic toast system for success, error, warning, and info states with concise, human-friendly copy.
- Priority: Medium

---

## 15. Animation system

- Current: Motion is used in [frontend/src/components/dashboard/layout/Sidebar.tsx](frontend/src/components/dashboard/layout/Sidebar.tsx), [frontend/src/components/dashboard/ui/GlassCard.tsx](frontend/src/components/dashboard/ui/GlassCard.tsx), and [frontend/src/components/dashboard/layout/PageShell.tsx](frontend/src/components/dashboard/layout/PageShell.tsx).
- Problem: Motion is present, but the timing and expression are not yet standardized.
- Why it feels “AI generated”: The UI uses animation as a generic polish layer instead of a restrained interaction language.
- Enterprise recommendation: Limit motion to subtle fade, slide, scale, and hover transitions with a consistent 150–250ms rhythm.
- Priority: Medium

---

## 16. Support module experience

- Current: The support experience in [frontend/src/app/dashboard/support/page.tsx](frontend/src/app/dashboard/support/page.tsx) and [frontend/src/components/dashboard/support/SupportComposerModal.tsx](frontend/src/components/dashboard/support/SupportComposerModal.tsx) is functional but still reads as a generic dashboard workflow.
- Problem: The module lacks the structured, professional treatment expected from a support and operations surface.
- Why it feels “AI generated”: The experience is built from generic cards and forms rather than a clearly designed service workflow.
- Enterprise recommendation: Rework support into a more structured issue workflow with better heirarchy, timeline treatment, priority handling, and professional response states.
- Priority: High

---

## 17. Admin and user module consistency

- Current: The admin experience in [frontend/src/app/dashboard-admin](frontend/src/app/dashboard-admin) uses its own styling language, while the user dashboard uses the dashboard shell and shared components in [frontend/src/components/dashboard](frontend/src/components/dashboard).
- Problem: The two experiences feel like separate products instead of one platform.
- Why it feels “AI generated”: The app has multiple visual dialects rather than a shared operating system.
- Enterprise recommendation: Align the admin and user experiences around one design system, one spacing system, one component language, and one visual tone.
- Priority: High

---

## 18. Accessibility and responsiveness

- Current: The app has some focus styling and responsive behavior, but the experience still depends heavily on visual polish and a few custom interactions.
- Problem: Keyboard navigation, focus clarity, screen-reader affordances, and mobile consistency still need to be treated as first-class product requirements.
- Why it feels “AI generated”: The interface is visually rich but not fully dependable in real-world operational use.
- Enterprise recommendation: Ensure strong focus rings, labels, semantic structure, contrast, keyboard reachability, and mobile layout stability across all modules.
- Priority: High

---

## Overall assessment

The frontend is already structured enough to be elevated into a premium enterprise product. The main issue is not missing features; it is consistency.

The next phase should focus on unifying:
1. typography
2. spacing
3. radius
4. elevation
5. buttons
6. status semantics
7. cards and KPI treatment
8. forms and tables
9. empty, loading, and feedback states

That work should be implemented module by module, starting with the shared design system and then applying it to the dashboard, support, admin, and forms surfaces.
