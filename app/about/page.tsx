"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import HeroSection from "../components/hero-section"
import Header from "../components/header"
import SectionFrame from "../components/section-frame"
import React from "react"

export default function AboutPage() {
  const [cardClicked, setCardClicked] = useState(false)
  const [cardMoving, setCardMoving] = useState(false)
  const [showMapBg, setShowMapBg] = useState(false)
  return (
    <div
      className="snap-y snap-mandatory h-screen overflow-y-auto no-scrollbar relative"
      style={{ scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}
    >
      <style jsx>{`
        @keyframes float-y {
          0%, 100% { transform: translateY(-18px); }
          50% { transform: translateY(18px); }
        }
        .float-y { animation: float-y 4.5s ease-in-out infinite; will-change: transform; }

        @keyframes spin-y {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .spin-y { animation: spin-y 6s linear infinite; will-change: transform; transform-style: preserve-3d; }
        .perspective { perspective: 1000px; }
        .card-face { backface-visibility: hidden; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 3s ease-in-out forwards; }
      `}</style>
      {/* About 전용 전체 화면 배경: 단색 검정 */}
      <div className="fixed inset-0 -z-10 bg-black pointer-events-none"></div>
      <Header />

      {/* 섹션 1: 기존 히어로 */}
      <SectionFrame withPattern={false} transparent>
        <div className="relative">
          <HeroSection noGradient transparent showPattern={false} />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <p className="text-white/70 text-lg md:text-base">ⓒ 2025 Rose company, All rights reserved.</p>
          </div>
        </div>
      </SectionFrame>

      {/* 섹션 2: 레이아웃 + 우측 카드 이미지 배치 */}
      <SectionFrame withPattern={false} transparent className="items-start justify-start">
        <div className="max-w-7xl w-full px-6 pt-10 md:pt-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-start text-white relative">
          {/* 좌측 텍스트 영역 */}
          <AboutSectionTwoTyping cardClicked={cardClicked} />

          {/* 우측 이미지 영역 */}
          <div className="relative w-full flex items-center justify-center" style={{ height: '560px' }}>
            <div 
              className="cursor-pointer absolute"
              style={cardMoving ? {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '480px',
                height: '640px',
                zIndex: 50,
                transition: 'all 1800ms ease-in-out'
              } : {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '320px',
                height: '420px'
              }}
              onClick={() => {
                if (!cardClicked) {
                  setCardClicked(true)
                  setTimeout(() => setCardMoving(true), 3200)
                  setTimeout(() => setShowMapBg(true), 6500)
                }
              }}
            >
              <div className={`relative w-full h-full transition-opacity ${showMapBg ? 'duration-[2000ms] opacity-0' : 'opacity-100'} float-y perspective`}>
                <div className={`relative w-full h-full spin-y`}>
                  <Image
                    src="/image/card.png"
                    alt="rose card"
                    fill
                    className="object-contain z-10 card-face"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* map_bg.png 오버레이 */}
          {showMapBg && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 animate-fadeIn">
              <Image
                src="/image/map_bg.png"
                alt="map background"
                fill
                className="object-cover opacity-90"
                priority
              />
            </div>
          )}
        </div>
        <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 transition-all duration-[1200ms] delay-[2500ms] ease-in-out ${cardClicked ? 'opacity-0 -translate-x-[150%]' : 'opacity-100'}`}>
          <p className="text-white/70 text-lg md:text-base">ⓒ 2025 Rose company, All rights reserved.</p>
        </div>
      </SectionFrame>
    </div>
  )
}

function AboutSectionTwoTyping({ cardClicked }: { cardClicked: boolean }) {
  const line1 = "현재 당신의 삶에"
  const line2a = "어린 왕자와, 장미와,"
  const line2b = "상자 속 양이"
  const line3 = "존재하나요?"
  const [i1, setI1] = useState(0)
  const [i2a, setI2a] = useState(0)
  const [i2b, setI2b] = useState(0)
  const [i3, setI3] = useState(0)
  const [done, setDone] = useState(false)
  const speed = 55
  const [started, setStarted] = useState(false)
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  // 뷰포트 진입 시 한 번만 시작
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (e.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootRef])

  // 타이핑 순차 진행
  useEffect(() => {
    if (!started) return
    if (i1 < line1.length) {
      const t = setTimeout(() => setI1(i1 + 1), speed)
      return () => clearTimeout(t)
    }
  }, [started, i1])

  useEffect(() => {
    if (!started) return
    if (i1 === line1.length) {
      if (i2a < line2a.length) {
        const t = setTimeout(() => setI2a(i2a + 1), speed)
        return () => clearTimeout(t)
      }
    }
  }, [started, i1, i2a])

  useEffect(() => {
    if (!started) return
    if (i1 === line1.length && i2a === line2a.length) {
      if (i2b < line2b.length) {
        const t = setTimeout(() => setI2b(i2b + 1), speed)
        return () => clearTimeout(t)
      }
    }
  }, [started, i1, i2a, i2b])

  useEffect(() => {
    if (!started) return
    if (i1 === line1.length && i2a === line2a.length && i2b === line2b.length) {
      if (i3 < line3.length) {
        const t = setTimeout(() => setI3(i3 + 1), speed)
        return () => clearTimeout(t)
      } else {
        setDone(true)
      }
    }
  }, [started, i1, i2a, i2b, i3])

  return (
    <div className="text-left max-w-3xl" ref={rootRef}>
      <div className="block md:w-[760px] lg:w-[900px]">
        <div className="leading-tight">
          {/* 첫 줄 */}
          <h3 className={`text-white text-4xl md:text-6xl font-extrabold transition-all duration-[1200ms] ease-in-out ${cardClicked ? 'opacity-0 -translate-x-[150%]' : 'opacity-100 translate-x-0'}`}>
            <span className="relative inline-block">
              <span aria-hidden className="invisible">{line1}</span>
              <span className="absolute left-0 top-0">{started ? line1.slice(0, i1) : ''}</span>
            </span>
          </h3>
          {/* 두 번째 묶음 첫째 줄 */}
          <div className={`neon text-4xl md:text-6xl font-extrabold mt-3 leading-tight transition-all duration-[1200ms] delay-[500ms] ease-in-out ${cardClicked ? 'opacity-0 -translate-x-[150%]' : 'opacity-100 translate-x-0'}`}>
            <span className="block relative">
              <span aria-hidden className="invisible">{line2a}</span>
              <span className="absolute left-0 top-0">{started ? line2a.slice(0, i2a) : ''}</span>
            </span>
          </div>
          {/* 두 번째 묶음 둘째 줄 */}
          <div className={`neon text-4xl md:text-6xl font-extrabold leading-tight transition-all duration-[1200ms] delay-[1000ms] ease-in-out ${cardClicked ? 'opacity-0 -translate-x-[150%]' : 'opacity-100 translate-x-0'}`}>
            <span className="block relative">
              <span aria-hidden className="invisible">{line2b}</span>
              <span className="absolute left-0 top-0">{started ? line2b.slice(0, i2b) : ''}</span>
            </span>
          </div>
          {/* 마지막 줄 */}
          <h3 className={`text-white text-4xl md:text-6xl font-extrabold mt-3 transition-all duration-[1200ms] delay-[1500ms] ease-in-out ${cardClicked ? 'opacity-0 -translate-x-[150%]' : 'opacity-100 translate-x-0'}`}>
            <span className="relative inline-block">
              <span aria-hidden className="invisible">{line3}</span>
              <span className="absolute left-0 top-0">{started ? line3.slice(0, i3) : ''}</span>
            </span>
          </h3>
        </div>
      </div>

      <div className="mt-16 md:mt-24 lg:mt-28 text-white text-base md:text-lg leading-relaxed">
        <p className={`transition-all duration-[1200ms] delay-[2000ms] ease-in-out ${cardClicked ? 'opacity-0 -translate-x-[150%]' : done ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-0'}`}>더 이상 쓰임이 많지 않은 감정과, 단단히 굳어버린 걱정.</p>
        <p className={`mt-1 transition-all duration-[1200ms] delay-[2300ms] ease-in-out ${cardClicked ? 'opacity-0 -translate-x-[150%]' : done ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-0'}`}>
          <span className={`neon transition-all duration-[1200ms] delay-[2300ms] ease-in-out ${cardClicked ? 'opacity-0 -translate-x-[150%]' : 'opacity-100 translate-x-0'}`}>해결단 &apos;장미&apos;</span>에서 관리하겠습니다.
        </p>
        <p className={`mt-1 transition-all duration-[1200ms] delay-[2600ms] ease-in-out ${cardClicked ? 'opacity-0 -translate-x-[150%]' : done ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-0'}`}>그들은 어디에나 있으니까요.</p>
      </div>
    </div>
  )
}
