"use client"

import Image from "next/image"
import { useRef, useEffect, useState, useLayoutEffect } from "react"

interface PlanetProps {
  src: string
  alt: string
  size: number
  center: {
    x: number // 0~1 (비율)
    y: number // 0~1 (비율)
  }
  orbitRadius: number // px
  speed: number // radian/sec
  initialAngle?: number // radian
  isActive?: boolean
  containerSize: { width: number; height: number }
}

const Planet = ({ src, alt, size, center, orbitRadius, speed, initialAngle = 0, isActive = true, containerSize }: PlanetProps) => {
  const [angle, setAngle] = useState(initialAngle)
  const requestRef = useRef<number | null>(null)
  const prevTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isActive) return
    const animate = (time: number) => {
      if (prevTimeRef.current !== null) {
        const delta = (time - prevTimeRef.current) / 1000 // 초 단위
        setAngle(prev => prev + speed * delta)
      }
      prevTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    }
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isActive, speed])

  

  // 중심점 기준 원형 궤도 계산 (px 단위)
  const rad = angle
  const cx = containerSize.width * center.x
  const cy = containerSize.height * center.y
  const x = cx + Math.cos(rad) * orbitRadius - size / 2
  const y = cy + Math.sin(rad) * orbitRadius - size / 2

  return (
    <div
      className="absolute"
      style={{
        top: y,
        left: x,
        width: size,
        height: size,
        transition: isActive ? undefined : 'top 0.3s, left 0.3s',
      }}
    >
      <div className="relative w-full h-full">
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

interface PlanetData {
  src: string
  alt: string
  size: number
  center: { x: number; y: number }
  orbitRadius: number
  speed: number
  initialAngle: number
}

export default function PlanetBackground({ isActive = true }: PlanetBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 1920, height: 1080 })

  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // 랜덤 값 생성 함수
  const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min

  // 행성 정보 배열
  const planetData = [
    { src: "/image/planets/planet_1.png", alt: "아쿠아 행성" },
    { src: "/image/planets/planet_2.png", alt: "루나 행성" },
    { src: "/image/planets/planet_3.png", alt: "테라 행성" },
    { src: "/image/planets/planet_4.png", alt: "가이아 행성" },
    { src: "/image/planets/planet_5.png", alt: "에메랄드 행성" },
    { src: "/image/planets/planet_6.png", alt: "마르스 행성" },
    { src: "/image/planets/planet_7.png", alt: "솔라리스 행성" },
    { src: "/image/planets/planet_8.png", alt: "네프티스 행성" },
  ]

  // 행성 랜덤 속성 생성 (클라이언트에서만)
  const [planets, setPlanets] = useState<PlanetData[] | null>(null)
  
  useEffect(() => {
    setPlanets(
      planetData.map((p) => ({
        ...p,
        size: randomBetween(80, 200),
        center: { x: randomBetween(0.2, 0.8), y: randomBetween(0.2, 0.8) },
        orbitRadius: randomBetween(200, 550),
        speed: (Math.random() > 0.5 ? 1 : -1) * randomBetween(0.2, 1.0),
        initialAngle: randomBetween(0, Math.PI * 2),
      }))
    )
  }, [])

  if (!planets) return null

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
      {/* 행성들 */}
      {planets.map((planet, i) => (
        <Planet
          key={i}
          src={planet.src}
          alt={planet.alt}
          size={planet.size}
          center={planet.center}
          orbitRadius={planet.orbitRadius}
          speed={planet.speed}
          initialAngle={planet.initialAngle}
          isActive={isActive}
          containerSize={containerSize}
        />
      ))}
    </div>
  )
}