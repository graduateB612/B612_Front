"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function IntroSection() {
  const [typedText, setTypedText] = useState("")
  const [projectText, setProjectText] = useState("")
  const [b612Text, setB612Text] = useState("")
  const [roseBlinkOpacity, setRoseBlinkOpacity] = useState(0)
  const [blinkCount, setBlinkCount] = useState(0)

  const projectFull = "Project"
  const b612Full = "B612"

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

  return (
    <>
      <style jsx>{`
        @keyframes textGlow {
          0%, 100% { 
            text-shadow: 
              0 0 10px rgba(173, 216, 230, 0.4),
              0 0 20px rgba(173, 216, 230, 0.3),
              0 0 30px rgba(173, 216, 230, 0.2);
          }
          50% { 
            text-shadow: 
              0 0 20px rgba(173, 216, 230, 0.7),
              0 0 30px rgba(173, 216, 230, 0.5),
              0 0 40px rgba(173, 216, 230, 0.3);
          }
        }
        
        @keyframes textFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .text-enhanced {
          animation: textGlow 3s ease-in-out infinite, textFloat 4s ease-in-out infinite;
        }
        
        .text-enhanced-delayed {
          animation: textGlow 3s ease-in-out infinite, textFloat 4.5s ease-in-out infinite;
          animation-delay: 1s, 2s;
        }
      `}</style>
      
      <div
        className="relative z-[3]"
        style={{ width: 400, height: 400 }}
      >
        <span 
          className={`absolute z-10 text-white text-9xl select-none font-[1000] ${projectText === projectFull ? 'text-enhanced' : ''}`}
          style={{ left: "-250px", top: "20px" }}
        >
          {projectText}
        </span>
        
        <span 
          className={`absolute z-10 text-white text-9xl select-none font-[1000] ${b612Text === b612Full ? 'text-enhanced-delayed' : ''}`}
          style={{ right: "-220px", bottom: "20px" }}
        >
          {b612Text}
        </span>
        
        <Image
          src="/image/roseIcon.png"
          alt="Rose"
          width={600}
          height={600}
          priority
          className="z-[3]"
          style={{
            opacity: roseBlinkOpacity,
            transition: roseBlinkOpacity === 1 && blinkCount >= 10 ? "opacity 0.15s" : "none",
            transform: "scale(1.5)",
            transformOrigin: "center",
          }}
        />
        <p className="absolute bottom-[-2rem] left-1/2 transform -translate-x-1/2 text-2xl text-white min-h-[2.5rem] w-full text-center">
          <span className="absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">{typedText}</span>
        </p>
      </div>
    </>
  )
} 