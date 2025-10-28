"use client"

import { ReactNode } from "react"

interface SectionFrameProps {
  children: ReactNode
  className?: string
  withPattern?: boolean
  disableSnap?: boolean
  transparent?: boolean
}

export default function SectionFrame({ children, className = "", withPattern = true, disableSnap = false, transparent = false }: SectionFrameProps) {
  return (
    <section
      className={`${disableSnap ? '' : 'snap-start'} relative flex min-h-screen items-center justify-center overflow-hidden ${transparent ? 'bg-transparent' : 'bg-gray-900'} ${className}`}
    >
      {/* 점 패턴 오버레이 (옵션) */}
      {withPattern && (
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>
      )}

      {/* 실제 섹션 콘텐츠 */}
      <div className="relative z-[5] w-full flex items-center justify-center">
        {children}
      </div>
    </section>
  )
}


