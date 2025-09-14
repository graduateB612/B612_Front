"use client"

import Image from "next/image"
import HeroSection from "../components/hero-section"
import Header from "../components/header"
import SectionFrame from "../components/section-frame"

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
        style={{ backgroundImage: 'url("/image/space-bg.png")' }}
      ></div>
      <Header />

      {/* 섹션 1: 기존 히어로 */}
      <SectionFrame withPattern>
        <HeroSection noGradient />
      </SectionFrame>

      {/* 섹션 2: 레이아웃 + 우측 카드 이미지 배치 */}
      <SectionFrame withPattern className="items-start justify-start">
        <div className="max-w-7xl w-full px-6 pt-10 md:pt-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-start text-gray-200">
          {/* 좌측 텍스트 영역 - 시안 레이아웃 (헤드라인 박스 + 본문 박스) */}
          <div className="text-left max-w-3xl">
            <div className="block md:w-[760px] lg:w-[900px]">
              <div className="leading-tight">
                <h3 className="text-white text-4xl md:text-6xl font-extrabold">현재 당신의 삶에</h3>
                <div className="text-[#00b0f0] text-4xl md:text-6xl font-extrabold mt-3 leading-tight">
                  <span className="block">어린 왕자와, 장미와,</span>
                  <span className="block">상자 속 양이</span>
                </div>
                <h3 className="text-white text-4xl md:text-6xl font-extrabold mt-3">존재하나요?</h3>
              </div>
            </div>

            <div className="mt-16 md:mt-24 lg:mt-28 text-gray-200 text-base md:text-lg leading-relaxed">
              <p>더 이상 쓰임이 많지 않은 감정과, 단단히 굳어버린 걱정.</p>
              <p className="mt-1"><span className="text-[#00b0f0]">해결단 ‘장미’</span>에서 관리하겠습니다.</p>
              <p className="mt-1">그들은 어디에나 있으니까요.</p>
            </div>
          </div>

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
      <SectionFrame withPattern>
        <div className="w-[80%] max-w-none mx-auto px-6 md:px-8 text-gray-200">
          {/* 헤더 */}
          <div className="grid grid-cols-3 gap-x-10 items-center">
            <div></div>
            <div className="inline-block text-2xl md:text-3xl font-bold px-4 py-2">주요사항</div>
            <div className="inline-block text-2xl md:text-3xl font-bold px-4 py-2">세부사항</div>
          </div>

          {/* 행들 */}
          <div className="mt-8 border-t border-gray-700/60">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-x-10 items-center py-6 border-b border-gray-700/60">
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
            <div className="grid grid-cols-3 gap-x-10 items-center py-6 border-b border-gray-700/60">
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
            <div className="grid grid-cols-3 gap-x-10 items-center py-6 border-b border-gray-700/60">
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
            <div className="grid grid-cols-3 gap-x-10 items-center py-6 border-b border-gray-700/60 last:border-b-0">
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
