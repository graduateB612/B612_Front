"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import Header from "../components/header"
import SectionFrame from "../components/section-frame"

export default function HowPage() {
  return (
    <div
      className="snap-y snap-mandatory h-screen overflow-y-auto relative"
      data-scroll-root="how-scroll"
      style={{ scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}
    >
      {/* 배경은 비워둠 */}
      <Header />

      {/* 섹션 1: 타이틀 + 가이드 카드 2x2 (한 화면) */}
      <SectionFrame withPattern>
        <div className="w-[80%] max-w-none mx-auto px-6 md:px-8 text-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            {/* 타이틀 블록 */}
            <div className="lg:col-span-2">
              <h2 className="inline-block text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                <span className="text-[#00b0f0]">‘장미’ 사무실</span>
                <br />
                안내 가이드
              </h2>
            </div>

            {/* 2x2 가이드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:col-span-3 justify-items-stretch">
            <div className="h-px bg-gray-700/60"></div>
            <div className="hidden md:block h-px bg-gray-700/60"></div>
            {/* 감정의 별 찾기 */}
            <div className="space-y-4 w-full">
              <div className="h-16 w-full flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Image src="/image/frame_stars/frame_star1.png" alt="star1" width={64} height={64} />
                  <Image src="/image/frame_stars/frame_star2.png" alt="star2" width={64} height={64} />
                  <Image src="/image/frame_stars/frame_star3.png" alt="star3" width={64} height={64} />
                  <Image src="/image/frame_stars/frame_star4.png" alt="star4" width={64} height={64} />
                </div>
              </div>
              <div className="h-12 w-full flex items-center">
                <div className="text-cyan-400 text-2xl font-extrabold">감정의 별 찾기</div>
              </div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-md">
                어린 왕자와, 다른 해결사들의 대화를 잘 들어보면<br/> 맵 곳곳에 있는 ‘별’을 발견할 수 있습니다.
              </p>
              <div className="w-full h-px bg-gray-700/60"></div>
            </div>

            {/* 해결사들과의 대화 */}
            <div className="space-y-4 w-full">
              <div className="h-16 w-full flex items-center gap-3">
                <div className="flex items-center gap-4">
                  <Image src="/character/little prince.png" alt="prince" width={56} height={56} />
                  <Image src="/character/rose face.png" alt="rose" width={64} height={64} />
                  <Image src="/character/fox face.png" alt="fox" width={64} height={64} style={{ transform: 'scaleX(-1)' }} />
                  <Image src="/character/baobap face.png" alt="baobap" width={64} height={64} style={{ transform: 'scaleX(-1)' }} />
                </div>
              </div>
              <div className="h-12 w-full flex items-center">
                <div className="text-cyan-400 text-2xl font-extrabold">해결사들과의 대화</div>
              </div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-md">
                별을 발견 후, 해결사들에게 건네줄 수 있습니다.<br/>차례차례 모든 해결사들에게 도움을 주세요.
              </p>
              <div className="w-full h-px bg-gray-700/60"></div>
            </div>

            {/* 특정 오브젝트 상호작용 */}
            <div className="space-y-4 w-full">
              <div className="h-16 w-full flex items-center gap-4">
                <Image src="/image/exclamation_mark.png" alt="exclamation" width={64} height={64} />
              </div>
              <div className="h-12 w-full flex items-center">
                <div className="text-cyan-400 text-2xl font-extrabold">특정 오브젝트 상호작용</div>
              </div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-md">
                느낌표가 있는 오브젝트는 꼭!<br/> 상호작용을 진행해 보세요.<br />ㅤ
              </p>
              <div className="w-full h-px bg-gray-700/60"></div>
            </div>

            {/* 의뢰 접수 */}
            <div className="space-y-4 w-full">
              <div className="h-16 w-full flex items-center gap-4">
                <Image src="/image/write.png" alt="write" width={64} height={64} />
                <Image src="/image/pen.png" alt="pen" width={64} height={64} />
              </div>
              <div className="h-12 w-full flex items-center">
                <div className="text-cyan-400 text-2xl font-extrabold">의뢰 접수</div>
              </div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-md">
                모든 진행 상황이 끝난 뒤,<br/> 해결사들에게 의뢰(고민)를 작성해 보세요.<br/> 입력한 메일로 그들이 정성껏 답신을 보낼 거예요.
              </p>
              <div className="w-full h-px bg-gray-700/60"></div>
            </div>
            </div>
          </div>
        </div>
      </SectionFrame>

      {/* 섹션 2: 스크롤 텍스트 전환 */}
      <SectionFrame withPattern className="items-stretch">
        <div className="w-full">
          <ScrollChangingText snapStepVh={35} />
        </div>
      </SectionFrame>
    </div>
  )
}



type ScrollChangingTextProps = { snapStepVh?: number }

function ScrollChangingText({ snapStepVh = 35 }: ScrollChangingTextProps) {
  const messages = [
    "VScode",
    "InelliJ",
    "JavaSpringBoot",
    "JavaScript",
    "TypeScript",
    "TailwindCSS",
    "PostgreSQL"
  ]

  // 내부 스크롤 컨테이너 참조 (섹션 2 내부에서만 스크롤; 바깥으로 전파 안 됨)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [index, setIndex] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const update = () => {
      if (!scrollerRef.current) return
      const el = scrollerRef.current
      const total = Math.max(1, el.scrollHeight - el.clientHeight)
      const progressed = Math.min(Math.max(el.scrollTop / total, 0), 1)
      const segment = 1 / messages.length
      const nextIdx = Math.min(messages.length - 1, Math.round(progressed / segment))
      setIndex(nextIdx)
    }
    const onScroll = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }
    update()
    const el = scrollerRef.current
    el?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el?.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [messages.length])

  const totalVh = Math.max(120, messages.length * snapStepVh)
  return (
    <div className="relative w-full">
      <style jsx>{`
        @keyframes fadeText { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
        .fade-in { animation: fadeText 0.6s ease both; will-change: opacity, transform; }
      `}</style>
      <style jsx global>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      {/* 내부 스크롤러: 섹션2 안에서만 스크롤되고 바깥으로 전달되지 않음 */}
      <div
        ref={scrollerRef}
        className="h-screen overflow-y-auto no-scrollbar"
        style={{ overscrollBehavior: 'auto' }}
      >
        <div style={{ height: `${totalVh}vh` }} />
      </div>
      {/* 텍스트는 오버레이로 고정 표시 */}
      <div className="pointer-events-none absolute inset-0 flex items-center">
        <div className="w-[80%] mx-auto px-6 md:px-8">
          <h3 key={index} className="fade-in text-white/90 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
            {messages[index]}
          </h3>
        </div>
      </div>
    </div>
  )
}

