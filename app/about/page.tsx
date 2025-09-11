"use client"

import HeroSection from "../components/hero-section"
import Header from "../components/header"
import SectionFrame from "../components/section-frame"

export default function AboutPage() {
  return (
    <div
      className="snap-y snap-mandatory h-screen overflow-y-auto relative"
      style={{ scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}
    >
      {/* About 전용 전체 화면 배경 (모든 섹션 공통) */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: 'url("/image/space-bg.png")' }}
      ></div>
      <Header />

      {/* 섹션 1: 기존 히어로 */}
      <SectionFrame withPattern>
        <HeroSection noGradient />
      </SectionFrame>

      {/* 섹션 2: 회사 소개/가치 */}
      <SectionFrame withPattern>
        <div className="max-w-4xl text-center text-gray-200 px-6">
          <h3 className="text-3xl md:text-5xl font-bold mb-6">우리는 왜 존재하나요?</h3>
          <p className="text-lg md:text-xl leading-relaxed">
            우리는 감정의 별들을 기록하고 돌보며, 길 잃은 이들에게 다시 길을 비춰줍니다.
            별은 기억이 되고, 기억은 당신을 앞으로 나아가게 합니다.
          </p>
        </div>
      </SectionFrame>

      {/* 섹션 3: 팀/연락/기타 */}
      <SectionFrame withPattern>
        <div className="max-w-4xl text-center text-gray-200 px-6">
          <h3 className="text-3xl md:text-5xl font-bold mb-6">함께 이야기해요</h3>
          <p className="text-lg md:text-xl leading-relaxed">
            협업, 제안, 혹은 궁금한 점이 있다면 언제든 연락주세요. 당신의 별을 함께 돌봅니다.
          </p>
        </div>
      </SectionFrame>
    </div>
  )
}
