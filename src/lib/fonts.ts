import localFont from "next/font/local"

// Self-hosted from @fontsource-variable/inter (already in node_modules) so no
// network fetch to Google Fonts is required at build time.
export const interLocal = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-standard-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  style: "normal",
  display: "swap",
})
