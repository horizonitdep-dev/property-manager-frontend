import type { Metadata } from "next"

import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/sonner"
import { interLocal } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Horizon Property Manager",
  description: "Horizon Property Manager — portfolio, buildings, and operations console.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${interLocal.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
