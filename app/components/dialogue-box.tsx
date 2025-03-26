"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface DialogueBoxProps {
  text: string
  onClose: () => void
  userName: string
  position?: "center" | "bottom" // 위치 옵션 추가
  backgroundImage?: string // 배경 이미지 경로 추가
}

export default function DialogueBox({
  text,
  onClose,
  userName,
  backgroundImage = "/image/prince_text.png", // 기본값은 어린왕자 대화창
}: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [textParts, setTextParts] = useState<string[]>([])
  const [currentPartIndex, setCurrentPartIndex] = useState(0)

  // 사용자 이름 대체
  const processedText = text.replace("OOO님", `${userName}님`)

  useEffect(() => {
    // $n 구분자로 텍스트를 나눕니다
    const parts = processedText.split("$n").map((part) => part.trim())
    setTextParts(parts)

    // 첫 번째 부분부터 타이핑 효과 시작
    startTypingEffect(parts[0])
  }, [processedText])

  // 타이핑 효과 시작 함수
  const startTypingEffect = (text: string) => {
    let currentIndex = 0
    setDisplayedText("")
    setIsTyping(true)

    const typeText = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1))
        currentIndex++
        setTimeout(typeText, 50)
      } else {
        setIsTyping(false)
      }
    }

    typeText()
  }

  const handleClick = () => {
    if (isTyping) {
      // 타이핑 중이면 현재 부분의 텍스트를 모두 표시
      setDisplayedText(textParts[currentPartIndex])
      setIsTyping(false)
    } else {
      // 타이핑이 끝났으면 다음 부분으로 진행
      const nextPartIndex = currentPartIndex + 1

      if (nextPartIndex < textParts.length) {
        // 다음 부분이 있으면 표시
        setCurrentPartIndex(nextPartIndex)
        startTypingEffect(textParts[nextPartIndex])
      } else {
        // 모든 부분이 끝났으면 대화창 닫기
        onClose()
        // 대화 종료 이벤트 발생
        window.dispatchEvent(new CustomEvent("dialogueClosed"))
      }
    }
  }

  // 줄바꿈 처리 함수
  const formatText = (text: string) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ))
  }

  // 대화창 컨테이너 스타일 - 이제 부모 요소에서 위치를 결정하므로 fixed 제거
  return (
    <div className="w-full" onClick={handleClick}>
      <div className="relative w-full">
        <Image
          src={backgroundImage || "/placeholder.svg"}
          alt="Dialogue background"
          width={1200}
          height={200}
          className="w-full h-auto"
        />
        <div className="absolute inset-0 flex items-center">
          {/* 텍스트 영역을 오른쪽으로 이동하기 위해 왼쪽에 빈 공간 추가 */}
          <div className="w-1/3"></div>

          {/* 텍스트 영역 */}
          <div className="w-2/3 pr-24">
            <p className="text-white text-2xl font-bold">
              {formatText(displayedText)}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

