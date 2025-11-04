"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function InactivityTimer() {
  const router = useRouter()
  const pathname = usePathname()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 메인 페이지에서는 타이머 비활성화
    if (pathname === "/") {
      return
    }

    const resetTimer = () => {
      // 기존 타이머 클리어
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 3분(180000ms) 후 메인 페이지로 리다이렉트
      timeoutRef.current = setTimeout(() => {
        router.push("/")
      }, 180000)
    }

    // 사용자 활동 감지 이벤트들
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"]

    // 초기 타이머 시작
    resetTimer()

    // 모든 이벤트에 리스너 등록
    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    // 클린업: 타이머와 이벤트 리스너 제거
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [pathname, router])

  return null
}

