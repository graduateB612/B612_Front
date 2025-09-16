"use client"

import { useState, useEffect, useRef } from "react"
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

  // 타이핑 효과를 위한 참조 추가
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fullTextRef = useRef("")

  // 사용자 이름 대체
  const processedText = text.replace("OOO님", `${userName}님`)

  useEffect(() => {
    // $n 구분자로 텍스트를 나눕니다
    const parts = processedText.split("$n").map((part) => part.trim())
    setTextParts(parts)

    // 첫 번째 부분의 전체 텍스트 저장
    if (parts.length > 0) {
      fullTextRef.current = parts[0]
    }

    // 첫 번째 부분부터 타이핑 효과 시작
    startTypingEffect(parts[0])

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current)
      }
    }
  }, [processedText])

  // 타이핑 효과 시작 함수
  const startTypingEffect = (text: string) => {
    // 이전 타이머 정리
    if (typingIntervalRef.current) {
      clearTimeout(typingIntervalRef.current)
    }

    // 이전 타이핑 효과 초기화
    setDisplayedText("")
    setIsTyping(true)

    let currentIndex = 0

    // 타이핑 효과를 위한 함수
    const typeCharacter = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1))
        currentIndex++
        typingIntervalRef.current = setTimeout(typeCharacter, 50)
      } else {
        setIsTyping(false)
        typingIntervalRef.current = null
      }
    }

    // 타이핑 시작
    typeCharacter()
  }

  // 대화창 닫기 함수 수정
  const handleClick = () => {
    // 타이핑 중이면 타이핑을 완료하고, 아니면 다음 대화로 진행
    if (isTyping) {
      // 타이핑 중이면 모든 텍스트를 즉시 표시
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current)
        typingIntervalRef.current = null
      }
      setDisplayedText(fullTextRef.current)
      setIsTyping(false)
    } else {
      // 타이핑이 끝났으면 다음 부분으로 진행
      const nextPartIndex = currentPartIndex + 1

      if (nextPartIndex < textParts.length) {
        // 다음 부분이 있으면 표시
        setCurrentPartIndex(nextPartIndex)
        // 다음 부분의 전체 텍스트 저장
        fullTextRef.current = textParts[nextPartIndex]
        startTypingEffect(textParts[nextPartIndex])
      } else {
        // 모든 부분이 끝났으면 대화창 닫기
        onClose()

        // 대화 종료 이벤트 발생 - 즉시 발생하도록 수정
        window.dispatchEvent(new CustomEvent("dialogueClosed"))

        // 여우 대화인지 확인하고 여우 대화 완료 이벤트 발생
        if (backgroundImage === "/image/fox_text.png") {
          window.dispatchEvent(new CustomEvent("foxDialogueFinished"))
        }
      }
    }
  }

  // 줄바꿈 처리를 위한 함수 - 타이핑 효과와 함께 사용
  const formatTextWithCursor = (text: string, showCursor: boolean) => {
    if (!text) return null

    // Replace newline characters with spaces to keep everything on one line
    const singleLineText = text.replace(/\n/g, " ")

    return (
      <span>
        {singleLineText}
        {showCursor && <span className="animate-pulse">|</span>}
      </span>
    )
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
            <p className="text-white text-2xl font-bold">{formatTextWithCursor(displayedText, isTyping)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
