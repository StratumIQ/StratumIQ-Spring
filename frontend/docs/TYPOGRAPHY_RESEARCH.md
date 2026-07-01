# StratumIQ Typography Research

## Recommendation

Primary font family: Inter

Inter is the strongest fit for StratumIQ because it balances enterprise seriousness, technical clarity, and dashboard readability better than the currently used DM Sans + Syne combination. It is neutral enough for industrial software, precise enough for dense tables and forms, and mature enough for long-term product maintainability.

This recommendation is for the entire application experience, including:
- dashboard surfaces
- KPI cards
- tables and data grids
- forms and input states
- sidebar and navigation
- mobile and tablet layouts
- support, analytics, and operations workflows

No font changes have been applied yet. This document is the decision record for approval before implementation.

---

## Current State

The current frontend already uses a two-font strategy:
- body: DM Sans
- headings: Syne

That pairing is visually interesting, but it is not ideal for an enterprise industrial SaaS platform because:
- Syne is more display-oriented and can feel editorial or promotional
- DM Sans is softer and slightly more friendly than the product needs
- the combination introduces visual inconsistency across dense UI surfaces
- the current mix is less optimal for tables, forms, sidebars, and operational dashboards

---

## Why Inter Is the Best Fit

### 1. Enterprise suitability
Inter feels credible, structured, and professional without looking cold or corporate. It supports the tone StratumIQ needs: technical, premium, industrial, and trustworthy.

It is a better match than a more decorative or “brand-forward” typeface because StratumIQ is a working platform, not a marketing experience.

### 2. Readability in data-heavy interfaces
Inter performs especially well in:
- dense tables
- form labels and helper text
- KPI cards
- sidebar navigation
- status indicators
- small metadata and secondary text

The letterforms are clear at small sizes, and the overall proportions feel stable in both light and dark themes.

### 3. Technical and industrial character
Inter does not feel playful or consumer-oriented. It has the technical precision needed for operations, analytics, and maintenance workflows. It supports the feeling of “serious tool” rather than “creative product.”

### 4. Strong cross-platform behavior
Inter is highly reliable across:
- desktop web
- tablet and mobile screens
- low-contrast or dense surfaces
- accessibility-focused UI states

It is also a strong choice for long-term maintainability because it is widely supported, mature, and familiar to designers and engineering teams.

### 5. Performance and implementation quality
Inter is available as a Google Font and as a variable font, which makes it easy to load efficiently with next/font/google. A single family reduces complexity and improves consistency across the app.

---

## Why Other Fonts Were Rejected

### Syne
Rejected because it is too display-like and too editorial for a dashboard-first application.

Why it does not fit:
- it feels more promotional than operational
- it can look “brand-y” in navigation and headings
- it is less comfortable for dense interfaces and tabular data
- it is not a strong match for enterprise industrial software tone

### DM Sans
Rejected as a primary family because it is a bit too soft and rounded for this use case.

Why it does not fit as well:
- it feels slightly more friendly than premium enterprise
- it can appear less crisp in dense layouts
- it lacks the same level of seriousness for industrial and operational contexts

### Geist
Evaluated as a strong alternative, but rejected as the primary font for StratumIQ.

Why Geist was not chosen:
- it is excellent for modern developer products and polished web experiences
- it has a very clean, high-tech feel
- however, it feels slightly more “developer-first” and less universally enterprise-trustworthy than Inter for a heavy industrial platform
- it is a strong candidate for a more futuristic or software-native product, but Inter is the safer and more durable choice for this domain

### Manrope
Rejected because it is more friendly and soft than StratumIQ needs.

### Sora / Plus Jakarta Sans / Space Grotesk
Rejected because they skew more toward visual branding, startup aesthetics, or UI experimentation rather than pragmatic enterprise clarity.

### Serif or display fonts
Rejected because they are not appropriate for dashboards, forms, tables, or operational workflows.

---

## Industry Adoption and Market Pattern

The strongest enterprise and productivity products tend to use a restrained, highly legible sans-serif system rather than a branded display face.

Observed patterns across comparable companies:

- Microsoft / Microsoft 365 / Azure: Segoe UI and system-native UI language. The pattern is highly legible, neutral, and enterprise-safe.
- Atlassian / Jira: a modern, structured sans that prioritizes clarity for dense workflows and task surfaces.
- Linear: a minimal, precise sans with strong readability for product and operational interfaces.
- Vercel: Geist, which is modern and developer-oriented, but not as universally enterprise-oriented as Inter.
- GitHub: a clean sans that prioritizes clarity for dense code and product UI.
- Stripe Dashboard: Inter-like geometry, emphasizing calm precision and strong dashboard legibility.
- Datadog: a highly technical and readable sans that supports operational data presentation.
- Grafana: a modern sans that balances technical tone and readability.
- Notion: Inter, which is excellent for dense documentation and knowledge work.
- ServiceNow: a conservative, enterprise-focused UI language centered on clarity and trust.
- AWS Console: a technical, practical sans that favors usability over visual flourish.

The common pattern is clear: the best enterprise products choose a clean, dependable sans rather than a stylish or playful type family.

---

## Performance

Inter is a strong performance choice because:
- it is widely available through Google Fonts
- it can be loaded as a variable font
- it supports efficient self-hosting via next/font/google
- it reduces the need for multiple font families or decorative styles

For StratumIQ, this means:
- lower visual overhead
- simpler implementation
- stronger consistency
- easier maintenance

---

## Accessibility

Inter is a strong accessibility choice because it has:
- clear letterforms at small sizes
- strong legibility in dense UI
- balanced proportions for body copy and labels
- a dependable weight range for hierarchy
- good support for contrast-sensitive UI and component states

This matters a lot for:
- operators working on tablets or mobile devices
- users scanning dashboards quickly
- support workflows with long form content
- industrial environments where readability is critical under real-world conditions

---

## Readability at Small Sizes

This is one of the biggest reasons to choose Inter.

It performs well for:
- table cells
- compact metadata
- form field labels
- breadcrumb and nav text
- status pills and helper text
- mobile sidebar elements

For a platform with large operational datasets, this is essential.

---

## Why It Fits StratumIQ Better Than a Startup Style

StratumIQ is not a marketing website and should not feel like one.

The right typography should feel:
- operational
- confident
- dependable
- data-oriented
- premium but not flashy
- modern without being trendy

Inter supports that tone well. It is strong enough for enterprise-grade software and restrained enough for industrial workflows.

---

## Final Recommendation

Use Inter as the single primary font family across the entire application.

Recommended usage pattern:
- body copy: Inter Regular / Medium
- labels and secondary text: Inter Medium / Semibold
- headings and section titles: Inter Semibold / Bold
- emphasis and data-heavy surfaces: Inter Medium / Bold

This will create a consistent typography system that is easier to maintain and better suited to the product’s real use case.

---

## Implementation Direction After Approval

Once approved, the next step will be to:
1. replace the current DM Sans + Syne pairing with Inter as the only app font
2. define a single typography scale for headings, body, labels, and UI metadata
3. apply consistent font weights across all pages and components
4. review tables, forms, sidebar navigation, and mobile screens for readability

This would produce a more unified, enterprise-grade product experience without introducing visual noise.
