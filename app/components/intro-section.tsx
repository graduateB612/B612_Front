"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function IntroSection() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [projectText, setProjectText] = useState("")
  const [b612Text, setB612Text] = useState("")
  const [roseBlinkOpacity, setRoseBlinkOpacity] = useState(0)
  const [blinkCount, setBlinkCount] = useState(0)

  const fullText = 'Fixer team - "rose"'
  const projectFull = "Project"
  const b612Full = "B 6 1 2"

  useEffect(() => {
    if (b612Text === b612Full) {
      setRoseBlinkOpacity(1)
    }
  }, [b612Text])

  useEffect(() => {
    setTypedText("")
    setProjectText("")
    setB612Text("")
    let current = 0
    // Project 타이핑
    const projectInterval = setInterval(() => {
      setProjectText(projectFull.slice(0, current + 1))
      current++
      if (current === projectFull.length) {
        clearInterval(projectInterval)
        // B612 타이핑
        let bCurrent = 0
        const bInterval = setInterval(() => {
          setB612Text(b612Full.slice(0, bCurrent + 1))
          bCurrent++
          if (bCurrent === b612Full.length) {
            clearInterval(bInterval)
            setRoseBlinkOpacity(1) // B612 타이핑이 끝날 때 장미 완전히 켜짐
            // Fixer team - "rose" 타이핑
            let tCurrent = 0
            const tInterval = setInterval(() => {
              setTypedText(fullText.slice(0, tCurrent + 1))
              tCurrent++
              if (tCurrent === fullText.length) clearInterval(tInterval)
            }, 60)
          }
        }, 120)
      }
    }, 80)
    return () => {
      clearInterval(projectInterval)
    }
  }, [])

  useEffect(() => {
    // 장미 깜빡임 + 점점 밝아지는 효과 (불 켜지듯)
    const blinkPattern = [
      { opacity: 0.1, delay: 400 },
      { opacity: 1, delay: 250 },
      { opacity: 0.1, delay: 180 },
      { opacity: 1, delay: 120 },
      { opacity: 0.1, delay: 100 },
      { opacity: 1, delay: 80 },
      { opacity: 0.3, delay: 80 },
      { opacity: 1, delay: 60 },
      { opacity: 0.6, delay: 60 },
      { opacity: 1, delay: 40 },
      { opacity: 1, delay: 40 },
    ]
    let step = 0
    let timeoutId: ReturnType<typeof setTimeout>
    const blink = () => {
      setRoseBlinkOpacity(blinkPattern[step].opacity)
      setBlinkCount(step)
      step++
      if (step >= blinkPattern.length) {
        setRoseBlinkOpacity(1)
        return
      }
      timeoutId = setTimeout(blink, blinkPattern[step].delay)
    }
    blink()
    return () => clearTimeout(timeoutId)
  }, [])

  const handleClick = () => {
    if (isNavigating) return // 중복 클릭 방지

    setIsNavigating(true)
    // 약간의 지연 후 라우팅 (애니메이션 정리 시간 확보)
    setTimeout(() => {
      router.push("/chat")
    }, 100)
  }

  return (
    <div
      className={`relative z-[3] cursor-pointer transition-transform hover:scale-110 ${isNavigating ? "opacity-70" : ""}`}
      onClick={handleClick}
      style={{ width: 400, height: 400 }}
    >
      <span className="absolute z-10 text-white text-6xl select-none" style={{ left: "-140px", top: "80px" }}>
        {projectText}
      </span>
      <span className="absolute z-10 text-white text-6xl select-none" style={{ right: "-180px", bottom: "80px" }}>
        {b612Text}
      </span>
      <Image
        src="/image/rose.png"
        alt="Rose"
        width={400}
        height={400}
        priority
        className="z-[3]"
        style={{
          opacity: roseBlinkOpacity,
          transition: roseBlinkOpacity === 1 && blinkCount >= 10 ? "opacity 0.15s" : "none",
        }}
      />
      <p className="absolute bottom-[-2rem] left-1/2 transform -translate-x-1/2 text-2xl text-white min-h-[2.5rem] w-full text-center">
        <span className="invisible whitespace-nowrap">{fullText}</span>
        <span className="absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">{typedText}</span>
      </p>
    </div>
  )
} 