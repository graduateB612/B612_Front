"use client"

/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

// 컴포넌트 인터페이스 추가
interface TrainSectionProps {
  isActive?: boolean
}

export default function TrainSection({ isActive = true }: TrainSectionProps) {
  // 슬라이드 텍스트 깜빡임 상태
  const [slideTextVisible, setSlideTextVisible] = useState(true)

  // 기차 이동 관련 상태
  const [trainOffset, setTrainOffset] = useState(0)
  const [trainPassedScreen, setTrainPassedScreen] = useState(false)

  // 부드러운 전환을 위한 상태
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 열차가 완전히 보이는 기준 오프셋
  const FULL_TRAIN_OFFSET = 750
  // 열차가 화면을 통과한 기준 오프셋 (마지막 객차의 절반이 화면에 남도록)
  // 전체 기차 길이 1925px에서 마지막칸 절반(250px) 정도 남기기
  const TRAIN_PASSED_OFFSET = 2275

  // 슬라이드 텍스트 깜빡임 효과
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setSlideTextVisible((prev) => !prev)
    }, 600) // 0.6초마다 깜빡임

    return () => clearInterval(blinkInterval)
  }, [])

  // 이징 함수 (부드러운 가속/감속)
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  // 부드러운 전환 함수
  const smoothTransition = (targetOffset: number, duration = 5000) => {
    // 이미 전환 중이면 무시
    if (isTransitioning) return

    setIsTransitioning(true)
    const startOffset = trainOffset
    const distance = targetOffset - startOffset
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / duration, 1)
      const easedProgress = easeInOutCubic(progress)
      const newOffset = startOffset + distance * easedProgress

      setTrainOffset(newOffset)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsTransitioning(false)
        // 애니메이션 완료 후 상태 업데이트
        setTrainPassedScreen(newOffset >= TRAIN_PASSED_OFFSET)
      }
    }

    requestAnimationFrame(animate)
  }

  // 기관차 클릭 핸들러
  const handleTrainClick = () => {
    if (isTransitioning || trainOffset >= TRAIN_PASSED_OFFSET) return
    smoothTransition(TRAIN_PASSED_OFFSET)
  }

  // 열차가 화면에 나타나기 시작했는지 확인
  const trainStartedMoving = trainOffset > 0
  
  // 배경 전환 상태
  const [backgroundOpacity, setBackgroundOpacity] = useState(0)
  const [isSectionVisible, setIsSectionVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  
  // 섹션 가시성 추적
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  // 열차 움직임에 따른 배경 전환 효과
  useEffect(() => {
    if (trainStartedMoving && isSectionVisible) {
      // 열차가 움직이기 시작하면 배경을 더 빠르게 나타나게 함
      const maxOffset = TRAIN_PASSED_OFFSET
      const progress = Math.min(trainOffset / (maxOffset * 0.3), 1) // 30% 지점에서 완전히 전환
      setBackgroundOpacity(progress)
    } else {
      setBackgroundOpacity(0)
    }
  }, [trainOffset, trainStartedMoving, isSectionVisible])

  return (
    <div ref={sectionRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* train_background.png 배경 - 열차 움직임에 따라 점차 나타남 */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen z-[2] transition-opacity duration-500 ease-in-out"
        style={{ opacity: backgroundOpacity }}
      >
        <Image
          src="/image/train_background.png"
          alt="Train background"
          fill
          style={{ 
            objectPosition: 'center',
            objectFit: 'cover',
          }}
          priority
        />
      </div>
      
      {/* 메인 컨테이너 */}
      <div className="relative w-full h-full flex flex-col items-center justify-center select-none z-10">
        {/* 슬라이드 텍스트 - 열차가 움직이기 전까지만 표시 */}
        {!trainStartedMoving && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <div
              className="text-4xl text-white transition-opacity duration-600"
              style={{ opacity: slideTextVisible ? 1 : 0 }}
            >
              Click !
            </div>

            {/* 진행 상태 표시 바 - 단순 이미지 */}
            <div className="mt-4 relative">
              <div className="w-64 h-0.5 bg-white"></div>
              <div className="absolute w-3 h-3 bg-white rounded-full" style={{ left: "0", top: "-4px" }}></div>
            </div>
          </div>
        )}

        {/* 열차 컨테이너 */}
        <div className="relative w-full flex flex-col items-center justify-center" style={{ marginTop: '260px' }}>
          {/* 열차 이미지 컨테이너 */}
          <div
            className="relative cursor-pointer hover:brightness-110 transition-all duration-200"
            style={{
              transform: `translateX(${-trainOffset}px)`,
              marginLeft: "calc(120%)", // 기차 앞부분이 더 보이도록 140%로 조정
              transition: isTransitioning ? 'none' : 'transform 0.1s ease-out',
              width: "2225px",
              height: "350px"
            }}
            onClick={handleTrainClick}
          >
            {/* 합쳐진 기차 이미지 */}
            <Image
              src="/image/train.png"
              alt="별빛 기차"
              fill
              className="pixelated object-contain"
              style={{ imageRendering: "pixelated", pointerEvents: "none" }}
              draggable={false}
            />
          </div>
        </div>

        {/* 하단 텍스트 영역 - 열차가 화면을 통과했을 때만 표시 */}
        {trainPassedScreen && isActive && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 pointer-events-none"
            style={{
              opacity: trainPassedScreen ? 1 : 0,
              zIndex: 20,
            }}
          >
            <div className="flex flex-col items-center max-w-3xl px-4">
              <h2 className="text-4xl font-bold text-white mb-4">별빛 기차</h2>
              <div className="bg-gray-200 bg-opacity-80 p-6 rounded-lg w-full">
                <p className="text-black text-xl text-center">
                  우주의 별들 사이를 여행하는 신비로운 기차입니다. 이 기차는 꿈과 희망을 실어 나르며, 승객들을 다양한
                  행성과 별들로 안내합니다. 어린 왕자와 그의 친구들이 자주 이용하는 특별한 교통수단입니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
