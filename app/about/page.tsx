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
  const [showMapText, setShowMapText] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // 섹션 변경 감지 및 초기화
  useEffect(() => {
    if (currentSection === 0) {
      // 섹션1로 이동하면 모든 오버레이 숨기기
      setCardClicked(false)
      setCardMoving(false)
      setShowMapBg(false)
      setShowMapText(false)
      setShowMenu(false)
    } else if (currentSection === 1) {
      // 섹션2로 돌아오면 초기 상태로 리셋 (이미 초기화되어 있을 것)
    }
  }, [currentSection])

  // 스크롤 이벤트 감지
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const sectionHeight = container.clientHeight
      const section = Math.round(scrollTop / sectionHeight)
      setCurrentSection(section)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={containerRef}
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
                  setTimeout(() => setShowMapText(true), 9500)
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
            <div 
              className={`fixed inset-0 z-40 flex items-center animate-fadeIn transition-all duration-1000 ${showMenu ? 'justify-end' : 'justify-center'}`}
              onWheel={(e) => {
                // 위로 스크롤하면 섹션1로 이동
                if (e.deltaY < 0) {
                  const container = containerRef.current
                  if (container) {
                    container.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }
              }}
            >
              <div className={`relative w-full max-w-7xl h-full transition-all duration-1000 ${showMenu ? 'mr-[-10%] md:mr-[-10%]' : ''}`}>
                {/* 기본 map_bg */}
                <Image
                  src="/image/map_bg.png"
                  alt="map background"
                  fill
                  className={`object-contain transition-opacity duration-1000 ${showMapText ? 'opacity-0' : 'opacity-90'}`}
                  priority
                />
                
                {/* map_bg_dark - 텍스트 나올 때 */}
                {showMapText && (
                  <Image
                    src="/image/map_bg_dark.png"
                    alt="map background dark"
                    fill
                    className="object-contain opacity-90 animate-fadeIn"
                    priority
                  />
                )}
              </div>
              
              {/* map_bg 위에 표시될 텍스트 */}
              {showMapText && !showMenu && <MapTextOverlay onComplete={() => setShowMenu(true)} />}
              
              {/* 메뉴 레이아웃 */}
              {showMenu && <MenuLayout />}
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

function MenuLayout() {
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [starsAnimating, setStarsAnimating] = useState(false)
  const [visibleStarsCount, setVisibleStarsCount] = useState(0)
  const [showWorkInfo, setShowWorkInfo] = useState(false)
  const [showOperationInfo, setShowOperationInfo] = useState(false)

  const handlePaymentClick = () => {
    if (showPaymentInfo) {
      // 이미 열려있으면 닫기
      setShowPaymentInfo(false)
      setStarsAnimating(false)
      setVisibleStarsCount(0)
    } else {
      // 다른 토글들 닫기
      setShowWorkInfo(false)
      setShowOperationInfo(false)
      
      // 닫혀있으면 열기
      setShowPaymentInfo(true)
      setStarsAnimating(true)
      setVisibleStarsCount(0)
      
      // 별들을 0.2초 간격으로 시작
      for (let i = 0; i < 7; i++) {
        setTimeout(() => {
          setVisibleStarsCount(prev => prev + 1)
        }, i * 200)
      }
    }
  }

  const handleWorkClick = () => {
    if (showWorkInfo) {
      setShowWorkInfo(false)
    } else {
      // 다른 토글들 닫기
      setShowPaymentInfo(false)
      setStarsAnimating(false)
      setVisibleStarsCount(0)
      setShowOperationInfo(false)
      
      setShowWorkInfo(true)
    }
  }

  const handleOperationClick = () => {
    if (showOperationInfo) {
      setShowOperationInfo(false)
    } else {
      // 다른 토글들 닫기
      setShowPaymentInfo(false)
      setStarsAnimating(false)
      setVisibleStarsCount(0)
      setShowWorkInfo(false)
      
      setShowOperationInfo(true)
    }
  }


  return (
    <div className="absolute inset-0 z-50 flex items-start pt-32 md:pt-40 animate-fadeIn pointer-events-auto">
      <div className="w-full max-w-7xl mx-auto px-2 md:px-6">
        {/* 왼쪽 메뉴 */}
        <div className="text-left space-y-8 md:space-y-12">
          {/* 로고 */}
          <div className="flex items-center gap-4 mb-12 md:mb-16">
            <Image
              src="/image/roseIcon.png"
              alt="rose icon"
              width={60}
              height={60}
              className="object-contain"
            />
            <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-wider">ROSE COMPANY</h1>
          </div>

          {/* 메뉴 항목들 */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <div 
                className="flex items-center gap-4 cursor-pointer hover:translate-x-2 transition-transform duration-300"
                onClick={handlePaymentClick}
              >
                <span className="text-white text-4xl">▶</span>
                <span className="text-white text-2xl md:text-3xl font-bold">지불 방식</span>
              </div>
              
              {/* 지불 방식 클릭 시 표시되는 내용 */}
              {showPaymentInfo && (
                <div className="mt-6 ml-12 text-white space-y-4 animate-fadeIn">
                  <p className="text-lg md:text-xl leading-relaxed">&apos;Rose company&apos;는 당신의 부정적 감정을 통한 결제 서비스를 지원합니다.</p>
                  <p className="text-lg md:text-xl leading-relaxed">당신을 괴롭게 만드는 감정을 부담없이 사용 해 주세요.</p>
                  <p className="text-lg md:text-xl leading-relaxed">단, 모든 감정은 소중하다는 걸 잊지 말아주세요.</p>
                  <p className="text-lg md:text-xl leading-relaxed">우리는 부정적인 것들로부터 새로움을 배우기도 합니다.</p>
                  
                  {/* 별 애니메이션 */}
                  {starsAnimating && (
                    <div className="relative mt-8 h-32">
                      {[1, 2, 3, 4, 5, 6, 7].map((starNum, index) => (
                        <div
                          key={starNum}
                          className="absolute transition-all duration-1000 ease-out"
                          style={{
                            left: `${index * 80}px`,
                            bottom: visibleStarsCount > index ? '0%' : '-150px',
                            opacity: visibleStarsCount > index ? 1 : 0,
                            transitionDuration: '800ms'
                          }}
                        >
                          <Image
                            src={`/image/stars/star_${starNum}.png`}
                            alt={`Star ${starNum}`}
                            width={60}
                            height={60}
                            className="drop-shadow-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <div 
                className="flex items-center gap-4 cursor-pointer hover:translate-x-2 transition-transform duration-300"
                onClick={handleWorkClick}
              >
                <span className="text-white text-4xl">▶</span>
                <span className="text-white text-2xl md:text-3xl font-bold">업무 시간</span>
              </div>
              
              {/* 업무 시간 클릭 시 표시되는 내용 */}
              {showWorkInfo && (
                <div className="mt-6 ml-12 text-white space-y-2 animate-fadeIn">
                  <p className="text-lg md:text-xl leading-relaxed">&apos;Rose company&apos;의 해결사들은 24 / 7 항상 움직입니다.</p>
                  <p className="text-lg md:text-xl leading-relaxed">당신이 어디에서 무엇을 하더라도 그들은 최선을 다 할 것입니다!</p>
                  <p className="text-lg md:text-xl leading-relaxed">비록 보이지 않지만, 그것은 중요한 게 아니죠.</p>
                  
                  {/* 캐릭터 이미지 */}
                  <div className="relative mt-2 -mb-12 flex items-end gap-0 overflow-hidden" style={{ height: '220px' }}>
                    <div className="relative w-[300px] h-[320px] -mr-8">
                      <Image
                        src="/image/rose_run.png"
                        alt="Rose running"
                        fill
                        className="object-contain"
                        style={{ 
                          imageRendering: 'pixelated',
                          objectPosition: 'center bottom',
                          transform: 'scale(1.4) translateY(50px)'
                        }}
                      />
                    </div>
                    <div className="relative w-[300px] h-[320px] -ml-8">
                      <Image
                        src="/image/fox_run.png"
                        alt="Fox running"
                        fill
                        className="object-contain"
                        style={{ 
                          imageRendering: 'pixelated',
                          objectPosition: 'center bottom',
                          transform: 'scale(1.4) translateY(60px)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div 
                className="flex items-center gap-4 cursor-pointer hover:translate-x-2 transition-transform duration-300"
                onClick={handleOperationClick}
              >
                <span className="text-white text-4xl">▶</span>
                <span className="text-white text-2xl md:text-3xl font-bold">운영 시간</span>
              </div>
              
              {/* 운영 시간 클릭 시 표시되는 내용 */}
              {showOperationInfo && (
                <div className="mt-6 ml-12 text-white space-y-2 animate-fadeIn">
                  <p className="text-lg md:text-xl leading-relaxed">&apos;장미&apos;의 존재를 잊기 전 까지 계속해서 운영됩니다.</p>
                  <p className="text-lg md:text-xl leading-relaxed">운영이 종료되었다는 것은,</p>
                  <p className="text-lg md:text-xl leading-relaxed">당신이 숫자를 좋아하는 어른이 되지 않았다는 것입니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MapTextOverlay({ onComplete }: { onComplete: () => void }) {
  const title = "ROSE COMPANY"
  const [titleIndex, setTitleIndex] = useState(0)
  const [showLine2, setShowLine2] = useState(false)
  const [showLine3, setShowLine3] = useState(false)
  const [showLine4, setShowLine4] = useState(false)
  const [showLine5, setShowLine5] = useState(false)
  const [showLine6, setShowLine6] = useState(false)
  const speed = 80
  const [started, setStarted] = useState(false)

  useEffect(() => {
    setStarted(true)
  }, [])

  // 타이틀 타이핑
  useEffect(() => {
    if (!started) return
    if (titleIndex < title.length) {
      const t = setTimeout(() => setTitleIndex(titleIndex + 1), speed)
      return () => clearTimeout(t)
    } else {
      // 타이틀 완료 후 각 라인 순차 표시
      setTimeout(() => setShowLine2(true), 400)
      setTimeout(() => setShowLine3(true), 800)
      setTimeout(() => setShowLine4(true), 1200)
      setTimeout(() => setShowLine5(true), 1600)
      setTimeout(() => {
        setShowLine6(true)
        // 마지막 라인 표시 후 3초 뒤 메뉴로 전환
        setTimeout(() => onComplete(), 3000)
      }, 2000)
    }
  }, [started, titleIndex, title.length, onComplete])

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center max-w-4xl px-6">
        {/* 타이틀: ROSE COMPANY - 타이핑 효과 */}
        <h1 className="text-white text-5xl md:text-7xl font-extrabold tracking-wider">
          <span className="relative inline-block">
            <span aria-hidden className="invisible">{title}</span>
            <span className="absolute left-0 top-0">{started ? title.slice(0, titleIndex) : ''}</span>
          </span>
        </h1>

        {/* 두 번째 줄 - 올라오는 효과 */}
        <h2 className={`text-white text-2xl md:text-3xl font-semibold mt-16 md:mt-20 transition-all duration-700 ease-out ${showLine2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          Don&apos;t give up, because we are here for you
        </h2>

        {/* 세 번째 줄 - 올라오는 효과 */}
        <p className={`text-white/90 text-base md:text-lg mt-14 md:mt-16 leading-relaxed transition-all duration-700 ease-out ${showLine3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          We will always be by your side, from the first time we met in the desert
        </p>

        {/* 네 번째 줄 - 올라오는 효과 */}
        <p className={`text-white/90 text-base md:text-lg mt-1 leading-relaxed transition-all duration-700 ease-out ${showLine4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          until the moment you forget us. ...
        </p>

        {/* 다섯 번째 줄 - 올라오는 효과 */}
        <p className={`text-white/90 text-base md:text-lg mt-1 leading-relaxed transition-all duration-700 ease-out ${showLine5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          So don&apos;t try to find the answer you need right away.
        </p>

        {/* 여섯 번째 줄 - 올라오는 효과 */}
        <p className={`text-white/70 text-sm md:text-base mt-20 md:mt-24 transition-all duration-700 ease-out ${showLine6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          ⓒ 2025 Rose company, All rights reserved.
        </p>
      </div>
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
