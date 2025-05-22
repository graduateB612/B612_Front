"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

interface PlanetProps {
  src: string
  alt: string
  size: number
  position: {
    top: string
    left: string
  }
  animationDelay?: number
  animationDuration?: number
}

const Planet = ({ src, alt, size, position, animationDelay = 0, animationDuration = 6 }: PlanetProps) => {
  return (
    <div
      className="absolute"
      style={{
        top: position.top,
        left: position.left,
        animation: `float ${animationDuration}s ease-in-out infinite`,
        animationDelay: `${animationDelay}s`,
      }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          className="pixelated object-contain select-none"
          style={{
            userSelect: "none",
            pointerEvents: "none",
          }}
          draggable={false}
          priority
        />
      </div>
    </div>
  )
}

export default function PlanetBackground() {
  // 별 생성을 위한 참조
  const starsRef = useRef<HTMLDivElement>(null)

  // 별 생성 함수
  useEffect(() => {
    if (!starsRef.current) return

    const starsContainer = starsRef.current
    starsContainer.innerHTML = ""

    // 별 개수
    const starCount = 100

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
      star.style.opacity = `${Math.random() * 0.7 + 0.3}`

      // 별 깜빡임 애니메이션
      star.style.animation = `twinkle ${Math.random() * 5 + 3}s ease-in-out infinite`
      star.style.animationDelay = `${Math.random() * 5}s`

      starsContainer.appendChild(star)
    }
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 별 배경 */}
      <div ref={starsRef} className="absolute inset-0 z-0" />

      {/* 행성들 */}
      <Planet
        src="/image/planets/planet_1.png"
        alt="아쿠아 행성"
        size={120}
        position={{ top: "15%", left: "15%" }}
        animationDuration={7}
        animationDelay={1}
      />

      <Planet
        src="/image/planets/planet_5.png"
        alt="에메랄드 행성"
        size={200}
        position={{ top: "20%", left: "70%" }}
        animationDuration={9}
        animationDelay={0}
      />

      <Planet
        src="/image/planets/planet_4.png"
        alt="가이아 행성"
        size={140}
        position={{ top: "50%", left: "50%" }}
        animationDuration={8}
        animationDelay={2}
      />

      <Planet
        src="/image/planets/planet_7.png"
        alt="솔라리스 행성"
        size={100}
        position={{ top: "70%", left: "25%" }}
        animationDuration={6}
        animationDelay={1.5}
      />

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
