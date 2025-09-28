"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface StarItem {
  id: number
  src: string
  alt: string
  type: 'star' | 'emotion'
}

interface HeroSectionProps {
  noGradient?: boolean
  transparent?: boolean
  showPattern?: boolean
}

export default function HeroSection({ noGradient = false, transparent = false, showPattern = true }: HeroSectionProps) {
  const ITEM_SPACING = 180 // 아이템 간 가로 간격(px)
  const SPEED_PX_PER_SEC = 90 // 오른쪽으로 흐르는 속도
  const [offsetPx, setOffsetPx] = useState(0) // 트랙 이동량(px)
  const [isMounted, setIsMounted] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [centerX, setCenterX] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const centerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  // 별 이미지와 감정 이미지 데이터
  const starItems: StarItem[] = [
    // stars 1~7
    { id: 1, src: "/image/stars/star_1.png", alt: "별 1", type: 'star' },
    { id: 2, src: "/image/stars/star_2.png", alt: "별 2", type: 'star' },
    { id: 3, src: "/image/stars/star_3.png", alt: "별 3", type: 'star' },
    { id: 4, src: "/image/stars/star_4.png", alt: "별 4", type: 'star' },
    { id: 5, src: "/image/stars/star_5.png", alt: "별 5", type: 'star' },
    { id: 6, src: "/image/stars/star_6.png", alt: "별 6", type: 'star' },
    { id: 7, src: "/image/stars/star_7.png", alt: "별 7", type: 'star' },
    // star 8~11 (public/image)
    { id: 8, src: "/image/star_8.png", alt: "별 8", type: 'star' },
    { id: 9, src: "/image/star_9.png", alt: "별 9", type: 'star' },
    { id: 10, src: "/image/star_10.png", alt: "별 10", type: 'star' },
    { id: 11, src: "/image/star_11.png", alt: "별 11", type: 'star' },
  ]

  // 연속 마키 애니메이션 (오른쪽으로 흐름)
  useEffect(() => {
    setIsMounted(true)
    // 컨테이너 폭 측정 및 리사이즈 대응
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
        if (centerRef.current) {
          const cRect = containerRef.current.getBoundingClientRect()
          const lRect = centerRef.current.getBoundingClientRect()
          // 컨테이너 좌상단 기준 중앙선의 X 좌표(px)
          setCenterX(lRect.left - cRect.left + lRect.width / 2)
        } else {
          setCenterX(containerRef.current.clientWidth / 2)
        }
      }
    }
    measure()
    window.addEventListener('resize', measure)
    // 타이핑 등 레이아웃 변화에도 즉시 반응하도록 ResizeObserver 추가
    let ro: ResizeObserver | null = null
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => measure())
      ro.observe(containerRef.current)
    }
    const tick = (ts: number) => {
      if (lastTsRef.current == null) {
        lastTsRef.current = ts
      }
      const deltaMs = ts - lastTsRef.current
      lastTsRef.current = ts

      setOffsetPx((prev) => {
        const cycle = ITEM_SPACING * starItems.length
        const next = (prev + (SPEED_PX_PER_SEC * deltaMs) / 1000) % cycle
        return next
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', measure)
      if (ro) ro.disconnect()
    }
  }, [starItems.length])

  return (
    <div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes silhouette-glow {
          0%, 100% {
            opacity: 0.3;
            filter: brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(1000%) hue-rotate(180deg) brightness(1) contrast(1);
          }
          50% {
            opacity: 0.6;
            filter: brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(1000%) hue-rotate(180deg) brightness(1.2) contrast(1.2);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.8s ease-out forwards;
        }
        
        .animate-silhouette {
          animation: silhouette-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-line {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.6; }
        }

        @keyframes caret-blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .caret { animation: caret-blink 1s steps(1, end) infinite; }
      `}</style>
      <div className={`relative min-h-screen ${transparent ? 'bg-transparent' : (noGradient ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-900 via-gray-800 to-black')} overflow-hidden`}>
      {/* 배경 패턴 (옵션) */}
      {showPattern && !transparent && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
      )}

      {/* 별 슬라이더 컨테이너 */}
      <div className="relative w-full h-96 flex items-center justify-center mt-20" ref={containerRef}>
        {/* 가운데 분리선 효과 (은은한 프린팅 느낌) */}
        <div
          className="absolute left-1/2 top-0 bottom-0 pointer-events-none z-10"
          style={{
            width: '140px',
            background:
              'linear-gradient(90deg, rgba(34,211,238,0.4) 0%, rgba(34,211,238,0.18) 45%, rgba(34,211,238,0) 100%)',
            filter: 'blur(28px)',
            opacity: 0.5,
            animation: 'pulse-line 4s ease-in-out infinite'
          }}
        ></div>
        {/* 중앙선 코어 */}
        <div ref={centerRef} className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-cyan-300 to-cyan-400 transform -translate-x-1/2 z-20"></div>
        
        {/* 연속적인 슬라이드 컨테이너 (가장자리 투명 마스크 적용) */}
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
          }}
        >
          {/* 슬라이드되는 별들 - 왼쪽에서 시작해 오른쪽으로 흐름 (끊김 없이 루프) */}
          {isMounted && (
            <div
              className="absolute inset-y-0 left-0 flex items-center"
              style={{
                transform: `translateX(${(-ITEM_SPACING * starItems.length + (offsetPx % (ITEM_SPACING * starItems.length)))}px)`,
                transition: 'transform 0s linear',
                width: `${ITEM_SPACING * starItems.length * 2}px`
              }}
            >
              {[...starItems, ...starItems].map((item, index) => {
                // 현재 트랙 translate를 고려한 아이템 중심의 중앙선으로부터 거리
                const translateBase = -ITEM_SPACING * starItems.length + (offsetPx % (ITEM_SPACING * starItems.length))
                const itemCenterFromTrackStart = index * ITEM_SPACING + ITEM_SPACING / 2
                const itemCenterX = itemCenterFromTrackStart + translateBase
                const deltaFromCenter = itemCenterX - centerX // 0이면 정확히 중앙선

                // deltaFromCenter 부호 정보는 현재 사용하지 않음 (smoothstep 전환)

                // 중앙선 기준 전환 시작점을 미세 보정 (글로우/여백 보정)
                const REVEAL_BIAS_PX = -90
                const revealRange = Math.max(ITEM_SPACING * 0.9, containerWidth * 0.18)
                const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
                const smooth = (t: number) => t * t * (3 - 2 * t) // smoothstep
                const realProgress = (deltaFromCenter - REVEAL_BIAS_PX) / revealRange
                const realOpacity = smooth(clamp01(realProgress))
                const silhouetteOpacity = 1 - realOpacity
                const scale = 0.75 + 0.25 * realOpacity

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex-shrink-0 relative flex items-center justify-center"
                    style={{ width: `${ITEM_SPACING}px`, height: '120px', transform: 'translateY(24px)' }}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* 실루엣과 원본을 동시에 렌더하고 크로스페이드 */}
                      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center" style={{ opacity: silhouetteOpacity }}>
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                          <Image
                            src={item.src}
                            alt={item.alt}
                            width={120}
                            height={120}
                            className="object-contain object-center"
                            style={{
                              filter:
                                'brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(1000%) hue-rotate(180deg) brightness(1) contrast(1)',
                              background: 'transparent',
                              borderRadius: '8px'
                            }}
                          />
                        </div>
                      </div>
                      <Image
                        src={item.src}
                        alt={item.alt}
                        width={120}
                        height={120}
                        className="object-contain object-center"
                        style={{ opacity: realOpacity, transform: `scale(${scale})`, transition: 'opacity 120ms linear, transform 120ms linear' }}
                      />
                      
                      {item.type === 'emotion' && realOpacity > 0.85 && (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-400/30 to-purple-400/30 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 기존 좌우 오버레이 그라디언트 제거 → 투명 마스크로 대체 */}

        {/* 좌우 네비게이션 인디케이터 제거 */}
      </div>

      {/* 메인 텍스트 콘텐츠 with typing */}
      <HeroTextTyping />

      {/* 배경 별들 (장식용) - 패턴 표시 옵션에 따름 */}
      {showPattern && (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { left: 10, top: 20, delay: 0.5, duration: 2.5 },
          { left: 85, top: 15, delay: 1.2, duration: 3.0 },
          { left: 25, top: 80, delay: 0.8, duration: 2.8 },
          { left: 70, top: 60, delay: 1.5, duration: 2.2 },
          { left: 15, top: 45, delay: 0.3, duration: 3.2 },
          { left: 90, top: 30, delay: 2.0, duration: 2.7 },
          { left: 40, top: 10, delay: 1.8, duration: 2.9 },
          { left: 60, top: 85, delay: 0.7, duration: 3.1 },
          { left: 5, top: 70, delay: 1.1, duration: 2.4 },
          { left: 95, top: 75, delay: 1.9, duration: 2.6 },
          { left: 30, top: 35, delay: 0.6, duration: 3.3 },
          { left: 80, top: 50, delay: 1.4, duration: 2.1 },
          { left: 50, top: 5, delay: 2.2, duration: 2.8 },
          { left: 20, top: 90, delay: 0.9, duration: 3.0 },
          { left: 75, top: 25, delay: 1.7, duration: 2.5 },
          { left: 35, top: 65, delay: 0.4, duration: 2.9 },
          { left: 65, top: 40, delay: 1.6, duration: 2.3 },
          { left: 8, top: 55, delay: 1.3, duration: 3.1 },
          { left: 88, top: 8, delay: 2.1, duration: 2.7 },
          { left: 45, top: 95, delay: 0.2, duration: 2.4 }
        ].map((star, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          ></div>
        ))}
      </div>
      )}
      </div>
    </div>
  )
}

function HeroTextTyping() {
  const labelFull = "B612의 해결사들은 특별합니다."
  const headlineFull = "강하고, 따뜻하며, 늘 당신 곁을 지키고 있습니다."
  const [i1, setI1] = useState(0)
  const [i2, setI2] = useState(0)
  const [done, setDone] = useState(false)
  const speed = 55

  useEffect(() => {
    if (i1 < labelFull.length) {
      const t = setTimeout(() => setI1(i1 + 1), speed)
      return () => clearTimeout(t)
    }
  }, [i1])

  useEffect(() => {
    if (i1 === labelFull.length) {
      if (i2 < headlineFull.length) {
        const t = setTimeout(() => setI2(i2 + 1), speed)
        return () => clearTimeout(t)
      } else {
        setDone(true)
      }
    }
  }, [i1, i2])

  return (
    <div className="relative z-10 text-center px-4 mt-8">
      <div className="inline-block text-white text-lg md:text-xl px-6 py-3 animate-fade-in" style={{ textShadow: '0 0 8px rgba(0,0,0,0.45)' }}>
        {labelFull.slice(0, i1)}
        {i1 < labelFull.length && <span className="caret">|</span>}
      </div>
      <h2 className="mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight neon">
        <span className="relative inline-block">
          {/* 레이아웃 고정용 팬텀 텍스트 (보이지 않지만 공간 확보) */}
          <span aria-hidden className="invisible">{headlineFull}</span>
          {/* 실제 타이핑 텍스트를 겹쳐서 표시 */}
          <span className="absolute left-0 top-0">
            {headlineFull.slice(0, i2)}
            {i1 === labelFull.length && i2 < headlineFull.length && <span className="caret">|</span>}
          </span>
        </span>
      </h2>
      <div className={`mt-6 text-gray-200 max-w-3xl mx-auto px-8 py-6 leading-relaxed text-base md:text-lg transition-opacity duration-700 ${done ? 'opacity-100' : 'opacity-0'}`} style={{ textShadow: '0 0 8px rgba(0,0,0,0.45)' }}>
        그들은 우주를 유랑하고 감정들을 별로써 관리하며<br />
        어른이 되어버린 사람들에게 선물합니다.<br />
        당신의 고민을 이들에게 의뢰하세요.
      </div>
    </div>
  )
}
