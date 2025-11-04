"use client"

import Image from "next/image"
import React, { useEffect, useState } from "react"
import Header from "../components/header"
import SectionFrame from "../components/section-frame"
import ScrollIndicator from "../components/scroll-indicator"

export default function HowPage() {
  const scrollRootRef = React.useRef<HTMLDivElement | null>(null)
  return (
    <div
      ref={scrollRootRef}
      className="min-h-screen overflow-hidden relative"
      data-scroll-root="how-scroll"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* How 전용 전체 화면 배경: 단색 검정 */}
      <div className="fixed inset-0 -z-10 bg-black pointer-events-none"></div>
      <Header />

      {/* 섹션 1: 타이틀 + 가이드 카드 스택 */}
      <SectionFrame withPattern={false} transparent className="items-start justify-start overflow-visible py-0">
        <SectionOne />
      </SectionFrame>

    </div>
  )
}

function SectionOne() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showIntro, setShowIntro] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const scrollerRef = React.useRef<HTMLDivElement | null>(null)
  const sectionRefs = React.useRef<(HTMLDivElement | null)[]>([])

  // 스택 설정값
  const HEADER_H = 100 // 접힌 카드 높이
  const HEADER_OFFSET = 64 // 페이지 상단 고정 헤더 보정
  const EXPANDED_CSS = `calc(100vh - ${HEADER_OFFSET}px)` // 스크롤러와 카드가 공유하는 펼침 높이

  const CARDS = [
    {
      title: '감정의 별 찾기',
      icons: [
        { src: "/image/frame_stars/frame_star1.png", alt: "star1" },
        { src: "/image/frame_stars/frame_star2.png", alt: "star2" },
        { src: "/image/frame_stars/frame_star3.png", alt: "star3" },
        { src: "/image/frame_stars/frame_star4.png", alt: "star4" },
      ],
      body: (
        <>
          어린 왕자와, 다른 해결사들의 대화를 잘 들어보면<br/> 맵 곳곳에 있는 &lsquo;별&rsquo;을 발견할 수 있습니다.
        </>
      ),
      bottomImage: "/image/play-1.png"
    },
    {
      title: '해결사들과의 대화',
      icons: [
        { src: "/character/little prince.png", alt: "prince" },
        { src: "/character/rose face.png", alt: "rose" },
        { src: "/character/fox face.png", alt: "fox", style: { transform: 'scaleX(-1)' } as React.CSSProperties },
        { src: "/character/baobap face.png", alt: "baobap", style: { transform: 'scaleX(-1)' } as React.CSSProperties },
      ],
      body: (
        <>별을 발견 후, 해결사들에게 건네줄 수 있습니다.<br/>차례차례 모든 해결사들에게 도움을 주세요.</>
      ),
      bottomImage: "/image/play-2.png"
    },
    {
      title: '특정 오브젝트 상호작용',
      icons: [ { src: "/image/exclamation_mark.png", alt: "exclamation" } ],
      body: (<>느낌표가 있는 오브젝트는 꼭!<br/> 상호작용을 진행해 보세요.</>),
      bottomImage: "/image/play-3.png"
    },
    {
      title: '의뢰 접수',
      icons: [ { src: "/image/write.png", alt: "write" }, { src: "/image/pen.png", alt: "pen" } ],
      body: (<>모든 진행 상황이 끝난 뒤,<br/> 해결사들에게 의뢰(고민)를 작성해 보세요.<br/> 입력한 메일로 그들이 정성껏 답신을 보낼 거예요.</>),
      bottomImage: "/image/play-4.png"
    }
  ]

  const setSectionRef = (el: HTMLDivElement | null, idx: number) => {
    sectionRefs.current[idx] = el
  }

  // 클라이언트 사이드에서만 실행되도록 설정
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const root = scrollerRef.current
      if (!root) return
      const scrollY = root.scrollTop
      
      // 고정 픽셀 단위로 변경 - 모든 화면에서 동일한 스크롤 거리
      const sectionHeight = 250 // 고정 250px (더 민감하게)
      const currentSection = Math.floor(scrollY / sectionHeight)
      
      // 섹션 0: 인트로, 섹션 1~4: 카드 1~4
      if (currentSection <= 0) {
        // 인트로 영역
        if (!showIntro) {
          setShowIntro(true)
          setActiveIndex(0)
        }
        return
      } else {
        // 카드 영역 (섹션 1~4 → 카드 인덱스 0~3)
        if (showIntro) {
          setShowIntro(false)
        }
        const cardIndex = Math.min(currentSection - 1, CARDS.length - 1)
        if (cardIndex !== activeIndex) {
          setActiveIndex(cardIndex)
        }
      }
    }
    
    // 초기 실행을 지연시켜 DOM이 완전히 로드된 후 실행
    const timer = setTimeout(() => {
      const root = scrollerRef.current
      if (root) {
        onScroll()
        root.addEventListener('scroll', onScroll, { passive: false }) // passive를 false로 변경
        window.addEventListener('resize', onScroll)
      }
    }, 100)
    
    return () => {
      clearTimeout(timer)
      const currentScroller = scrollerRef.current
      if (currentScroller) {
        currentScroller.removeEventListener('scroll', onScroll)
      }
      window.removeEventListener('resize', onScroll)
    }
  }, [CARDS.length, activeIndex, showIntro])

  useEffect(() => {
    if (!showIntro) return
    const dismiss = () => setShowIntro(false)
    window.addEventListener('keydown', dismiss, { once: true })
    return () => {
      window.removeEventListener('keydown', dismiss)
    }
  }, [showIntro])

  return (
    <div className="fixed inset-0 text-white" style={{ top: `${HEADER_OFFSET}px` }}>
      {/* 스크롤 인디케이터 - 카드 영역(showIntro가 false)일 때만 표시 */}
      {!showIntro && <ScrollIndicator />}
      
      {/* 인트로 오버레이 */}
      <div
        className={`absolute inset-0 flex items-center justify-center select-none transition-opacity duration-700 ${showIntro ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-50`}
        style={{ pointerEvents: showIntro ? 'none' : 'none' }} // 스크롤을 위해 pointer-events 비활성화
      >
        <div className="text-center">
          <h2 
            className="neon font-extrabold text-5xl md:text-7xl leading-tight cursor-pointer"
            style={{ pointerEvents: showIntro ? 'auto' : 'none' }} // 텍스트만 클릭 가능
            onClick={() => {
              setShowIntro(false)
              if (scrollerRef.current && isClient) {
                scrollerRef.current.scrollTop = 250 // 고정 250px로 스크롤 (섹션 1)
              }
              setActiveIndex(0)
            }}
            onTouchStart={() => {
              setShowIntro(false)
              if (scrollerRef.current && isClient) {
                scrollerRef.current.scrollTop = 250 // 고정 250px로 스크롤 (섹션 1)
              }
              setActiveIndex(0)
            }}
          >
            &lsquo;장미&rsquo; 사무실
            <br />
            안내 가이드
          </h2>
          
          {/* 삼각형 (위를 가리킴) */}
          <div className="mt-8 flex justify-center">
            <div 
              className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-white/70"
              style={{ 
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
              }}
            />
          </div>
          
          <p 
            className="text-white/70 text-xl md:text-2xl font-semibold mt-4 cursor-pointer"
            style={{ pointerEvents: showIntro ? 'auto' : 'none' }}
            onClick={() => {
              setShowIntro(false)
              if (scrollerRef.current && isClient) {
                scrollerRef.current.scrollTop = 250 // 고정 250px로 스크롤
              }
              setActiveIndex(0)
            }}
            onTouchStart={() => {
              setShowIntro(false)
              if (scrollerRef.current && isClient) {
                scrollerRef.current.scrollTop = 250 // 고정 250px로 스크롤
              }
              setActiveIndex(0)
            }}
          >
            CLICK
          </p>
        </div>
      </div>

      {/* 전체 화면 스크롤러 */}
      <div
        ref={scrollerRef}
        className={`w-full h-full overflow-y-auto no-scrollbar transition-opacity duration-700 ${!showIntro ? 'opacity-100' : 'opacity-0'}`}
      >
            {/* 스크롤 가능한 높이 확보 - 고정 픽셀 단위로 변경 */}
            <div style={{ height: `${(CARDS.length + 1) * 250 + 500}px` }}>
              {/* 스크롤 트리거 영역들: 인트로(250px) + 카드들(각 250px) */}
              <div style={{ height: `250px` }} className="relative" /> {/* 인트로 영역 */}
              {CARDS.map((c, idx) => (
                <div
                  key={c.title}
                  ref={(el) => setSectionRef(el as HTMLDivElement, idx)}
                  style={{ height: `250px` }}
                  className="relative"
                />
              ))}
            </div>
            
        {/* 모든 카드를 항상 렌더링 - 하단에서 올라오는 효과 포함 */}
        <div className="fixed inset-0" style={{ top: `${HEADER_OFFSET + 80}px`, pointerEvents: 'none' }}>
          <div className="relative w-full h-full max-w-[1280px] mx-auto px-6 md:px-10" style={{ pointerEvents: 'none' }}>
                {CARDS.map((c, idx) => {
                  const isActive = activeIndex === idx
                  const isVisible = true // 모든 카드를 항상 표시 가능하도록 변경
                  
                  // 카드 위치 계산: 양방향 스크롤 지원
                  let cardTop
                  if (idx < activeIndex) {
                    // 이전 카드들: 상단에 스택
                    cardTop = idx * HEADER_H
                  } else if (idx === activeIndex) {
                    // 현재 활성 카드: 스택된 카드들 바로 아래
                    cardTop = idx * HEADER_H
                  } else {
                    // 아직 나오지 않은 카드들: 화면 하단에서 대기 (클라이언트에서만 동적 계산)
                    if (isClient) {
                      const basePosition = window.innerHeight - HEADER_OFFSET - 80
                      cardTop = basePosition + (idx - activeIndex - 1) * 20
                    } else {
                      // 서버 사이드에서는 화면 밖으로 숨김
                      cardTop = 2000
                    }
                  }
                  
                  
                  return (
                    <div
                      key={`card-${c.title}`}
                      className="absolute w-full left-0 right-0"
                      style={{
                        top: `${cardTop}px`,
                        zIndex: isActive ? 1000 : (idx < activeIndex ? 900 + idx : 100 + idx),
                        transition: 'top 550ms ease-in-out, opacity 550ms ease-in-out',
                        opacity: isVisible ? 1 : 0.8,
                        pointerEvents: 'none'
                      }}
                    >
                      <div
                        className="rounded-2xl border overflow-hidden mx-auto"
                        style={{
                          maxHeight: isActive ? EXPANDED_CSS : `${HEADER_H}px`,
                          transition: 'max-height 550ms ease-in-out',
                          borderColor: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                          background: isActive ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)',
                          maxWidth: '1280px',
                          paddingLeft: '1.5rem',
                          paddingRight: '1.5rem'
                        }}
                      >
                        <StackCard title={c.title} icons={c.icons} active={isActive}>
                          {c.body}
                        </StackCard>
                      </div>
                    </div>
                  )
                })}
          </div>
        </div>

        {/* 하단 이미지 영역 - 각 카드별로 다른 위치에 배치 */}
        {!showIntro && (
          <>
            {/* 첫 번째 카드일 때는 play-1~4 모두 표시 */}
            <div 
              className="fixed left-0 right-0 flex justify-center" 
              style={{ 
                top: `${HEADER_OFFSET + 460}px`, 
                pointerEvents: 'none',
                opacity: activeIndex === 0 ? 1 : 0,
                transition: 'opacity 550ms ease-in-out',
                zIndex: 50
              }}
            >
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <div key={`play-${num}`} className="w-[300px] h-[235px] flex items-center justify-center">
                    <Image
                      src={`/image/play-${num}.png`}
                      alt={`플레이 이미지 ${num}`}
                      width={300}
                      height={235}
                      className="object-contain max-w-full max-h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* 두 번째 카드일 때는 play-5, 6 두 개 표시 */}
            <div 
              className="fixed left-0 right-0 flex justify-center" 
              style={{ 
                top: `${HEADER_OFFSET + 480}px`, 
                pointerEvents: 'none',
                opacity: activeIndex === 1 ? 1 : 0,
                transition: 'opacity 550ms ease-in-out',
                zIndex: 50
              }}
            >
              <div className="flex gap-6">
                {[5, 6].map((num) => (
                  <div key={`play-${num}`} className="w-[450px] h-[320px] flex items-center justify-center">
                    <Image
                      src={`/image/play-${num}.png`}
                      alt={`플레이 이미지 ${num}`}
                      width={450}
                      height={320}
                      className="object-contain max-w-full max-h-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 세 번째 카드일 때는 play-7, 8, 9 세 개 표시 */}
            <div 
              className="fixed left-0 right-0 flex justify-center" 
              style={{ 
                top: `${HEADER_OFFSET + 500}px`, 
                pointerEvents: 'none',
                opacity: activeIndex === 2 ? 1 : 0,
                transition: 'opacity 550ms ease-in-out',
                zIndex: 50
              }}
            >
              <div className="flex gap-4 items-center">
                {[7, 8, 9].map((num) => {
                  const isMiddle = num === 8
                  return (
                    <div 
                      key={`play-${num}`} 
                      className="flex items-center justify-center"
                      style={{
                        width: isMiddle ? '530px' : '300px',
                        height: isMiddle ? '410px' : '235px'
                      }}
                    >
                      <Image
                        src={`/image/play-${num}.png`}
                        alt={`플레이 이미지 ${num}`}
                        width={isMiddle ? 530 : 300}
                        height={isMiddle ? 410 : 235}
                        className="object-contain max-w-full max-h-full"
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 네 번째 카드는 이미지 없음 */}
          </>
        )}
      </div>
    </div>
  )
}

function StackCard({ title, icons, children, active }: { title: string; icons: { src: string; alt: string; style?: React.CSSProperties }[]; children: React.ReactNode; active: boolean }) {
  return (
    <div className={`relative w-full px-6 md:px-8 ${active ? 'py-6 md:py-7' : 'py-6 md:py-6'} text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]`}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 items-start">
        <div>
          <div className="neon text-3xl md:text-4xl font-extrabold mt-3">{title}</div>
          <div className={`w-full overflow-hidden ${!active ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
            <div className="mt-3 h-16 w-full flex items-center gap-5 md:gap-6">
              {icons.map((it) => (
                <Image key={it.src} src={it.src} alt={it.alt} width={56} height={56} style={it.style} />
              ))}
            </div>
          </div>
          <div className={`mt-3 md:mt-4 text-white/90 text-sm md:text-base leading-relaxed ${!active ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
            {children}
          </div>
        </div>
        <div className="hidden lg:block"></div>
      </div>
    </div>
  )
}

