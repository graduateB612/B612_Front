"use client"

import { useEffect, useState } from "react"

export default function ScrollIndicator() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-3">
      {/* Scroll 텍스트 */}
      <div className="text-white text-xl font-semibold tracking-wider neon-text">
        Scroll
      </div>

      {/* 화살표 아이콘들 */}
      <div className="relative flex flex-col gap-2">
        {/* 첫 번째 화살표 */}
        <svg
          width="60"
          height="18"
          viewBox="0 0 40 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="arrow-1"
        >
          <path
            d="M20 12L0 0H40L20 12Z"
            fill="white"
            className="arrow-fill"
          />
        </svg>

        {/* 두 번째 화살표 */}
        <svg
          width="60"
          height="18"
          viewBox="0 0 40 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="arrow-2"
        >
          <path
            d="M20 12L0 0H40L20 12Z"
            fill="white"
            className="arrow-fill"
          />
        </svg>

        {/* 세 번째 화살표 */}
        <svg
          width="60"
          height="18"
          viewBox="0 0 40 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="arrow-3"
        >
          <path
            d="M20 12L0 0H40L20 12Z"
            fill="white"
            className="arrow-fill"
          />
        </svg>
      </div>

      <style jsx>{`
        /* 네온사인 효과 (약하게) */
        .neon-text {
          text-shadow: 
            0 0 5px rgba(255, 255, 255, 0.5),
            0 0 10px rgba(255, 255, 255, 0.3),
            0 0 15px rgba(255, 255, 255, 0.2);
        }

        .arrow-fill {
          filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.4))
                  drop-shadow(0 0 6px rgba(255, 255, 255, 0.2));
        }

        /* 위에서 아래로 이동하는 애니메이션 */
        @keyframes slideDown {
          0% {
            transform: translateY(-8px);
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(8px);
            opacity: 0.3;
          }
        }

        /* 흐릿-선명-진한선명 애니메이션 */
        @keyframes fadeInOut {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }

        /* 각 화살표에 애니메이션 적용 (시차 효과) */
        .arrow-1 {
          animation: 
            slideDown 2s ease-in-out infinite,
            fadeInOut 2s ease-in-out infinite;
          animation-delay: 0s;
        }

        .arrow-2 {
          animation: 
            slideDown 2s ease-in-out infinite,
            fadeInOut 2s ease-in-out infinite;
          animation-delay: 0.3s;
        }

        .arrow-3 {
          animation: 
            slideDown 2s ease-in-out infinite,
            fadeInOut 2s ease-in-out infinite;
          animation-delay: 0.6s;
        }

        /* 호버 효과 */
        .arrow-1:hover,
        .arrow-2:hover,
        .arrow-3:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

