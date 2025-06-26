"use client"

import { useLayoutEffect, useRef, memo } from "react"

const StarBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const starsCreatedRef = useRef(false)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || starsCreatedRef.current) return

    // 별 개수
    const starCount = 100
    const stars: HTMLDivElement[] = []

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div")

      // 별 크기 (1px ~ 2px)
      const size = Math.random() * 1 + 1

      // 별 위치
      const top = Math.random() * 100
      const left = Math.random() * 100

      // 별 스타일
      star.style.width = `${size}px`
      star.style.height = `${size}px`
      star.style.top = `${top}%`
      star.style.left = `${left}%`
      star.style.position = "absolute"
      star.style.borderRadius = "50%"
      star.style.backgroundColor = "white"
      star.style.opacity = `${Math.random() * 0.5 + 0.2}`

      // 별 깜빡임 애니메이션
      star.style.animation = `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`
      star.style.animationDelay = `${Math.random() * 4}s`

      container.appendChild(star)
      stars.push(star)
    }

    starsCreatedRef.current = true

    // cleanup 함수
    return () => {
      if (starsCreatedRef.current) {
        stars.forEach(star => star.remove())
        starsCreatedRef.current = false
      }
    }
  }, []) // 컴포넌트 마운트 시 한 번만 실행

  return <div ref={containerRef} className="absolute inset-0 z-10" />
}

export default memo(StarBackground) 