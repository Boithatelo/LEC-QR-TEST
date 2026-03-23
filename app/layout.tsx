import "./globals.css"
import { Manrope, Sora } from "next/font/google"
import { AppShell } from "@/components/layout/AppShell"

const landingDisplayFont = Sora({
  subsets: ["latin"],
  variable: "--font-landing-display",
  weight: ["600", "700"],
})

const landingBodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-landing-body",
  weight: ["400", "500", "600", "700"],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${landingDisplayFont.variable} ${landingBodyFont.variable} min-h-screen bg-background text-foreground antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
