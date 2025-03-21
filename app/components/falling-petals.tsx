"use client"

import { useEffect, useRef } from "react"

interface Petal {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  speed: number
  swingSpeed: number
  swingAmount: number
  delay: number
  petalIndex: number
}

export function FallingPetals() {
  // DOM 요소를 직접 조작하기 위한 ref
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const petalsRef = useRef<Petal[]>([])
  const petalElements = useRef<HTMLDivElement[]>([])
  const petalCount = 25 // 표시할 꽃잎 수

  // 컴포넌트 마운트 시 꽃잎 초기화 및 애니메이션 시작
  useEffect(() => {
    if (!containerRef.current) return

    // 초기 꽃잎 데이터 생성
    petalsRef.current = Array.from({ length: petalCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      speed: 0.5 + Math.random() * 1,
      swingSpeed: 0.2 + Math.random() * 0.3,
      swingAmount: 2 + Math.random() * 4,
      delay: Math.random() * 10,
      petalIndex: Math.floor(Math.random() * 6) + 1,
    }))

    // 꽃잎 요소 생성
    const container = containerRef.current
    container.innerHTML = '' // 기존 요소 제거
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
      
      // 이미지 요소 생성
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

    // 애니메이션 함수
    const animate = (time: number) => {
      if (!lastTime) lastTime = time
      const deltaTime = (time - lastTime) / 1000
      lastTime = time

      petalsRef.current.forEach((petal, index) => {
        const petalElement = petalElements.current[index]
        if (!petalElement) return

        // 딜레이 처리
        if (petal.delay > 0) {
          petal.delay -= deltaTime
          return
        }

        // 위치 업데이트
        petal.y += petal.speed * deltaTime * 20
        petal.x += Math.sin(time * 0.001 * petal.swingSpeed) * petal.swingAmount * deltaTime
        petal.rotation = (petal.rotation + deltaTime * 20) % 360

        // 화면 밖으로 나가면 다시 위로
        if (petal.y > 110) {
          petal.y = -10
          petal.x = Math.random() * 100
        }

        // DOM 업데이트
        petalElement.style.left = `${petal.x}%`
        petalElement.style.top = `${petal.y}%`
        petalElement.style.transform = `rotate(${petal.rotation}deg) scale(${petal.scale})`
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    // 애니메이션 시작
    animationRef.current = requestAnimationFrame(animate)

    // 정리 함수
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