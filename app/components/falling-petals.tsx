"use client"

import { useEffect, useRef } from "react"

interface Petal {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  verticalSpeed: number // 수직 속도
  horizontalSpeed: number // 수평 속도
  horizontalDirection: number // 수평 방향
  swingSpeed: number
  swingAmount: number
  delay: number
  petalIndex: number // 꽃잎 이미지 인덱스
  rotationSpeed: number
  rotationDirection: number
  maxRotation: number
  baseRotation: number
}

export function FallingPetals() {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const petalsRef = useRef<Petal[]>([])
  const petalElements = useRef<HTMLDivElement[]>([])
  const petalCount = 30

  // 사용할 꽃잎 이미지 인덱스 배열
  const petalImages = [1, 4, 6]

  useEffect(() => {
    if (!containerRef.current) return

    // 초기 꽃잎 데이터 생성
    petalsRef.current = Array.from({ length: petalCount }, (_, i) => {
      const baseRotation = Math.random() * 360

      return {
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: baseRotation,
        scale: 0.4 + Math.random() * 0.4,
        verticalSpeed: 0.3 + Math.random() * 0.7,
        horizontalSpeed: 0.2 + Math.random() * 0.5,
        horizontalDirection: Math.random() > 0.5 ? 1 : -1,
        swingSpeed: 0.05 + Math.random() * 0.15,
        swingAmount: 0.8 + Math.random() * 1.2,
        delay: Math.random() * 15,
        // 지정된 3개의 이미지만 사용
        petalIndex: petalImages[Math.floor(Math.random() * petalImages.length)],
        rotationSpeed: 0.5 + Math.random() * 1.0,
        rotationDirection: Math.random() > 0.5 ? 1 : -1,
        maxRotation: 15 + Math.random() * 20,
        baseRotation: baseRotation,
      }
    })

    // 꽃잎 요소 생성
    const container = containerRef.current
    container.innerHTML = ""
    petalElements.current = []

    petalsRef.current.forEach((petal) => {
      const petalElement = document.createElement("div")
      petalElement.className = "absolute"
      petalElement.style.left = `${petal.x}%`
      petalElement.style.top = `${petal.y}%`
      petalElement.style.transform = `rotate(${petal.rotation}deg) scale(${petal.scale})`
      petalElement.style.transition = "transform 0.1s linear"
      petalElement.style.opacity = "0.7"
      petalElement.style.willChange = "transform"

      const img = document.createElement("img")
      img.src = `/image/rose_reaf_${petal.petalIndex}.png`
      img.alt = "Rose petal"
      img.width = 30
      img.height = 30
      img.style.width = "30px"
      img.style.height = "30px"
      img.style.pointerEvents = "none"

      petalElement.appendChild(img)
      container.appendChild(petalElement)
      petalElements.current.push(petalElement)
    })

    let lastTime = 0

    // 애니메이션 함수 - 바람 요소 제거
    const animate = (time: number) => {
      if (!lastTime) lastTime = time
      const deltaTime = (time - lastTime) / 1000
      lastTime = time

      petalsRef.current.forEach((petal, index) => {
        const petalElement = petalElements.current[index]
        if (!petalElement) return

        if (petal.delay > 0) {
          petal.delay -= deltaTime
          return
        }

        // 수직 위치 업데이트
        petal.y += petal.verticalSpeed * deltaTime * 20

        // 수평 위치 업데이트 - 바람 요소 제거
        // 1. 기본 수평 이동
        const baseHorizontalMovement = petal.horizontalSpeed * petal.horizontalDirection * deltaTime * 3

        // 2. 진자 운동 (사인 함수)
        const swingMovement = Math.sin(time * 0.001 * petal.swingSpeed) * petal.swingAmount * deltaTime

        // 수평 움직임 요소 결합 (바람 요소 제거)
        petal.x += baseHorizontalMovement + swingMovement

        // 회전 업데이트
        const rotationOffset =
          Math.sin(time * 0.001 * petal.rotationSpeed) * petal.maxRotation * petal.rotationDirection
        petal.rotation = petal.baseRotation + rotationOffset

        // 화면 밖으로 나가면 다시 위로
        if (petal.y > 110 || petal.x < -20 || petal.x > 120) {
          resetPetal(petal)
        }

        // DOM 업데이트
        petalElement.style.left = `${petal.x}%`
        petalElement.style.top = `${petal.y}%`
        petalElement.style.transform = `rotate(${petal.rotation}deg) scale(${petal.scale})`
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    // 꽃잎 재설정 함수 - 바람 요소 제거
    function resetPetal(petal: Petal) {
      petal.x = Math.random() * 100
      petal.y = -10 - Math.random() * 10
      petal.baseRotation = Math.random() * 360
      petal.rotation = petal.baseRotation
      petal.verticalSpeed = 0.3 + Math.random() * 0.7
      petal.horizontalSpeed = 0.2 + Math.random() * 0.5
      petal.horizontalDirection = Math.random() > 0.5 ? 1 : -1
      // 꽃잎 이미지 인덱스 재설정 (3개 이미지만 사용)
      petal.petalIndex = petalImages[Math.floor(Math.random() * petalImages.length)]
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden" />
}

