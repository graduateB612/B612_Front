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
  isActive?: boolean
}

const Planet = ({ src, alt, size, position, animationDelay = 0, animationDuration = 6, isActive = true }: PlanetProps) => {
  return (
    <div
      className="absolute"
      style={{
        top: position.top,
        left: position.left,
        animationName: isActive ? 'float' : 'none',
        animationDuration: isActive ? `${animationDuration}s` : '0s',
        animationTimingFunction: isActive ? 'ease-in-out' : 'unset',
        animationIterationCount: isActive ? 'infinite' : 'unset',
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

interface PlanetBackgroundProps {
  isActive?: boolean
}

export default function PlanetBackground({ isActive = true }: PlanetBackgroundProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 행성들 */}
      <Planet
        src="/image/planets/planet_1.png"
        alt="아쿠아 행성"
        size={120}
        position={{ top: "15%", left: "15%" }}
        animationDuration={7}
        animationDelay={1}
        isActive={isActive}
      />

      <Planet
        src="/image/planets/planet_5.png"
        alt="에메랄드 행성"
        size={200}
        position={{ top: "20%", left: "70%" }}
        animationDuration={9}
        animationDelay={0}
        isActive={isActive}
      />

      <Planet
        src="/image/planets/planet_4.png"
        alt="가이아 행성"
        size={140}
        position={{ top: "50%", left: "50%" }}
        animationDuration={8}
        animationDelay={2}
        isActive={isActive}
      />

      <Planet
        src="/image/planets/planet_7.png"
        alt="솔라리스 행성"
        size={100}
        position={{ top: "70%", left: "25%" }}
        animationDuration={6}
        animationDelay={1.5}
        isActive={isActive}
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
      `}</style>
    </div>
  )
}
