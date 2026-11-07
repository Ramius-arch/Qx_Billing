# Frontend Contrast Invariants & Dual-Mode Jargon Firewall

## 1. Strict Theme Coupling & Contrast Invariants
- **Tailwind v4 Theme Isolation**: When using Tailwind CSS v4 with an attribute-based theme system (`data-theme="light" | "dark"`), NEVER rely on default `@media (prefers-color-scheme: dark)`. Always declare:
  ```css
  @custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
  ```
  at the top of the root stylesheet (`style.css`). This guarantees that `dark:` utility classes are strictly scoped to the active application theme attribute and cannot be involuntarily triggered by the user's operating system preferences.
- **WCAG 2.2 AA Contrast Guarantee**:
  - In light theme mode, card containers MUST use pure white or light slate surfaces (`#ffffff` or `#f8fafc`) with dark high-contrast typography (`#0f172a` or `#1e293b`).
  - Never apply `dark:bg-slate-900` without guaranteeing that all child text, labels, borders, and input placeholders explicitly invert to high-contrast light colors (`#ffffff` / `#e2e8f0`).
  - Inactive segmented buttons, tabs, and filter pills in light mode must maintain at least 4.5:1 contrast against their container (e.g., `#334155` text on `#e2e8f0` background).

## 2. Standard Mode (Shopkeeper / Merchant) Jargon Firewall
When building or updating user interfaces in **Standard Mode**, strictly enforce the following language dictionary:

| Prohibited Jargon in Standard Mode | Mandatory Standard Mode Terminology | Rationale |
| :--- | :--- | :--- |
| `BSS` / `BSS Auto-Pilot` | `Store Assistant` / `Daily Store Auto-Pilot` | BSS (Business Support Systems) is telco relic jargon. |
| `Ledger Invariant` / `Invariant` | `Books Balanced` / `Balanced Books` | "Invariant" is computer science/math jargon. |
| `0 Variance` / `Variance` | `All Payments Matched` / `Difference` | "Variance" is institutional auditing jargon. |
| `Stock Sweeper` / `TTL Sweeper` | `Restock Unpaid Orders` / `Auto-Restocker` | "Sweeper" is a background daemon term. |
| `Reclaimed: X items` | `Restocked for Walk-ins: X items` | Clarifies the direct business benefit to a shopkeeper. |
| `Auto-Healed` | `Auto-Matched` / `Reconciled` | Systems engineering jargon. |
| `Ledger Active` (Navbar pill) | `Store Open · Till Live` / `Till Active` | Shopkeepers care about Till and shop status. |
| `Courier Tariffs` | `Delivery Fee` | Standard commerce terminology. |

## 3. Regional Commercial Authenticity & Mock Data Guardrails
- In Kenyan SME / African retail contexts, never inject generic US faker strings (`71498 Grady Shoals`, `299-338-0504 x3224`, `Acme Corp`).
- Always use localized names (e.g., `Kevin Ochieng`, `Amina Wangari`, `Brian Mutua`, `Faith Chebet`), Kenyan M-Pesa mobile numbers (`+254 7XX XXX XXX`), and familiar regional delivery zones (`Kilimani`, `Westlands`, `CBD`, `Karen`, `Lavington`, `South C`).

## 4. Theme & Cockpit Mode Defaults (Device Standard)
- Default to `System` for theme mode preference so new visits automatically adapt to the user's device/OS light or dark standard without manual toggle.
- Default to `Standard` mode for cockpit experience so non-expert shopkeepers are welcomed with an assisted, clean UI.
