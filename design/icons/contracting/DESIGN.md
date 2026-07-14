---
name: Horizon Property Manager
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h2:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
  data-mono:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 32px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system is engineered to convey authority, precision, and institutional reliability. Drawing inspiration from high-performance developer tools, the aesthetic leans into **Minimalism** with a **Corporate Modern** foundation. The interface prioritizes clarity of data over decorative elements, ensuring that property managers can navigate complex financial and tenant information without cognitive fatigue.

The visual language is characterized by:
- **Precision:** Strict alignment and razor-sharp borders.
- **Utility:** High-contrast labels and a focus on functional density.
- **Sophistication:** A monochromatic base punctuated by deliberate, professional accents that signal action and status.

## Colors

The palette is anchored by a deep charcoal-navy, providing a sense of "Real Estate" stability. The system utilizes a "Cool Gray" scale to define the spatial environment, creating a clean, high-end feel reminiscent of modern technical documentation.

- **Primary:** Charcoal Navy (#0F172A) used for headings, primary navigation, and high-emphasis components.
- **Accents:** Professional Blue (#2563EB) for primary actions and Emerald Green (#10B981) for growth-oriented data and successful collections.
- **Status:** Semantic colors are used sparingly but with high contrast: Crimson Red for outstanding payments, Amber for expiring leases, and Emerald for reconciled accounts.
- **Neutrals:** A range from Slate-50 (#F8FAFC) for backgrounds to Slate-200 (#E2E8F0) for borders, ensuring a layered but flat aesthetic.

## Typography

This design system utilizes **Geist** for structural elements and **Inter** for long-form data reading. The hierarchy is strictly enforced to ensure that financial figures and tenant names are immediately scannable.

- **Headlines:** Set in Geist with tighter letter-spacing to evoke a modern, technical feel.
- **Body:** Set in Inter for maximum legibility across dense property tables.
- **Labels:** Small, uppercase Geist labels are used for metadata and table headers to provide clear distinction from content.
- **Monospace Influence:** Geist's clean, technical proportions are leveraged for monetary values and unit numbers to ensure numerical alignment.

## Layout & Spacing

The system employs a **Fixed Grid** philosophy within a fluid container. Content is structured on an 8pt grid system to maintain mathematical harmony.

- **Grid:** A 12-column layout for main dashboards, with a collapsed sidebar (64px) or expanded sidebar (240px).
- **Margins:** Generous outer margins (32px) provide the "premium" breathing room necessary for high-stakes financial data.
- **Rhythm:** Vertical spacing is aggressive in its consistency—using 16px for related items and 24px for distinct sections to create a clear "layered" feel without relying on heavy shadows.

## Elevation & Depth

To maintain the clean, Vercel-inspired aesthetic, the design system avoids heavy drop shadows. Instead, it uses **Tonal Layers** and **Subtle Outlines**.

- **Surface 0:** The main application background (Slate-50).
- **Surface 1:** Primary cards and containers (White) with a 1px border (Slate-200).
- **Surface 2:** Modals and popovers, featuring a very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) to indicate depth.
- **Interactions:** Hover states are indicated by a subtle shift to a lighter neutral background or a slightly darker border, rather than a lift in elevation.

## Shapes

The shape language is strictly controlled to maintain a professional, high-performance tone. 

- **Corners:** A standard radius of 4-6px is applied to all buttons, input fields, and cards. This is "Soft" enough to feel modern but "Sharp" enough to feel serious.
- **Buttons:** Small-scale buttons use the same radius to maintain a cohesive look.
- **Checkboxes:** 2px radius for a crisp, functional appearance.
- **Avatars:** Rounded-full (pill) is the only exception, used to distinguish human entities (Tenants/Owners) from property assets.

## Components

The component library focuses on high-density information display with a flat, sophisticated finish.

- **Buttons:** Flat fills for primary actions (Charcoal Navy). Secondary actions use a "Ghost" style—white background with a Slate-200 border. No gradients or inner shadows.
- **Cards:** White background, 1px Slate-200 border, and 6px rounded corners. Headers within cards use a subtle Slate-50 bottom border.
- **Input Fields:** Minimalist design with a 1px border. Focus states use a 1px Blue-600 ring. Labels are positioned above the field in Geist-Bold at 12px.
- **Data Tables:** The core of the system. No vertical borders; horizontal borders only in Slate-100. Row hovers utilize a faint Slate-50 tint.
- **Status Chips:** Small, low-saturation backgrounds with high-saturation text (e.g., light green background with dark emerald text) to indicate "Collected" or "Vacant."
- **Navigation:** A vertical sidebar using high-contrast icons (20px) and 14px Geist labels. Active states are indicated by a subtle left-aligned 2px blue accent line.