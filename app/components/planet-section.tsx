"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

// 행성 인터페이스 정의
interface Planet {
  id: number
  name: string
  image: string
  description: string
  width: number
  height: number
  centerScale: number // 중앙에 있을 때의 스케일
  sideScale: number // 양쪽에 있을 때의 스케일
}

// 컴포넌트 프롭스 인터페이스
interface PlanetSectionProps {
  isActive?: boolean
}

export default function PlanetSection({ isActive = true }: PlanetSectionProps) {
  // 현재 선택된 행성 인덱스
  const [currentPlanet, setCurrentPlanet] = useState(0)

  // 이전 행성 인덱스 (애니메이션 처리용)
  const [previousPlanet, setPreviousPlanet] = useState(0)

  // 애니메이션 진행 상태 (0~1)
  const [animationProgress, setAnimationProgress] = useState(1)

  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)

  // 애니메이션 상태
  const [isAnimating, setIsAnimating] = useState(false)

  // 애니메이션 타이머 참조
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 컨테이너 참조
  const containerRef = useRef<HTMLDivElement>(null)

  // 행성 데이터 - 이미지 크기 및 스케일 추가
  const planets: Planet[] = [
    {
      id: 1,
      name: "아쿠아 행성",
      image: "/image/planets/planet_1.png",
      description:
        "물이 풍부한 이 행성은 깊은 바다와 신비로운 해양 생물들로 가득합니다. 푸른빛 표면 아래에는 수정처럼 빛나는 도시들이 숨겨져 있습니다.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
    {
      id: 2,
      name: "테라코타 행성",
      image: "/image/planets/planet_2.png",
      description:
        "붉은 사막과 거대한 협곡이 특징인 이 행성은 고대 문명의 흔적이 남아있습니다. 밤이 되면 두 개의 달이 붉은 모래 위에 신비로운 그림자를 드리웁니다.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
    {
      id: 3,
      name: "라벤더 행성",
      image: "/image/planets/planet_3.png",
      description:
        "보라색 안개로 둘러싸인 이 행성은 향기로운 꽃들과 부드러운 언덕이 특징입니다. 주민들은 꿈과 예술을 중요시하며 평화롭게 살아갑니다.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
    {
      id: 4,
      name: "가이아 행성",
      image: "/image/planets/planet_4.png",
      description:
        "푸른 하늘과 넓은 초원이 펼쳐진 이 행성은 다양한 생태계가 공존합니다. 거대한 나무들이 행성 전체에 산소를 공급하며 생명을 유지합니다.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
    {
      id: 5,
      name: "에메랄드 행성",
      image: "/image/planets/planet_5.png",
      description:
        "녹색 결정으로 뒤덮인 이 행성은 빛을 반사하여 우주에서도 보일 정도로 밝게 빛납니다. 행성 내부에는 귀중한 에너지원이 풍부하게 매장되어 있습니다.",
      width: 256,
      height: 256,
      centerScale: 1.8, // 중앙에서 스케일
      sideScale: 0.8, // 측면에서 스케일
    },
    {
      id: 6,
      name: "클라우드 행성",
      image: "/image/planets/planet_6.png",
      description:
        "항상 구름으로 덮여 있는 이 행성은 공중에 떠 있는 섬들이 특징입니다. 주민들은 구름 사이를 날아다니며 바람의 흐름을 타고 여행합니다.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
    {
      id: 7,
      name: "솔라리스 행성",
      image: "/image/planets/planet_7.png",
      description:
        "태양과 가까이 있어 항상 뜨거운 이 행성은 불꽃 같은 지형이 특징입니다. 주민들은 열을 에너지로 변환하는 특별한 능력을 가지고 있습니다.",
      width: 64,
      height: 64,
      centerScale: 3.5, // 작은 행성이므로 더 크게 스케일링
      sideScale: 1.2,
    },
    {
      id: 8,
      name: "오리온 행성",
      image: "/image/planets/planet_8.png",
      description:
        "황금빛 사막과 고대 유적이 특징인 이 행성은 밤하늘의 별자리를 연구하는 천문학자들의 성지입니다. 모래 아래에는 잊혀진 문명의 비밀이 숨겨져 있습니다.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
  ]

  // 행성 이동 함수 - 순환 구조로 수정
  const goToPlanet = (index: number) => {
    if (isAnimating) return

    // 인덱스가 범위를 벗어나면 순환하도록 처리
    let targetIndex = index
    if (targetIndex < 0) {
      targetIndex = planets.length - 1
    } else if (targetIndex >= planets.length) {
      targetIndex = 0
    }

    if (targetIndex === currentPlanet) return

    // 애니메이션 시작
    setIsAnimating(true)
    setPreviousPlanet(currentPlanet)
    setCurrentPlanet(targetIndex)
    setAnimationProgress(0)

    // 애니메이션 진행
    const animationDuration = 1200 // 1.2초
    const startTime = Date.now()

    // 이전 타이머 정리
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current)
    }

    // 애니메이션 타이머 설정
    animationTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      setAnimationProgress(progress)

      if (progress >= 1) {
        // 애니메이션 완료
        setIsAnimating(false)
        if (animationTimerRef.current) {
          clearInterval(animationTimerRef.current)
          animationTimerRef.current = null
        }
      }
    }, 16) // 약 60fps
  }

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current)
      }
    }
  }, [])

  // 다음 행성으로 이동 - 순환 구조로 수정
  const nextPlanet = () => {
    goToPlanet(currentPlanet + 1)
  }

  // 이전 행성으로 이동 - 순환 구조로 수정
  const prevPlanet = () => {
    goToPlanet(currentPlanet - 1)
  }

  // 마우스/터치 이벤트 핸들러
  const handleDragStart = (clientX: number) => {
    if (isAnimating) return
    setIsDragging(true)
    setStartX(clientX)
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging || isAnimating) return

    const deltaX = clientX - startX
    setTranslateX(deltaX)
  }

  const handleDragEnd = () => {
    if (!isDragging || isAnimating) return

    setIsDragging(false)

    // 드래그 거리에 따라 다음/이전 행성으로 이동 - 순환 구조로 수정
    if (Math.abs(translateX) > 100) {
      if (translateX > 0) {
        prevPlanet()
      } else if (translateX < 0) {
        nextPlanet()
      }
    }

    setTranslateX(0)
  }

  // 마우스 이벤트
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragMove(e.clientX)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragEnd()
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    if (isDragging) {
      handleDragEnd()
    }
  }

  // 터치 이벤트
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragMove(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragEnd()
  }

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return

      if (e.key === "ArrowRight") {
        nextPlanet()
      } else if (e.key === "ArrowLeft") {
        prevPlanet()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isActive, currentPlanet])

  // 행성 인덱스 계산 함수 (순환 구조)
  const getModularIndex = (index: number) => {
    const totalPlanets = planets.length
    return ((index % totalPlanets) + totalPlanets) % totalPlanets
  }

  // 행성의 애니메이션 스타일 결정 함수
  const getPlanetAnimationStyle = (distance: number) => {
    if (distance === 0) {
      // 중앙 행성 - 원래 애니메이션
      return "float 6s ease-in-out infinite"
    } else if (
      distance === -1 ||
      distance === 1 ||
      distance === planets.length - 1 ||
      distance === -(planets.length - 1)
    ) {
      // 양쪽 행성 - 작은 애니메이션
      return "float-small 8s ease-in-out infinite"
    }
    return "none"
  }

  // 행성 크기 조정 함수 (에메랄드 행성 특별 처리)
  const getPlanetContainerStyle = (planet: Planet, distance: number) => {
    // 기본 스타일
    const baseStyle = {
      width: planet.width,
      height: planet.height,
      position: "relative" as const,
    }

    // 에메랄드 행성(id: 5)인 경우 특별 처리
    if (planet.id === 5) {
      if (distance === 0) {
        // 중앙에 있을 때 크기 조정
        return {
          ...baseStyle,
          width: 550, // 더 큰 컨테이너
          height: 550, // 더 큰 컨테이너
        }
      } else if (
        distance === -1 ||
        distance === 1 ||
        distance === planets.length - 1 ||
        distance === -(planets.length - 1)
      ) {
        // 양쪽에 있을 때 크기 조정
        return {
          ...baseStyle,
          width: 400, // 측면에서도 큰 컨테이너
          height: 400, // 측면에서도 큰 컨테이너
        }
      }
    }

    return baseStyle
  }

  // 행성 이미지 스타일 조정 함수
  const getPlanetImageStyle = (planet: Planet, distance: number) => {
    // 기본 스타일
    const baseStyle = {
      imageRendering: "pixelated" as const,
      animation: getPlanetAnimationStyle(distance),
      objectFit: "contain" as const,
      userSelect: "none" as const, // 이미지 선택 방지
      pointerEvents: "none" as const, // 이미지에 대한 포인터 이벤트 방지
      WebkitUserSelect: "none" as const, // Safari용
      WebkitTouchCallout: "none" as const, // iOS Safari용
      MozUserSelect: "none" as const, // Firefox용
    }

    // 에메랄드 행성(id: 5)인 경우 특별 처리
    if (planet.id === 5) {
      return {
        ...baseStyle,
        objectFit: "contain" as const, // 이미지가 잘리지 않도록 contain 사용
        padding: "20%", // 패딩 증가
      }
    }

    return baseStyle
  }

  // 행성 스케일 계산 함수 (애니메이션 진행에 따라 보간)
  const getPlanetScale = (planet: Planet, index: number) => {
    // 현재 행성과의 거리 계산 (순환 구조)
    const rawDistance = index - currentPlanet
    const distance =
      Math.abs(rawDistance) <= planets.length / 2
        ? rawDistance
        : rawDistance > 0
          ? rawDistance - planets.length
          : rawDistance + planets.length

    // 이전 행성과의 거리 계산 (순환 구조)
    const rawPrevDistance = index - previousPlanet
    const prevDistance =
      Math.abs(rawPrevDistance) <= planets.length / 2
        ? rawPrevDistance
        : rawPrevDistance > 0
          ? rawPrevDistance - planets.length
          : rawPrevDistance + planets.length

    // 현재 위치에서의 스케일 계산
    const getCurrentScale = (dist: number) => {
      if (dist === 0) {
        // 중앙 행성
        return planet.centerScale
      } else if (dist === -1 || dist === 1 || dist === planets.length - 1 || dist === -(planets.length - 1)) {
        // 양쪽 행성
        if (planet.id === 7) {
          return 0.6 // 솔라리스 행성은 더 작게
        } else if (planet.id === 5) {
          return 0.8 // 에메랄드 행성은 측면에서 작게
        } else {
          return 0.9 // 일반 행성
        }
      } else {
        // 나머지 행성
        return 0.4
      }
    }

    // 이전 스케일과 현재 스케일 계산
    const prevScale = getCurrentScale(prevDistance)
    const targetScale = getCurrentScale(distance)

    // 애니메이션 중이면 스케일 보간, 아니면 타겟 스케일 바로 적용
    if (isAnimating) {
      // 에메랄드 행성의 경우 특별 처리
      if (planet.id === 5) {
        // 이징 함수 적용 (cubic-bezier)
        const easeProgress = cubicBezier(0.4, 0, 0.2, 1, animationProgress)
        return prevScale + (targetScale - prevScale) * easeProgress
      }

      // 일반 행성은 선형 보간
      return prevScale + (targetScale - prevScale) * animationProgress
    }

    return targetScale
  }

  // 행성 위치 계산 함수 (애니메이션 진행에 따라 보간)
  const getPlanetPosition = (planet: Planet, index: number) => {
    // 현재 행성과의 거리 계산 (순환 구조)
    const rawDistance = index - currentPlanet
    const distance =
      Math.abs(rawDistance) <= planets.length / 2
        ? rawDistance
        : rawDistance > 0
          ? rawDistance - planets.length
          : rawDistance + planets.length

    // 이전 행성과의 거리 계산 (순환 구조)
    const rawPrevDistance = index - previousPlanet
    const prevDistance =
      Math.abs(rawPrevDistance) <= planets.length / 2
        ? rawPrevDistance
        : rawPrevDistance > 0
          ? rawPrevDistance - planets.length
          : rawPrevDistance + planets.length

    // 현재 위치에서의 X 위치 계산
    const getCurrentX = (dist: number) => {
      if (dist === 0) {
        // 중앙 행성
        return 0
      } else if (dist === -1 || dist === planets.length - 1) {
        // 이전 행성 (왼쪽)
        return planet.id === 5 ? -650 : -550
      } else if (dist === 1 || dist === -(planets.length - 1)) {
        // 다음 행성 (오른쪽)
        return planet.id === 5 ? 650 : 550
      } else {
        // 나머지 행성
        return dist * 1000
      }
    }

    // 이전 위치와 현재 위치 계산
    const prevX = getCurrentX(prevDistance)
    const targetX = getCurrentX(distance)

    // 애니메이션 중이면 위치 보간, 아니면 타겟 위치 바로 적용
    if (isAnimating) {
      // 에메랄드 행성의 경우 특별 처리
      if (planet.id === 5) {
        // 이징 함수 적용 (cubic-bezier)
        const easeProgress = cubicBezier(0.4, 0, 0.2, 1, animationProgress)
        return prevX + (targetX - prevX) * easeProgress
      }

      // 일반 행성은 선형 보간
      return prevX + (targetX - prevX) * animationProgress
    }

    return targetX
  }

  // 행성 불투명도 계산 함수 (애니메이션 진행에 따라 보간)
  const getPlanetOpacity = (planet: Planet, index: number) => {
    // 현재 행성과의 거리 계산 (순환 구조)
    const rawDistance = index - currentPlanet
    const distance =
      Math.abs(rawDistance) <= planets.length / 2
        ? rawDistance
        : rawDistance > 0
          ? rawDistance - planets.length
          : rawDistance + planets.length

    // 이전 행성과의 거리 계산 (순환 구조)
    const rawPrevDistance = index - previousPlanet
    const prevDistance =
      Math.abs(rawPrevDistance) <= planets.length / 2
        ? rawPrevDistance
        : rawPrevDistance > 0
          ? rawPrevDistance - planets.length
          : rawPrevDistance + planets.length

    // 현재 위치에서의 불투명도 계산
    const getCurrentOpacity = (dist: number) => {
      if (dist === 0) {
        // 중앙 행성
        return 1
      } else if (dist === -1 || dist === 1 || dist === planets.length - 1 || dist === -(planets.length - 1)) {
        // 양쪽 행성
        return 0.6
      } else {
        // 나머지 행성
        return 0
      }
    }

    // 이전 불투명도와 현재 불투명도 계산
    const prevOpacity = getCurrentOpacity(prevDistance)
    const targetOpacity = getCurrentOpacity(distance)

    // 애니메이션 중이면 불투명도 보간, 아니면 타겟 불투명도 바로 적용
    if (isAnimating) {
      return prevOpacity + (targetOpacity - prevOpacity) * animationProgress
    }

    return targetOpacity
  }

  // 행성 z-index 계산 함수
  const getPlanetZIndex = (planet: Planet, index: number) => {
    // 현재 행성과의 거리 계산 (순환 구조)
    const rawDistance = index - currentPlanet
    const distance =
      Math.abs(rawDistance) <= planets.length / 2
        ? rawDistance
        : rawDistance > 0
          ? rawDistance - planets.length
          : rawDistance + planets.length

    if (distance === 0) {
      // 중앙 행성
      return 10
    } else if (
      distance === -1 ||
      distance === 1 ||
      distance === planets.length - 1 ||
      distance === -(planets.length - 1)
    ) {
      // 양쪽 행성
      return 5
    } else {
      // 나머지 행성
      return 1
    }
  }

  // 큐빅 베지어 이징 함수 (애니메이션 부드럽게)
  const cubicBezier = (x1: number, y1: number, x2: number, y2: number, t: number) => {
    // 베지어 곡선 계산 (3차)
    const cx = 3 * x1
    const bx = 3 * (x2 - x1) - cx
    const ax = 1 - cx - bx
    const cy = 3 * y1
    const by = 3 * (y2 - y1) - cy
    const ay = 1 - cy - by

    // t에 대한 x 값 계산
    const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t

    // x에 대한 t 값 계산 (뉴턴 라프슨 방법)
    const solveCurveX = (x: number, epsilon = 1e-6) => {
      const t0 = 0
      const t1 = 1
      let t2 = x

      if (x <= 0) return 0
      if (x >= 1) return 1

      // 초기 추측값
      let x2 = sampleCurveX(t2)

      // 뉴턴 라프슨 반복
      for (let i = 0; i < 8; i++) {
        const d2 = (ax * 3 * t2 + bx * 2) * t2 + cx // 미분값
        if (Math.abs(d2) < epsilon) break

        t2 = t2 - (x2 - x) / d2
        x2 = sampleCurveX(t2)
      }

      return t2
    }

    // t에 대한 y 값 계산
    const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t

    // x에 대한 y 값 계산
    return sampleCurveY(solveCurveX(t))
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* 행성 갤러리 */}
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl h-[90vh] flex items-center justify-center select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          touchAction: "none",
        }}
      >
        {/* 행성들 */}
        <div className="relative w-full h-full flex items-center justify-center z-10">
          {planets.map((planet, index) => {
            // 행성이 화면 밖으로 너무 멀리 벗어나면 렌더링하지 않음
            const rawDistance = index - currentPlanet
            const distance =
              Math.abs(rawDistance) <= planets.length / 2
                ? rawDistance
                : rawDistance > 0
                  ? rawDistance - planets.length
                  : rawDistance + planets.length

            if (Math.abs(distance) > 3 && Math.abs(distance) < planets.length - 3) return null

            // 행성 위치, 스케일, 불투명도 계산
            const positionX = getPlanetPosition(planet, index)
            const scale = getPlanetScale(planet, index)
            const opacity = getPlanetOpacity(planet, index)
            const zIndex = getPlanetZIndex(planet, index)

            // 드래그 중일 때 추가 이동 거리
            const dragOffset = isDragging ? translateX * 0.5 : 0

            return (
              <div
                key={planet.id}
                className="absolute cursor-pointer select-none"
                style={{
                  transform: `translateX(${positionX + dragOffset}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition: isAnimating
                    ? "none"
                    : "transform 1200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1)",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                }}
                onClick={(e) => {
                  e.preventDefault()
                  goToPlanet(index)
                }}
                onDragStart={(e) => e.preventDefault()} // 드래그 시작 방지
              >
                <div className="relative select-none" style={getPlanetContainerStyle(planet, distance)}>
                  <Image
                    src={planet.image || "/placeholder.svg"}
                    alt={planet.name}
                    fill
                    className="pixelated object-contain select-none"
                    style={getPlanetImageStyle(planet, distance)}
                    priority={distance === 0} // 중앙 행성은 우선 로딩
                    draggable={false} // 이미지 드래그 방지
                    onDragStart={(e) => e.preventDefault()} // 이미지 드래그 시작 방지
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 페이지 인디케이터 */}
      <div className="flex space-x-4 mt-8 z-20 px-8 mb-4 w-full justify-center">
        {planets.map((planet, index) => (
          <button
            key={planet.id}
            className={`w-4 h-4 rounded-full transition-all ${
              index === currentPlanet ? "bg-blue-400 scale-125" : "bg-blue-200 opacity-50"
            }`}
            onClick={() => goToPlanet(index)}
            aria-label={`Go to planet ${planet.name}`}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(2deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        
        @keyframes float-small {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(1deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        
        /* 전역 선택 방지 스타일 */
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* 이미지 드래그 방지 */
        img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }
      `}</style>
    </div>
  )
}
