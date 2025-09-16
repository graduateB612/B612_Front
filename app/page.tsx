"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import ShootingStar from "./components/shooting-star"
import TrainSection from "./components/train-section"
import PlanetSection from "./components/planet-section"
import PlanetBackground from "./components/planet-background"
import CharacterSection from "./components/character-section"
import StarBackground from "./components/star-background"
import Header from "./components/header"
import IntroSection from "./components/intro-section"
import Image from "next/image"

export default function Home() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showDoor, setShowDoor] = useState(false)
  const [showText, setShowText] = useState(true)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const totalSections = 6 // 총 섹션 수
  const [scrollLocked, setScrollLocked] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const texts = useMemo(() => [
    "여러분들은 B612 행성에 존재하는 해결단,",
    "'장미'의 고객이 되어 고민을 해결하고자 그들의 사무실로 향합니다.",
    "하지만 어째선지, 사무실 안은 어수선하기만 합니다."
  ], [])

  // 페이지 로드 시 targetSection 확인하여 해당 섹션으로 이동
  useEffect(() => {
    const targetSection = localStorage.getItem("targetSection")
    if (targetSection) {
      const sectionNumber = parseInt(targetSection, 10)
      if (sectionNumber >= 0 && sectionNumber < totalSections) {
        setCurrentSection(sectionNumber)
      }
      localStorage.removeItem("targetSection") // 사용 후 제거
    }
  }, [])

  // 섹션 참조 설정
  const addSectionRef = (el: HTMLElement | null, index: number) => {
    if (el) sectionsRef.current[index] = el
  }

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    let isScrolling = false

    const handleWheel = (e: WheelEvent) => {
      // 기차 섹션(4)에서는 아래로 스크롤을 항상 차단. (자동 이동만 허용)
      if (scrollLocked || (currentSection === 4 && e.deltaY > 0)) {
        e.preventDefault()
        return
      }
      if (isScrolling) return

      isScrolling = true

      if (e.deltaY > 0 && currentSection < totalSections - 1) {
        // 아래로 스크롤
        setCurrentSection((prev) => prev + 1)
      } else if (e.deltaY < 0 && currentSection > 0) {
        // 위로 스크롤
        setCurrentSection((prev) => prev - 1)
      }

      // 스크롤 애니메이션이 끝난 후 다시 활성화
      setTimeout(() => {
        isScrolling = false
      }, 800) // 애니메이션 시간에 맞춰 조정
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (scrollLocked || currentSection === 4) e.preventDefault()
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ["ArrowDown", "PageDown", "Space", "End"]
      const blocking = scrollLocked || currentSection === 4
      if (blocking && keys.includes(e.code)) e.preventDefault()
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentSection, totalSections, scrollLocked])

  // 현재 섹션으로 스크롤
  useEffect(() => {
    const currentSectionElement = sectionsRef.current[currentSection]
    if (currentSectionElement) {
      currentSectionElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [currentSection])

  // 커서 깜빡임 효과
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 800)
    return () => clearInterval(interval)
  }, [])

  // 섹션 변경 시 효과
  useEffect(() => {
    if (currentSection === 5) {
      setCurrentTextIndex(0)
      setDisplayText("")
      setIsTyping(true)
      setShowText(true)
      setShowDoor(false)
    }
  }, [currentSection])

  // 타이핑 효과
  useEffect(() => {
    if (currentSection === 5 && currentTextIndex < texts.length) {
      setDisplayText("")
      setIsTyping(true)
      
      const text = texts[currentTextIndex]
      let charIndex = 0
      
      const typeNextChar = () => {
        if (charIndex < text.length) {
          setDisplayText(text.slice(0, charIndex + 1))
          charIndex++
          typingTimeoutRef.current = setTimeout(typeNextChar, 50)
        } else {
          setIsTyping(false)
        }
      }
      
      typingTimeoutRef.current = setTimeout(typeNextChar, 50)
      
      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    }
  }, [currentTextIndex, currentSection, texts])

  // 마지막 섹션 클릭 핸들러
  const handleLastSectionClick = () => {
    if (currentSection === 5) {
      if (isTyping) {
        // 타이핑 중일 때는 현재 텍스트를 즉시 완성
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        setDisplayText(texts[currentTextIndex])
        setIsTyping(false)
      } else if (currentTextIndex < texts.length - 1) {
        setCurrentTextIndex(prev => prev + 1)
      } else {
        setShowText(false)
        setTimeout(() => {
          setShowDoor(true)
        }, 500)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="snap-y snap-mandatory h-screen overflow-y-auto no-scrollbar relative"
      style={{
        scrollSnapType: scrollLocked ? "none" : "y mandatory",
        scrollBehavior: "smooth",
        overflowY: scrollLocked ? "hidden" : "auto",
        height: "100vh",
      }}
    >
      {/* 하단 카피라이트 - 장미 아이콘의 중앙선에 맞춰 중앙 정렬 */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-[40]">
        <p className="text-white text-xl flex items-center text-glow">
          <span>ⓒ 2025 Rose company, All rights reserved.</span>
        </p>
      </div>
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 2s ease-in forwards;
        }

        .ripple {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.8);
          animation: ripple 2.5s ease-in-out infinite;
        }

        .ripple-2 {
          animation-delay: 0.8s;
        }

        .ripple-3 {
          animation-delay: 1.6s;
        }
      `}</style>

      {/* 별똥별 효과 컴포넌트 - 전체 페이지에 적용 */}
      <div className="fixed inset-0 z-[2] pointer-events-none">
        <ShootingStar />
      </div>

      {/* 첫 번째 섹션: 기존 내용 */}
      <section
        ref={(el) => addSectionRef(el, 0)}
        className="flex min-h-screen flex-col items-center justify-center snap-start relative"
        style={{
          backgroundImage: 'url("/image/space-bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 헤더 - 첫 번째 섹션에만 표시 */}
        {currentSection === 0 && <Header />}
        <div className="absolute inset-0 z-[1]">
          <StarBackground />
        </div>
        <IntroSection />
      </section>

      {/* 두 번째 섹션: 캐릭터 선택 */}
      <section
        ref={(el) => addSectionRef(el, 1)}
        className="flex min-h-screen flex-col items-center justify-center snap-start relative"
        style={{
          backgroundImage: 'url("/image/space-bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 z-[1]">
          <StarBackground />
        </div>
        <CharacterSection isActive={currentSection === 1} />
      </section>

      {/* 세 번째 섹션 - 행성 섹션 */}
      <section
        ref={(el) => addSectionRef(el, 2)}
        className="flex min-h-screen flex-col items-center justify-center snap-start relative"
        style={{
          backgroundImage: 'url("/image/space-bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 z-[1]">
          <StarBackground />
        </div>
        <div className="absolute inset-0 z-[5]">
          <PlanetBackground key={currentSection} isActive={currentSection === 2} />
        </div>
      </section>

      {/* 네 번째 섹션 - 행성 배경 */}
      <section
        ref={(el) => addSectionRef(el, 3)}
        className="flex min-h-screen flex-col items-center justify-center snap-start relative"
        style={{
          backgroundImage: 'url("/image/space-bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 z-[1]">
          <StarBackground />
        </div>
        <PlanetSection isActive={currentSection === 2} />
      </section>

      {/* 다섯 번째 섹션 - 열차 페이지 */}
      <section
        ref={(el) => addSectionRef(el, 4)}
        className="flex min-h-screen flex-col items-center justify-center snap-start relative"
        style={{
          backgroundImage: 'url("/image/space-bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 z-[1]">
          <StarBackground />
        </div>
        <div className="relative z-[5] w-full h-full">
          <TrainSection
            isActive={currentSection === 4}
            onTrainStart={() => setScrollLocked(true)}
            onTrainEnd={() => {
              // 기차 이동이 완전히 끝난 뒤 2초 후 섹션 이동
              setTimeout(() => {
                setScrollLocked(false)
                setCurrentSection(5)
              }, 2000)
            }}
          />
        </div>
      </section>

      {/* 여섯 번째 섹션 - 새로운 섹션 */}
      <section
        ref={(el) => addSectionRef(el, 5)}
        className="flex min-h-screen flex-col items-center justify-center snap-start relative bg-black select-none"
        onClick={handleLastSectionClick}
        style={{ 
          cursor: 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none',
          KhtmlUserSelect: 'none'
        } as React.CSSProperties}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="relative z-[5] w-full h-full flex items-center justify-center select-none" style={{ userSelect: 'none' }}>
          <div className="text-white text-center text-2xl leading-relaxed select-none" style={{ userSelect: 'none' }}>
            <div className={`mb-4 transition-opacity duration-500 ${showText ? 'opacity-100' : 'opacity-0'}`}>
              {displayText}
              {isTyping && <span className="inline-block w-0.5 h-6 bg-white ml-1 animate-pulse"></span>}
              <span className={`ml-8 transition-opacity duration-200 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
                ▼
              </span>
            </div>
            {showDoor && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-2000 opacity-0 animate-fadeIn select-none" style={{ userSelect: 'none' }}>
                <div className="relative select-none" style={{ userSelect: 'none' }}>
                  <Image
                    src="/image/door.png"
                    alt="Wooden door with vines"
                    width={400}
                    height={533}
                    priority
                    draggable={false}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  />
                  <div 
                    className="absolute select-none" 
                    style={{ 
                      top: '47%', 
                      left: '60%', 
                      transform: 'translate(-50%, -50%)', 
                      cursor: 'pointer',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                    onDragStart={(e) => e.preventDefault()}
                    onClick={() => {
                      if (!isNavigating) {
                        setIsNavigating(true)
                        setTimeout(() => {
                          router.push("/chat")
                        }, 100)
                      }
                    }}
                  >
                    <div className="ripple"></div>
                    <div className="ripple ripple-2"></div>
                    <div className="ripple ripple-3"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
