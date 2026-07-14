# Claude Code Prompt — Rebuild Shell + Dashboard (Top-Nav Layout)

Copy everything inside the block below and paste it into Claude Code.

---

## THE PROMPT

> **Rebuild the app shell and dashboard.** The current build uses a left-sidebar layout, but the intended design is a **top horizontal navigation** — remove the sidebar completely. Reference `stitch-designs/dashboard/code.html` and `stitch-designs/dashboard/screen.png` as the source of truth for structure and styling. **Keep all existing Buildings module logic, services, hooks, and API integration** — only the layout shell and dashboard page change.
>
> ### Layout architecture (critical)
> Replace the sidebar shell with a **persistent top-nav shell**:
> - A fixed **header** at the very top (logo, search, notifications, user) — stays identical on every screen
> - A **horizontal module nav row** directly below the page title (the pill/card nav) — stays identical on every screen
> - A **content region below** that swaps based on the selected module
> - When "Buildings" is selected, the header + nav row remain unchanged and ONLY the content region below renders the Buildings content. Same for every other module.
> - NO left sidebar anywhere.
>
> This means the shell layout (`(dashboard)/layout.tsx`) contains the header + nav row, and each route (`/dashboard`, `/buildings`) renders only its content into the region below.
>
> ### Header (match exactly)
> - Sticky, `bg-white/80 backdrop-blur-xl`, bottom border `border-outline-variant`, height ~96px, `z-50`, inner max-width `1700px` centered
> - **Left:** logo block — a `w-2 h-8 bg-secondary rounded-full` accent bar next to bold `font-display text-2xl font-black tracking-tighter` title "Horizon Property Manager", with a tiny uppercase tracked subtitle "Property Manager" below
> - **Center:** search box, `w-[450px]`, `bg-surface-container rounded-2xl`, search icon on the left, placeholder "Search portfolio assets...", focus ring in secondary color
> - **Right:** two icon buttons (notifications, chat) as `w-12 h-12 rounded-2xl bg-surface-container` with hover `bg-secondary hover:text-white`; a thin vertical divider; then the user block — name in `font-display font-extrabold`, a role badge pill below it (`bg-primary text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md`) showing the CURRENT USER'S ROLE ("MANAGER" / "SECRETARY"), and an avatar in a `rounded-2xl ring-4 ring-secondary/10` frame with a green online dot
>
> ### Page title + module nav row (match exactly)
> - Page title: `font-display text-display text-primary` with the second word in `text-secondary italic` (e.g. "Portfolio **Overview**")
> - A short welcome/subtitle line under it in `text-on-surface-variant`
> - **Module nav grid:** `grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-5` — one card per module
> - Each nav card: `p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4`, white bg, `border-2 border-transparent`, subtle shadow, with a large icon (`text-4xl`) on top and a `font-label-sm` label below
> - **Hover state:** `translateY(-4px)`, bg `#f8fafc`, border `#3b82f6`
> - **Active state:** `background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`, white text, strong shadow, no border
> - Module order + icons (use Lucide equivalents of these): Overview (`LayoutDashboard`), Properties (`Building2`), Buildings (`Building`), Tenants (`Users`), Contracts (`ShieldCheck`), Finance (`Wallet`), Services/Maintenance (`Wrench`), Staffing (`BadgeCheck`), Reports (`BarChart3`), Settings (`Settings`)
> - Each icon keeps its accent color from the design: Properties blue-600, Buildings slate-800, Tenants sky-600, Contracts indigo-600, Finance emerald-600, Services amber-600, Staffing purple-600, Reports rose-600, Settings slate-400
> - **Enabled/clickable:** Overview→`/dashboard`, Buildings→`/buildings`. All others render but are visually dimmed (`opacity-50 cursor-not-allowed`) with a small "Soon" indicator — do NOT link them.
> - The active card reflects the current route (Overview active on /dashboard, Buildings active on /buildings).
>
> ### KPI cards on the dashboard (match exactly)
> - `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8`
> - Each card: white, rounded-2xl, `border border-slate-200/60`, layered soft shadow, hover lifts `translateY(-8px) scale(1.02)` with a blue-tinted shadow
> - Top-left of each card: a **gradient icon chip** (rounded-2xl, ~`w-14 h-14`, white icon inside) using these gradients:
>   - Total Assets/Buildings → blue `linear-gradient(135deg,#60a5fa,#2563eb)`
>   - Occupancy → emerald `linear-gradient(135deg,#34d399,#10b981)`
>   - Net Profit → purple `linear-gradient(135deg,#a78bfa,#7c3aed)`
>   - Arrears → rose `linear-gradient(135deg,#fb7185,#e11d48)`
>   - Maintenance → amber `linear-gradient(135deg,#fbbf24,#f59e0b)`
> - Top-right: a small status pill (`status-badge-vibrant` — rounded-full, uppercase, `text-[11px] font-extrabold tracking-wider`)
> - Big number in `font-display font-black` (large), with a small colored-dot label line below
> - Subtle background illustration/shape in the card corner (use a faint radial-gradient shape or a low-opacity Lucide icon watermark — keep it behind the content with `z-0`)
> - **Real data:** wire "Total Buildings" to the real buildings count from the existing buildings query. The other four cards (Occupancy, Net Profit, Arrears, Maintenance) show `—` placeholders until those modules exist — keep the exact card styling, just placeholder values.
>
> ### Fonts + tokens
> - Confirm Tailwind theme has: primary `#0F172A`, secondary `#2563EB`, background `#F8FAFC`, surface `#FFFFFF`, on-surface `#0F172A`, on-surface-variant `#475569`, outline-variant `#CBD5E1`, plus success `#10B981`, warning `#F59E0B`, error `#E11D48`
> - Fonts: **Geist** for `font-display` / headings / labels / numbers, **Inter** for body, loaded via next/font
> - Add the custom utility classes from the design's `<style>` block (`nav-hub-card`, `nav-hub-card.active`, `infographic-card`, `gradient-icon-*`, `status-badge-vibrant`, icon glow filters) either as global CSS in `globals.css` or as Tailwind component layers — reproduce them exactly as in `stitch-designs/dashboard/code.html`.
>
> ### Buildings integration (do not break)
> - Keep the existing buildings list, detail, create/edit form, delete flow, services, hooks, and types EXACTLY as they are.
> - Only change how they're framed: they now render inside the top-nav shell's content region instead of the sidebar layout. The Buildings list/detail/form pages keep all their logic; they just no longer sit next to a sidebar.
> - When on `/buildings`, the "Buildings" nav card is in the active state.
>
> ### Steps
> 1. First, read `design/dashboard/code.html` fully and extract the exact structure, classes, and the `<style>` block.
> 2. Rebuild `(dashboard)/layout.tsx` as the top-nav shell (header + page-title slot + module nav row + content region). Remove the sidebar component and its usages.
> 3. Rebuild the `/dashboard` page with the KPI cards, wiring Total Buildings to real data.
> 4. Reframe `/buildings` pages to render in the new shell, keeping all logic.
> 5. Confirm the role badge shows the real logged-in user's role, and only Overview + Buildings nav cards are active.
> 6. Run the dev server and verify against `screen.png`. Report anything in the design you couldn't reproduce.
>
> Do not touch the auth layer, API client, or buildings business logic. This is a layout + dashboard visual rebuild only.

---

## After It Runs

Check these against `screen.png`:
- [ ] No sidebar anywhere
- [ ] Header identical on `/dashboard` and `/buildings`
- [ ] Module nav row identical on both, correct card active per route
- [ ] KPI cards have gradient icon chips + status pills + hover lift
- [ ] Total Buildings shows real count; others show `—`
- [ ] Role badge shows real user role
- [ ] Buildings list/form/delete still work end-to-end
