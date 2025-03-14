import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

// 폰트 설정 - 경로 확인 필요
const neodgm = localFont({
  src: [
    {
      path: "../public/font/neodgm.woff",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-neodgm",
})

export const metadata: Metadata = {
  title: "B612",
  description: "Little Prince",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={neodgm.variable}>
      <body style={{ fontFamily: "var(--font-neodgm), sans-serif" }}>{children}</body>
    </html>
  )
}

