# Horizon PM — Frontend Implementation Guide (Scoped Sprint)

**Scope:** Login → Menu Select → Dashboard → Buildings (List + Add/Edit)
**Designs:** Extracted from Stitch HTML/CSS exports
**Backend:** NestJS at `/api/v1` — confirmed envelope `{ success, statusCode, message, data, timestamp, path }`

---

## 1. Scope of This Sprint

Build ONLY these 5 screens. All other modules stay as disabled sidebar links.

| Screen | Route | Notes |
|---|---|---|
| Login | `/login` | Auth form → calls `/api/v1/auth/login` |
| Menu Select | `/select` (post-login landing) | Grid of module cards; only Dashboard + Buildings active |
| Dashboard | `/dashboard` | App shell + placeholder KPI overview |
| Buildings List | `/buildings` | Data table with all buildings |
| Building Add/Edit | `/buildings/new`, `/buildings/[id]/edit` | Shared form |

---

## 2. Design Tokens (Extracted from Stitch)

> **IMPORTANT:** The Stitch exports have one inconsistency — the **login screen** uses teal (`#0d9488`) as the accent, while the **dashboard/buildings** screens use blue (`#2563eb`). **Standardize on the dashboard palette below** (blue accent) across all screens for consistency. Flag confirmed with PM.

### Final Color Palette (use these in `tailwind.config.ts`)

```typescript
colors: {
  // Core
  primary: '#0F172A',              // Charcoal navy — headings, sidebar, primary buttons
  'on-primary': '#FFFFFF',
  secondary: '#2563EB',            // Professional blue — primary actions, links, active states
  'on-secondary': '#FFFFFF',

  // Surfaces
  background: '#F8FAFC',           // App background (slate-50)
  surface: '#FFFFFF',              // Cards, panels
  'surface-container': '#F8FAFC',
  'surface-container-high': '#F1F5F9',   // slate-100
  'surface-container-highest': '#E2E8F0', // slate-200

  // Text
  'on-surface': '#0F172A',         // Primary text
  'on-surface-variant': '#475569', // Secondary text (slate-600)
  'on-background': '#0F172A',

  // Borders
  outline: '#94A3B8',              // slate-400
  'outline-variant': '#CBD5E1',    // slate-300 — default borders

  // Status
  success: '#10B981',              // Emerald — paid, occupied, active
  warning: '#F59E0B',              // Amber — expiring, pending
  error: '#E11D48',                // Crimson — overdue, unpaid, vacant
  'on-error': '#FFFFFF',
}
```

### Typography

```typescript
fontFamily: {
  // Geist for structure (headings, labels, numbers)
  display: ['Geist', 'system-ui', 'sans-serif'],
  heading: ['Geist', 'system-ui', 'sans-serif'],
  // Inter for body / data reading
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```

| Style | Font | Size | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| Display | Geist | 32px | 600 | -0.02em | Page hero titles |
| H1 | Geist | 24px | 600 | -0.01em | Page titles |
| H2 | Geist | 20px | 500 | -0.01em | Section titles |
| Body LG | Inter | 16px | 400 | — | Primary body |
| Body MD | Inter | 14px | 400 | — | Table content |
| Label SM | Geist | 12px | 600 | 0.02em | Uppercase labels, table headers |
| Data Mono | Geist | 14px | 500 | 0 | Monetary values, unit numbers |

**Font loading:** Use `next/font/google` for Inter, and `next/font/local` or the Geist npm package (`geist/font`) for Geist. Material Symbols Outlined for icons (or swap to Lucide — see note below).

### Spacing & Radii

```typescript
// 8pt grid system
borderRadius: {
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px — cards
  xl: '0.75rem',    // 12px — modals
  full: '9999px',   // pills/badges
}
// Container padding: 32px | Gutter: 24px | Stack: 8/16/24px
// Sidebar: 240px expanded / 64px collapsed
```

### Icons

The Stitch export uses **Material Symbols Outlined**. Two options:
- **Option A (match design exactly):** Keep Material Symbols Outlined via the Google Fonts link.
- **Option B (recommended, matches spec):** Use **Lucide React** — cleaner, tree-shakeable, no font download. Map each Material icon to its Lucide equivalent (e.g., `apartment` → `Building2`, `dashboard` → `LayoutDashboard`, `groups` → `Users`, `description` → `FileText`, `payments` → `Wallet`, `settings` → `Settings`).

---

## 3. Backend Contract Sync

These MUST match your NestJS backend exactly. **Confirm the two ⚠️ items below before building.**

### Response Envelope (confirmed ✅)
```json
{ "success": true, "statusCode": 200, "message": "...", "data": {...}, "timestamp": "...", "path": "..." }
```
Every service unwraps `response.data.data` to get the payload.

### ⚠️ CONFIRM 1 — Auth method
Log in with valid creds and check the successful response:
- **If `data` contains `accessToken`/`refreshToken`** → body-token auth → store access token in memory (Zustand), refresh token handling per backend.
- **If `data` only has the `user` and there's a `Set-Cookie` header** → cookie auth → use `withCredentials: true`, no manual token storage.

The frontend spec supports both — just set the `AUTH_MODE` constant accordingly.

### ⚠️ CONFIRM 2 — Role enum values
Check Prisma schema. Frontend `UserRole` type MUST match exactly (likely `'MANAGER' | 'SECRETARY'` uppercase).

### Building entity (matches your Prisma schema)
```typescript
interface Building {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  buildingType: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE';
  totalFloors: number;
  yearBuilt?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Design also shows "Total Units" + "Construction Status" —
  // these are NOT in the current backend schema. See note below.
}
```

> **⚠️ Design vs. Backend gap:** The building list design shows **"Total Units"** and **"Construction Status"** columns. Your current backend Building schema does NOT have these fields yet.
> **Options:** (a) Show "Total Units" as `—` / "N/A" until the Properties module exists (units get counted from there later); (b) add a `constructionStatus` enum to the backend now if the client wants it. **Recommend option (a)** to stay in scope — flag "Total Units" as a computed placeholder.

---

## 4. Screen-by-Screen Implementation

### 4.1 Login (`/login`)
- Centered card on `background` (#F8FAFC) with subtle architectural grid pattern (optional — it's in the CSS)
- Logo + "Horizon Property Manager" title (Geist, display size)
- Email + Password fields (Inter, body-md), labels in Label SM uppercase
- Primary button (`primary` bg, `on-primary` text), full width
- Error state: show `message` from API envelope in `error` color below the form
- On success → redirect to `/select` (menu) or directly `/dashboard`
- React Hook Form + Zod validation (email format, password min length)

### 4.2 Menu Select (`/select`)
- Post-login landing: grid of module cards
- Each card: icon + module name + short description
- **Active cards:** Dashboard, Buildings (clickable, full color)
- **Disabled cards:** Properties, Tenants, Contracts, Finance, Maintenance, Contracting, Staffing, Reports (grayed, `outline-variant`, "Coming soon" tag)
- Clicking Dashboard → `/dashboard`, Buildings → `/buildings`
- *Optional:* you can skip this screen and land directly on `/dashboard` if the client prefers — confirm with PM.

### 4.3 Dashboard (`/dashboard`)
- Full app shell (sidebar + header) — this is where the shell lives
- Placeholder KPI cards (Total Buildings is the only real one for now — the rest show `—` until later modules)
- Sidebar nav order (from design): Dashboard, Properties, Buildings, Tenants, Contracts, Finance, Maintenance, Contracting, Staffing, Reports, Settings
- Only **Dashboard** and **Buildings** links enabled; rest disabled/grayed
- Header: logo, collapse toggle, user name + role badge, user menu (logout)

### 4.4 Buildings List (`/buildings`)
- Page header: "Buildings" title + "Register New Building" button (Manager only, via `<RoleGate>`)
- Data table (TanStack Table) columns from design:
  - Building Name (sortable)
  - Building Code (sortable)
  - Building Type (badge)
  - Address
  - City
  - Total Floors
  - Year Built
  - Total Units → placeholder `—` (see gap note)
  - Actions (View / Edit / Delete — Manager only)
- Search bar (debounced, name + code)
- Filter by Building Type
- Pagination (matches backend `page`/`limit` query params)
- Loading skeleton, empty state, error state

### 4.5 Building Add/Edit (`/buildings/new`, `/buildings/[id]/edit`)
- Shared `BuildingForm` component
- Fields matching backend `CreateBuildingDto`: name, code, address, city, buildingType, totalFloors, yearBuilt (optional), notes (optional)
- Zod schema mirrors backend validation (code regex `^[A-Z0-9-]+$`, floors 1–200, year 1900–current)
- Duplicate code → backend returns 409 → show toast with `message`
- Save → `POST` or `PATCH` → success toast → redirect to `/buildings/[id]` or `/buildings`
- Cancel → back to list

---

## 5. Claude Code Prompt

> Build the frontend for **Horizon Property Manager** using the attached implementation guide and the Stitch design exports (in the `stitch-designs/` folder: `login screen/`, `menu select/`, `dashboard/`, `building list/` — each has `code.html`, `screen.png`, `DESIGN.md`).
>
> **Stack:** Next.js 14 (App Router) + TypeScript strict + Tailwind + shadcn/ui + TanStack Query v5 + TanStack Table v8 + React Hook Form + Zod + Zustand + Axios + Sonner. Fonts: Geist (headings/labels/numbers) + Inter (body) via next/font. Icons: Lucide React.
>
> **Backend:** NestJS at `http://localhost:3000/api/v1`. Response envelope is `{ success, statusCode, message, data, timestamp, path }` — every service must unwrap `res.data.data`. Endpoints: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `GET /buildings` (paginated: page, limit, search, buildingType, sortBy, sortOrder), `GET /buildings/:id`, `POST /buildings`, `PATCH /buildings/:id`, `DELETE /buildings/:id`.
>
> **SCOPE — build ONLY these screens, nothing else:**
> 1. **Login** (`/login`) — form, Zod validation, calls `/auth/login`, handles error envelope, redirects on success
> 2. **Menu Select** (`/select`) — grid of module cards; only Dashboard + Buildings active, rest disabled with "Coming soon"
> 3. **Dashboard** (`/dashboard`) — full app shell (sidebar + header) + placeholder KPI cards
> 4. **Buildings List** (`/buildings`) — TanStack Table with search, type filter, sort, pagination
> 5. **Building Add/Edit** (`/buildings/new`, `/buildings/[id]/edit`) — shared form, Zod validation matching backend DTO
>
> All OTHER sidebar modules (Properties, Tenants, Contracts, Finance, Maintenance, Contracting, Staffing, Reports) render as DISABLED/grayed sidebar links — do not build their pages.
>
> **Design tokens — use exactly (from the guide):**
> - primary `#0F172A`, secondary `#2563EB`, background `#F8FAFC`, surface `#FFFFFF`
> - text `#0F172A` / `#475569`, borders `#CBD5E1`
> - status: success `#10B981`, warning `#F59E0B`, error `#E11D48`
> - Note: login export uses teal but STANDARDIZE on blue `#2563EB` across ALL screens
> - Sidebar: 240px expanded / 64px collapsed. 8pt spacing grid. Card radius `0.5rem`.
> - Read each `code.html` to match layout, spacing, and structure precisely; use `screen.png` as the visual reference.
>
> **Auth:** Read the `AUTH_MODE` — I will tell you whether the backend uses httpOnly cookies or body tokens. Default to cookie mode (`withCredentials: true`) with an Axios 401-refresh interceptor. Role values are `'MANAGER' | 'SECRETARY'`.
>
> **Building schema note:** Backend Building has: name, code, address, city, buildingType (RESIDENTIAL|COMMERCIAL|MIXED_USE), totalFloors, yearBuilt?, notes?. The design shows "Total Units" and "Construction Status" — these are NOT in the backend yet. Render "Total Units" as `—` placeholder; omit Construction Status (or render `—`). Do not invent backend fields.
>
> **Requirements:**
> - Server state → TanStack Query only. Client state → Zustand only.
> - Every form: React Hook Form + Zod resolver. Every API call: through the service layer. Every mutation: toast on success/error.
> - Every list: loading skeleton + empty state + error state.
> - Manager-only actions (Register/Edit/Delete building) wrapped in `<RoleGate allowedRoles={['MANAGER']}>`.
> - `middleware.ts` protects routes based on auth. Routes + query keys centralized in constants. No `any` types.
>
> Build in this order, asking before each major step: config/env → tailwind theme + fonts → api client + auth service → zustand stores → middleware → login → menu select → app shell → dashboard → buildings list → building form → delete flow.

---

## 6. Pre-Build Checklist

Before you paste the prompt into Claude Code:

- [ ] Confirm auth mode (cookies vs body tokens) — log in and check the response
- [ ] Confirm role enum values from Prisma (`MANAGER`/`SECRETARY`)
- [ ] Decide: keep Menu Select screen, or land directly on Dashboard?
- [ ] Decide: "Total Units" shows `—` for now (recommended) vs add fields to backend
- [ ] Place the 4 Stitch design folders in `stitch-designs/` at the project root
- [ ] Backend running on `localhost:3000` with CORS allowing `localhost:3001`
- [ ] Have a seeded Manager + Secretary account ready to test both roles

---

**End of Guide**
