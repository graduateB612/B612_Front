"use client"

import { useState, useEffect, useRef } from "react"
import ShootingStar from "./components/shooting-star"
import TrainSection from "./components/train-section"
import PlanetSection from "./components/planet-section"
import PlanetBackground from "./components/planet-background"
import CharacterSection from "./components/character-section"
import StarBackground from "./components/star-background"
import IntroSection from "./components/intro-section"

export default function Home() {
  const [currentSection, setCurrentSection] = useState(0)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const totalSections = 5 // 총 섹션 수

  // 섹션 참조 설정
  const addSectionRef = (el: HTMLElement | null, index: number) => {
    if (el) sectionsRef.current[index] = el
  }

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    let isScrolling = false

    const handleWheel = (e: WheelEvent) => {
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

    window.addEventListener("wheel", handleWheel)

    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, [currentSection, totalSections])

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

  return (
    <div
      className="snap-y snap-mandatory h-screen overflow-y-auto relative"
      style={{
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
        overflowY: "auto",
        height: "100vh",
      }}
    >
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
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
        <PlanetSection isActive={currentSection === 3} />
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
          <TrainSection isActive={currentSection === 4} />
        </div>
      </section>
    </div>
  )
}
