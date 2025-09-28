"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import Header from "../components/header"
import SectionFrame from "../components/section-frame"

export default function HowPage() {
  return (
    <div
      className="snap-y snap-mandatory h-screen overflow-y-auto no-scrollbar relative"
      data-scroll-root="how-scroll"
      style={{ scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}
    >
      {/* How 전용 전체 화면 배경: 단색 검정 */}
      <div className="fixed inset-0 -z-10 bg-black pointer-events-none"></div>
      <Header />

      {/* 섹션 1: 타이틀 + 가이드 카드 2x2 (한 화면) */}
      <SectionFrame withPattern={false} transparent>
        <SectionOne />
      </SectionFrame>

    </div>
  )
}

function SectionOne() {
  const [titleDone, setTitleDone] = useState(false)
  return (
    <div className="w-full max-w-none mx-auto px-6 md:px-10 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-14 items-start">
        {/* 타이틀 블록 */}
        <div className="lg:max-w-[520px] lg:w-[520px]">
          <TypingTitle onComplete={() => setTitleDone(true)} />
        </div>

        {/* 2x2 가이드 그리드 */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-14 justify-items-stretch transition-all duration-1000 ease-out ${titleDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
          <div className="h-px bg-white"></div>
          <div className="hidden md:block h-px bg-white"></div>
          {/* 감정의 별 찾기 */}
          <div className="space-y-4 w-full">
            <div className="h-20 w-full flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Image src="/image/frame_stars/frame_star1.png" alt="star1" width={80} height={80} />
                <Image src="/image/frame_stars/frame_star2.png" alt="star2" width={80} height={80} />
                <Image src="/image/frame_stars/frame_star3.png" alt="star3" width={80} height={80} />
                <Image src="/image/frame_stars/frame_star4.png" alt="star4" width={80} height={80} />
              </div>
            </div>
            <div className="h-14 w-full flex items-center">
              <div className="neon text-3xl font-extrabold">감정의 별 찾기</div>
            </div>
            <p className="text-white text-base md:text-lg leading-relaxed max-w-xl">
              어린 왕자와, 다른 해결사들의 대화를 잘 들어보면<br/> 맵 곳곳에 있는 ‘별’을 발견할 수 있습니다.
            </p>
            <div className="w-full h-px bg-white"></div>
          </div>

          {/* 해결사들과의 대화 */}
          <div className="space-y-4 w-full">
            <div className="h-20 w-full flex items-center gap-4">
              <div className="flex items-center gap-5">
                <Image src="/character/little prince.png" alt="prince" width={72} height={72} />
                <Image src="/character/rose face.png" alt="rose" width={80} height={80} />
                <Image src="/character/fox face.png" alt="fox" width={80} height={80} style={{ transform: 'scaleX(-1)' }} />
                <Image src="/character/baobap face.png" alt="baobap" width={80} height={80} style={{ transform: 'scaleX(-1)' }} />
              </div>
            </div>
            <div className="h-14 w-full flex items-center">
              <div className="neon text-3xl font-extrabold">해결사들과의 대화</div>
            </div>
            <p className="text-white text-base md:text-lg leading-relaxed max-w-xl">
              별을 발견 후, 해결사들에게 건네줄 수 있습니다.<br/>차례차례 모든 해결사들에게 도움을 주세요.
            </p>
            <div className="w-full h-px bg-white"></div>
          </div>

          {/* 특정 오브젝트 상호작용 */}
          <div className="space-y-4 w-full">
            <div className="h-20 w-full flex items-center gap-4">
              <Image src="/image/exclamation_mark.png" alt="exclamation" width={80} height={80} />
            </div>
            <div className="h-14 w-full flex items-center">
              <div className="neon text-3xl font-extrabold">특정 오브젝트 상호작용</div>
            </div>
            <p className="text-white text-base md:text-lg leading-relaxed max-w-xl">
              느낌표가 있는 오브젝트는 꼭!<br/> 상호작용을 진행해 보세요.<br />ㅤ
            </p>
            <div className="w-full h-px bg-white"></div>
          </div>

          {/* 의뢰 접수 */}
          <div className="space-y-4 w-full">
            <div className="h-20 w-full flex items-center gap-5">
              <Image src="/image/write.png" alt="write" width={80} height={80} />
              <Image src="/image/pen.png" alt="pen" width={80} height={80} />
            </div>
            <div className="h-14 w-full flex items-center">
              <div className="neon text-3xl font-extrabold">의뢰 접수</div>
            </div>
            <p className="text-white text-base md:text-lg leading-relaxed max-w-xl">
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
      <span className="neon">{line1.slice(0, i1)}</span>
      {i1 < line1.length && blink ? <span className="text-white/60">|</span> : null}
      <br />
      <span>{line2.slice(0, i2)}</span>
      {i1 === line1.length && i2 < line2.length && blink ? <span className="text-white/60">|</span> : null}
    </h2>
  )
}
// (삭제됨) StickyToolsCards 섹션

