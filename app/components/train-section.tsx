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

  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [trainPassedScreen, setTrainPassedScreen] = useState(false)

  // 부드러운 전환을 위한 상태
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 이전 드래그 위치를 저장하기 위한 ref
  const lastOffsetRef = useRef(0)

  // 열차가 완전히 보이는 기준 오프셋
  const FULL_TRAIN_OFFSET = 750
  // 열차가 화면을 통과한 기준 오프셋 (마지막 객차의 중간이 왼쪽 끝에 닿을 때)
  // 기관차(500px) + 객차1(475px) + 객차2(475px) + 객차3(475px) + 객차4(500px) = 약 3000px
  const TRAIN_PASSED_OFFSET = 3200
  // 드래그 감도 (낮은 값으로 설정)
  const DRAG_SENSITIVITY = 1.0

  // 슬라이드 텍스트 깜빡임 효과
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setSlideTextVisible((prev) => !prev)
    }, 600) // 0.6초마다 깜빡임

    return () => clearInterval(blinkInterval)
  }, [])

  // 드래그 시작 핸들러 - 이전 위치 고려
  const handleDragStart = (clientX: number) => {
    if (isTransitioning) return
    setIsDragging(true)
    setDragStartX(clientX)
    // 현재 드래그 오프셋을 ref에 저장
    lastOffsetRef.current = dragOffset
  }

  // 드래그 중 핸들러 - 이전 위치에서 계속
  const handleDrag = (clientX: number) => {
    if (!isDragging || isTransitioning) return

    // 드래그 거리 계산
    const dragDistance = dragStartX - clientX

    // 이전 위치에 현재 드래그 거리를 더함
    const newOffset = Math.max(
      0,
      Math.min(TRAIN_PASSED_OFFSET, lastOffsetRef.current + dragDistance * DRAG_SENSITIVITY),
    )

    // 부드럽게 상태 업데이트
    setDragOffset(newOffset)

    // 열차가 화면을 통과했는지 확인 (마지막 객차의 중간이 왼쪽 끝에 닿을 때)
    setTrainPassedScreen(newOffset >= TRAIN_PASSED_OFFSET) // 정확히 마지막 객차의 중간이 왼쪽 끝에 닿을 때 통과로 간주
  }

  // 드래그 종료 핸들러
  const handleDragEnd = () => {
    if (!isDragging || isTransitioning) return
    setIsDragging(false)
    // 드래그 종료 시 현재 위치 유지
  }

  // 이징 함수 (부드러운 가속/감속)
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  // 부드러운 전환 함수
  const smoothTransition = (targetOffset: number, duration = 500) => {
    // 이미 전환 중이면 무시
    if (isTransitioning) return

    setIsTransitioning(true)
    const startOffset = dragOffset
    const distance = targetOffset - startOffset
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / duration, 1)
      const easedProgress = easeInOutCubic(progress)
      const newOffset = startOffset + distance * easedProgress

      setDragOffset(newOffset)

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

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault() // 기본 동작 방지
    // 이미 드래그 중이거나 전환 중이면 무시
    if (isDragging || isTransitioning) return
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault() // 기본 동작 방지
      handleDrag(e.clientX)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault() // 기본 동작 방지
      handleDragEnd()
    }
  }

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    // 이미 드래그 중이거나 전환 중이면 무시
    if (isDragging || isTransitioning) return
    handleDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleDrag(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  // 열차가 화면에 나타나기 시작했는지 확인
  const trainStartedMoving = dragOffset > 0

  // 섹션이 비활성화될 때 상태 초기화를 위한 useEffect 추가
  useEffect(() => {
    if (!isActive) {
      // 다른 섹션으로 이동했을 때는 텍스트 상태를 변경하지 않음
      // 열차 위치는 그대로 유지
    } else {
      // 트레인 섹션으로 돌아왔을 때 열차 위치에 따라 텍스트 표시 상태 업데이트
      setTrainPassedScreen(dragOffset >= TRAIN_PASSED_OFFSET)
    }
  }, [isActive, dragOffset, TRAIN_PASSED_OFFSET])

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* 드래그 영역 */}
      <div
        className="relative w-full h-full flex flex-col items-center justify-center select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 슬라이드 텍스트 - 열차가 움직이기 전까지만 표시 */}
        {!trainStartedMoving && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <div
              className="text-4xl text-white transition-opacity duration-600"
              style={{ opacity: slideTextVisible ? 1 : 0 }}
            >
              Slide !
            </div>

            {/* 진행 상태 표시 바 - 단순 이미지 */}
            <div className="mt-4 relative">
              <div className="w-64 h-0.5 bg-white"></div>
              <div className="absolute w-3 h-3 bg-white rounded-full" style={{ left: "0", top: "-4px" }}></div>
            </div>
          </div>
        )}

        {/* 열차 컨테이너 */}
        <div className="relative w-full flex flex-col items-center justify-center">
          {/* 열차 이미지 컨테이너 */}
          <div
            className={`flex items-center ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
            style={{
              transform: `translateX(${-dragOffset}px)`,
              marginLeft: "calc(160%)", // 사용자 요청대로 160%로 설정
              cursor: isDragging ? "grabbing" : "grab", // 드래그 중일 때 커서 변경
            }}
          >
            {/* 기관차 (train_1) */}
            <div className="relative" style={{ width: "500px", height: "250px" }}>
              <Image
                src="/image/train_1.png"
                alt="별빛 기차 기관차"
                fill
                className="pixelated object-contain"
                style={{ imageRendering: "pixelated", pointerEvents: "none" }}
                draggable={false}
              />
            </div>

            {/* 객차 1 (train_2) */}
            <div className="relative" style={{ width: "500px", height: "250px", marginLeft: "-25px" }}>
              <Image
                src="/image/train_2.png"
                alt="별빛 기차 객차 1"
                fill
                className="pixelated object-contain"
                style={{ imageRendering: "pixelated", pointerEvents: "none" }}
                draggable={false}
              />
            </div>

            {/* 객차 2 (train_3) */}
            <div className="relative" style={{ width: "500px", height: "250px", marginLeft: "-25px" }}>
              <Image
                src="/image/train_3.png"
                alt="별빛 기차 객차 2"
                fill
                className="pixelated object-contain"
                style={{ imageRendering: "pixelated", pointerEvents: "none" }}
                draggable={false}
              />
            </div>

            {/* 객차 3 (train_4) */}
            <div className="relative" style={{ width: "500px", height: "250px", marginLeft: "-25px" }}>
              <Image
                src="/image/train_4.png"
                alt="별빛 기차 객차 3"
                fill
                className="pixelated object-contain"
                style={{ imageRendering: "pixelated", pointerEvents: "none" }}
                draggable={false}
              />
            </div>
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
