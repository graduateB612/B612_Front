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
      {/* How 전용 전체 화면 배경 (모든 섹션 공통) */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: 'url("/image/space-bg2.png")' }}
      ></div>
      <Header />

      {/* 섹션 1: 타이틀 + 가이드 카드 2x2 (한 화면) */}
      <SectionFrame withPattern transparent>
        <SectionOne />
      </SectionFrame>

      {/* 섹션 2: Tools 카드 스택 인터랙션 */}
      <SectionFrame withPattern transparent className="items-stretch">
        <div className="w-full">
          <StickyToolsCards />
        </div>
      </SectionFrame>
    </div>
  )
}

function SectionOne() {
  const [titleDone, setTitleDone] = useState(false)
  return (
    <div className="w-[80%] max-w-none mx-auto px-6 md:px-8 text-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
        {/* 타이틀 블록 */}
        <div className="lg:col-span-2">
          <TypingTitle onComplete={() => setTitleDone(true)} />
        </div>

        {/* 2x2 가이드 그리드 */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 lg:col-span-3 justify-items-stretch transition-all duration-1000 ease-out ${titleDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
          <div className="h-px bg-white"></div>
          <div className="hidden md:block h-px bg-white"></div>
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
            <div className="w-full h-px bg-white"></div>
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
            <div className="w-full h-px bg-white"></div>
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
            <div className="w-full h-px bg-white"></div>
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
            <div className="w-full h-px bg-white"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TypingTitle({ onComplete }: { onComplete?: () => void }) {
  const line1 = "‘장미’ 사무실"
  const line2 = "안내 가이드"
  const speedMs = 70
  const [i1, setI1] = useState(0)
  const [i2, setI2] = useState(0)
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setBlink(v => !v), 450)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (i1 < line1.length) {
      const t = setTimeout(() => setI1(i1 + 1), speedMs)
      return () => clearTimeout(t)
    }
  }, [i1])

  useEffect(() => {
    if (i1 === line1.length) {
      if (i2 < line2.length) {
        const t = setTimeout(() => setI2(i2 + 1), speedMs)
        return () => clearTimeout(t)
      } else {
        onComplete?.()
      }
    }
  }, [i1, i2, onComplete])

  return (
    <h2 className="inline-block text-3xl md:text-5xl font-extrabold tracking-tight text-white">
      <span className="text-[#00b0f0]">{line1.slice(0, i1)}</span>
      {i1 < line1.length && blink ? <span className="text-white/60">|</span> : null}
      <br />
      <span>{line2.slice(0, i2)}</span>
      {i1 === line1.length && i2 < line2.length && blink ? <span className="text-white/60">|</span> : null}
    </h2>
  )
}
function StickyToolsCards() {
  const messages = [
    "VScode",
    "InelliJ",
    "JavaSpringBoot",
    "JavaScript",
    "TypeScript",
    "TailwindCSS",
    "PostgreSQL",
    "Aesprite"
  ]

  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [vh, setVh] = useState(0)

  const stackTopPx = 96
  const stackGapPx = 84
  const overlayVh = 80 + (messages.length - 1) * 26

  useEffect(() => {
    const root = scrollerRef.current
    const overlay = overlayRef.current
    if (!root || !overlay) return

    const updateVh = () => setVh(root.clientHeight)
    updateVh()

    let raf: number | null = null
    const onScroll = () => {
      if (raf != null) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = Math.max(1, overlay.clientHeight - root.clientHeight)
        const p = Math.min(Math.max(root.scrollTop / max, 0), 1)
        setScrollProgress(p)
      })
    }
    onScroll()
    root.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateVh)
    return () => {
      root.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateVh)
      if (raf != null) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="relative w-full">
      <style jsx global>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      <div ref={scrollerRef} className="h-screen overflow-y-auto no-scrollbar">
        {/* 오버레이 영역: 절대배치 스택 (하단→슬롯 순차 이동) */}
        <div ref={overlayRef} className="relative" style={{ height: `${overlayVh}vh` }}>
          <div className="sticky top-0 z-30 h-screen">
            {/* 타이틀 */}
            <div className="absolute top-0 left-0 right-0 pt-6 pb-4">
              <div className="flex justify-center">
                <h3 className="text-white text-3xl md:text-5xl font-extrabold tracking-tight">Tools</h3>
              </div>
            </div>

            {/* 초기 스크롤 안내 (중앙 표시, 스크롤 시작 시 사라짐) */}
            <div
              className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
              style={{ opacity: Math.max(0, 1 - scrollProgress * 8) }}
            >
              <div className="flex flex-col items-center gap-2 text-white/80">
                <div className="animate-bounce text-5xl leading-none">↓</div>
                <div className="text-xl md:text-2xl font-extrabold tracking-wide">Scroll!!</div>
              </div>
            </div>

            {/* 카드 스택 */}
            <div className="relative h-full w-full">
              {messages.map((msg, idx) => {
                const total = messages.length
                const reveal = scrollProgress * total
                // 각 카드 이동에 이징을 적용해 덜 민감하게
                const tRaw = Math.max(0, Math.min(1, reveal - idx))
                const t = Math.pow(tRaw, 1.6) // 1.0=선형, >1 느리게 시작

                const ySlot = stackTopPx + stackGapPx * idx
                const startBase = (vh > 0 ? Math.max(vh - 140, ySlot + 60) : ySlot + 160)
                const y = ySlot + (1 - t) * (startBase - ySlot)
                return (
                  <div
                    key={msg}
                    className="absolute left-1/2 -translate-x-1/2 w-[86%] md:w-[80%] rounded-2xl border border-white/25 bg-black/30 backdrop-blur-sm px-6 md:px-8 py-4 md:py-5 text-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-500"
                    style={{ top: y, zIndex: messages.length - idx }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-2xl md:text-3xl font-extrabold">{msg}</div>
                      <div className="text-white/40 text-xl md:text-2xl">{idx + 1}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

