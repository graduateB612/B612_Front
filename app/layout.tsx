import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import InactivityTimer from "./components/inactivity-timer"

// // PF Stardust 3.0 폰트 설정
// const pfStardust = localFont({
//   src: [
//     {
//       path: "../public/font/PFstardust 3.0.ttf",
//       weight: "400",
//       style: "normal",
//     },
//   ],
//   display: "swap",
//   variable: "--font-pf-stardust",
// })

// neodgm 폰트 설정 (보조 폰트로 유지)
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
    <html lang="en" className={` ${neodgm.variable}`}>
      <body style={{ fontFamily: " var(--font-neodgm), sans-serif" }}>
        <InactivityTimer />
        {children}
      </body>
    </html>
  )
}

