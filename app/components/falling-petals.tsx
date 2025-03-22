"use client"

import { useEffect, useRef } from "react"

interface Petal {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  verticalSpeed: number // 수직 속도
  horizontalSpeed: number // 수평 속도 (추가)
  horizontalDirection: number // 수평 방향 (추가)
  swingSpeed: number
  swingAmount: number
  delay: number
  petalIndex: number
  rotationSpeed: number
  rotationDirection: number
  maxRotation: number
  baseRotation: number
  windInfluence: number // 바람 영향도 (추가)
  turbulence: number // 난류 정도 (추가)
}

export function FallingPetals() {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const petalsRef = useRef<Petal[]>([])
  const petalElements = useRef<HTMLDivElement[]>([])
  const petalCount = 25
  const windDirectionRef = useRef(Math.random() > 0.5 ? 1 : -1) // 전체 바람 방향

  useEffect(() => {
    if (!containerRef.current) return

    // 초기 꽃잎 데이터 생성 - 더 자연스러운 움직임을 위한 속성 추가
    petalsRef.current = Array.from({ length: petalCount }, (_, i) => {
      const baseRotation = Math.random() * 360
      
      return {
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: baseRotation,
        scale: 0.5 + Math.random() * 0.5,
        verticalSpeed: 0.5 + Math.random() * 1, // 수직 속도
        horizontalSpeed: 0.3 + Math.random() * 0.7, // 수평 속도 (0.3-1.0)
        horizontalDirection: Math.random() > 0.5 ? 1 : -1, // 수평 방향 (좌/우)
        swingSpeed: 0.1 + Math.random() * 0.2,
        swingAmount: 0.5 + Math.random() * 1.5,
        delay: Math.random() * 10,
        petalIndex: Math.floor(Math.random() * 6) + 1,
        rotationSpeed: 1 + Math.random() * 1.5,
        rotationDirection: Math.random() > 0.5 ? 1 : -1,
        maxRotation: 10 + Math.random() * 15,
        baseRotation: baseRotation,
        windInfluence: 0.5 + Math.random() * 0.5, // 바람 영향도 (0.5-1.0)
        turbulence: 0.2 + Math.random() * 0.4, // 난류 정도 (0.2-0.6)
      }
    })

    // 꽃잎 요소 생성
    const container = containerRef.current
    container.innerHTML = ''
    petalElements.current = []

    petalsRef.current.forEach(petal => {
      const petalElement = document.createElement('div')
      petalElement.className = 'absolute'
      petalElement.style.left = `${petal.x}%`
      petalElement.style.top = `${petal.y}%`
      petalElement.style.transform = `rotate(${petal.rotation}deg) scale(${petal.scale})`
      petalElement.style.transition = 'transform 0.1s linear'
      petalElement.style.opacity = '0.8'
      petalElement.style.willChange = 'transform'
      
      const img = document.createElement('img')
      img.src = `/image/rose_reaf_${petal.petalIndex}.png`
      img.alt = 'Rose petal'
      img.width = 24
      img.height = 24
      img.style.width = '24px'
      img.style.height = '24px'
      
      petalElement.appendChild(img)
      container.appendChild(petalElement)
      petalElements.current.push(petalElement)
    })

    let lastTime = 0
    let globalTime = 0

    // 애니메이션 함수 - 더 자연스러운 움직임 구현
    const animate = (time: number) => {
      if (!lastTime) lastTime = time
      const deltaTime = (time - lastTime) / 1000
      lastTime = time
      globalTime += deltaTime

      // 전체 바람 효과 - 시간에 따라 천천히 변화
      const globalWind = Math.sin(globalTime * 0.2) * 0.5 * windDirectionRef.current
      
      // 난류 효과 - 더 불규칙한 움직임을 위한 노이즈
      const turbulence = Math.sin(globalTime * 0.7) * Math.cos(globalTime * 0.4) * 0.3

      petalsRef.current.forEach((petal, index) => {
        const petalElement = petalElements.current[index]
        if (!petalElement) return

        if (petal.delay > 0) {
          petal.delay -= deltaTime
          return
        }

        // 수직 위치 업데이트
        petal.y += petal.verticalSpeed * deltaTime * 20
        
        // 수평 위치 업데이트 - 여러 요소 결합
        // 1. 기본 수평 이동 (일정한 방향)
        const baseHorizontalMovement = petal.horizontalSpeed * petal.horizontalDirection * deltaTime * 3
        
        // 2. 진자 운동 (사인 함수)
        const swingMovement = Math.sin(time * 0.001 * petal.swingSpeed) * petal.swingAmount * deltaTime
        
        // 3. 전체 바람 효과 (모든 꽃잎에 영향)
        const windEffect = globalWind * petal.windInfluence * deltaTime * 5
        
        // 4. 난류 효과 (불규칙한 움직임)
        const turbulenceEffect = turbulence * petal.turbulence * deltaTime * 5
        
        // 모든 수평 움직임 요소 결합
        petal.x += baseHorizontalMovement + swingMovement + windEffect + turbulenceEffect
        
        // 회전 업데이트
        const rotationOffset = Math.sin(time * 0.001 * petal.rotationSpeed) * petal.maxRotation * petal.rotationDirection
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

    // 꽃잎 재설정 함수
    function resetPetal(petal: Petal) {
      petal.x = Math.random() * 100
      petal.y = -10 - Math.random() * 10
      petal.baseRotation = Math.random() * 360
      petal.rotation = petal.baseRotation
      petal.verticalSpeed = 0.5 + Math.random() * 1
      petal.horizontalSpeed = 0.3 + Math.random() * 0.7
      petal.horizontalDirection = Math.random() > 0.5 ? 1 : -1
      
      // 가끔 바람 방향 변경 (10% 확률)
      if (Math.random() < 0.1) {
        windDirectionRef.current = -windDirectionRef.current
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none overflow-hidden"
    />
  )
}