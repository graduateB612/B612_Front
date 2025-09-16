"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import HeroSection from "../components/hero-section"
import Header from "../components/header"
import SectionFrame from "../components/section-frame"
import React from "react"

export default function AboutPage() {
  return (
    <div
      className="snap-y snap-mandatory h-screen overflow-y-auto relative"
      style={{ scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}
    >
      <style jsx>{`
        @keyframes float-y {
          0%, 100% { transform: translateY(-18px); }
          50% { transform: translateY(18px); }
        }
        .float-y { animation: float-y 4.5s ease-in-out infinite; will-change: transform; }

        /* 3D Y축 회전 (카드 뒤집힘) */
        @keyframes spin-y {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .spin-y { animation: spin-y 6s linear infinite; will-change: transform; transform-style: preserve-3d; }
        .perspective { perspective: 1000px; }
        .card-face { backface-visibility: hidden; }
      `}</style>
      {/* About 전용 전체 화면 배경 (모든 섹션 공통) */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: 'url("/image/space-bg2.png")' }}
      ></div>
      <Header />

      {/* 섹션 1: 기존 히어로 */}
      <SectionFrame withPattern={false} transparent>
        <HeroSection noGradient transparent showPattern={false} />
      </SectionFrame>

      {/* 섹션 2: 레이아웃 + 우측 카드 이미지 배치 */}
      <SectionFrame withPattern transparent className="items-start justify-start">
        <div className="max-w-7xl w-full px-6 pt-10 md:pt-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-start text-gray-200">
          {/* 좌측 텍스트 영역 - 시안 레이아웃 (헤드라인 박스 + 본문 박스) */}
          <AboutSectionTwoTyping />

          {/* 우측 이미지 영역 */}
          <div className="relative w-full flex items-center justify-center">
            <div className="relative w-[320px] h-[420px] md:w-[420px] md:h-[560px] float-y perspective">
              <div className="relative w-full h-full spin-y">
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
      </SectionFrame>

      {/* 섹션 3: 표 형식 섹션 */}
      <SectionFrame withPattern transparent>
        <div className="w-[80%] max-w-none mx-auto px-6 md:px-8 text-gray-200">
          {/* 헤더 */}
          <div className="grid grid-cols-3 gap-x-10 items-center">
            <div></div>
            <div className="inline-block text-2xl md:text-3xl font-bold px-4 py-2">주요사항</div>
            <div className="inline-block text-2xl md:text-3xl font-bold px-4 py-2">세부사항</div>
          </div>

          {/* 행들 */}
          <div className="mt-8 border-t border-white">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-x-10 items-center py-6 border-b border-white">
              <div className="flex items-center gap-6">
                <Image src="/image/rose.png" alt="rose" width={64} height={64} />
                <div className="text-white text-xl md:text-2xl font-semibold">가격</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex w-9 aspect-square rounded-full border-2 border-emerald-400 text-emerald-300 items-center justify-center text-base">✓</span>
                <div className="text-cyan-400 font-semibold text-xl">당신의 부정적 감정</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex w-9 aspect-square rounded-full border-2 border-red-400 text-red-300 items-center justify-center text-base">✓</span>
                <div className="text-white text-xl">모든 감정은 중요함</div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-x-10 items-center py-6 border-b border-white">
              <div className="flex items-center gap-6">
                <Image src="/image/rose.png" alt="rose" width={64} height={64} />
                <div className="text-white text-xl md:text-2xl font-semibold">운영 시간</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex w-9 aspect-square rounded-full border-2 border-emerald-400 text-emerald-300 items-center justify-center text-base">✓</span>
                <div className="text-cyan-400 font-semibold text-xl">24/7 항상</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex w-9 aspect-square rounded-full border-2 border-red-400 text-red-300 items-center justify-center text-base">✓</span>
                <div className="text-white text-xl">보이지 않는 곳에서 진행</div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-3 gap-x-10 items-center py-6 border-b border-white">
              <div className="flex items-center gap-6">
                <Image src="/image/rose.png" alt="rose" width={64} height={64} />
                <div className="text-white text-xl md:text-2xl font-semibold">업무 시간</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex w-9 aspect-square rounded-full border-2 border-emerald-400 text-emerald-300 items-center justify-center text-base">✓</span>
                <div className="text-cyan-400 font-semibold text-xl">‘장미’의 존재를 잊을 때까지</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex w-9 aspect-square rounded-full border-2 border-red-400 text-red-300 items-center justify-center text-base">✓</span>
                <div className="text-white text-xl">좋은 어른이 되었다!</div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-3 gap-x-10 items-center py-6 border-b border-white ">
              <div className="flex items-center gap-6">
                <Image src="/image/rose.png" alt="rose" width={64} height={64} />
                <div className="text-white text-xl md:text-2xl font-semibold">인원</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex w-9 aspect-square rounded-full border-2 border-emerald-400 text-emerald-300 items-center justify-center text-base">✓</span>
                <div className="text-cyan-400 font-semibold text-xl">4명의 해결사</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex w-9 aspect-square rounded-full border-2 border-red-400 text-red-300 items-center justify-center text-base">✓</span>
                <div className="text-white text-xl">원하는 해결사를 선택</div>
              </div>
            </div>
          </div>
        </div>
      </SectionFrame>
    </div>
  )
}

function AboutSectionTwoTyping() {
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
          <h3 className="text-white text-4xl md:text-6xl font-extrabold">
            <span className="relative inline-block">
              <span aria-hidden className="invisible">{line1}</span>
              <span className="absolute left-0 top-0">{started ? line1.slice(0, i1) : ''}</span>
            </span>
          </h3>
          {/* 두 번째 묶음 (두 줄, 시안 색상) */}
          <div className="text-[#00b0f0] text-4xl md:text-6xl font-extrabold mt-3 leading-tight">
            <span className="block relative">
              <span aria-hidden className="invisible">{line2a}</span>
              <span className="absolute left-0 top-0">{started ? line2a.slice(0, i2a) : ''}</span>
            </span>
            <span className="block relative">
              <span aria-hidden className="invisible">{line2b}</span>
              <span className="absolute left-0 top-0">{started ? line2b.slice(0, i2b) : ''}</span>
            </span>
          </div>
          {/* 마지막 줄 */}
          <h3 className="text-white text-4xl md:text-6xl font-extrabold mt-3">
            <span className="relative inline-block">
              <span aria-hidden className="invisible">{line3}</span>
              <span className="absolute left-0 top-0">{started ? line3.slice(0, i3) : ''}</span>
            </span>
          </h3>
        </div>
      </div>

      <div className={`mt-16 md:mt-24 lg:mt-28 text-gray-200 text-base md:text-lg leading-relaxed transition-opacity duration-700 ${done ? 'opacity-100' : 'opacity-0'}`}>
        <p>더 이상 쓰임이 많지 않은 감정과, 단단히 굳어버린 걱정.</p>
        <p className="mt-1"><span className="text-[#00b0f0]">해결단 ‘장미’</span>에서 관리하겠습니다.</p>
        <p className="mt-1">그들은 어디에나 있으니까요.</p>
      </div>
    </div>
  )
}
