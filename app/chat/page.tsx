"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export default function ChatPage() {
  const [dialogStep, setDialogStep] = useState(0)
  const [showNameModal, setShowNameModal] = useState(false)
  const [name, setName] = useState("")
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [afterNameDialog, setAfterNameDialog] = useState<string[]>([])
  const fullTextRef = useRef("")
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const typingSpeedRef = useRef(50) // 타이핑 속도 (ms)

  const dialogs = [
    "안녕하세요! 만나서 반가워요.",
    "저는 이 장미정원의 주인이에요. 여러분에게 제 이야기를 들려드리고 싶어요.",
    "그런데 먼저, 당신의 이름을 알 수 있을까요?",
  ]

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    startTypingEffect(dialogs[dialogStep])

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current)
      }
    }
  }, [])

  // 대화 단계가 변경될 때마다 타이핑 효과 시작
  useEffect(() => {
    if (dialogStep > 0) {
      // 이름 입력 후 대화인 경우
      if (afterNameDialog.length > 0 && dialogStep >= dialogs.length) {
        const afterNameIndex = dialogStep - dialogs.length
        if (afterNameIndex < afterNameDialog.length) {
          startTypingEffect(afterNameDialog[afterNameIndex])
        }
      } else {
        // 기본 대화
        startTypingEffect(dialogs[dialogStep])
      }
    }
  }, [dialogStep, afterNameDialog])

  // 타이핑 효과 시작 함수
  const startTypingEffect = (text: string) => {
    // 이전 타이머 정리
    if (typingIntervalRef.current) {
      clearTimeout(typingIntervalRef.current)
    }

    // 이전 타이핑 효과 초기화
    setDisplayedText("")
    fullTextRef.current = text
    setIsTyping(true)

    let currentIndex = 0

    // 타이핑 효과를 위한 재귀 함수
    const typeCharacter = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1))
        currentIndex++
        typingIntervalRef.current = setTimeout(typeCharacter, typingSpeedRef.current)
      } else {
        setIsTyping(false)
      }
    }

    // 타이핑 시작
    typeCharacter()
  }

  const handleClick = () => {
    // 타이핑 중이면 타이핑을 완료하고, 아니면 다음 대화로 진행
    if (isTyping) {
      // 타이핑 중이면 모든 텍스트를 즉시 표시
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current)
      }
      setDisplayedText(fullTextRef.current)
      setIsTyping(false)
    } else {
      // 타이핑이 끝났으면 다음 대화로 진행
      const totalDialogs = dialogs.length + afterNameDialog.length

      if (dialogStep < dialogs.length - 1) {
        // 기본 대화 진행
        setDialogStep((prev) => prev + 1)
      } else if (dialogStep === dialogs.length - 1) {
        // 이름 입력 모달 표시
        setShowNameModal(true)
      } else if (dialogStep < totalDialogs - 1) {
        // 이름 입력 후 대화 진행
        setDialogStep((prev) => prev + 1)
      }
      // 모든 대화가 끝난 경우 추가 로직이 필요하면 여기에 구현
    }
  }

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      // 이름 입력 후 대화 설정
      setAfterNameDialog([
        `${name}님 이시군요? 알려주셔서 감사해요.`,
        `${name}님, 저는 어린 왕자라고 해요. 작은 행성 B-612에서 왔어요.`,
        `제 행성에는 아름다운 장미꽃이 한 송이 있었어요. 그 장미꽃은 저에게 특별했죠.`,
      ])

      setShowNameModal(false)
      // 이름 입력 후 첫 번째 대화로 진행
      setDialogStep(dialogs.length)
    }
  }

  // 현재 표시할 대화 결정
  const getCurrentDialog = () => {
    if (dialogStep < dialogs.length) {
      return dialogs[dialogStep]
    } else {
      const afterNameIndex = dialogStep - dialogs.length
      if (afterNameIndex < afterNameDialog.length) {
        return afterNameDialog[afterNameIndex]
      }
      return ""
    }
  }

  return (
    <main className="flex min-h-screen bg-white p-8">
      <div className="container mx-auto flex items-center justify-center gap-8">
        <div className="w-64">
          <Image src="/image/prince_p.png" alt="Character portrait" width={256} height={256} priority />
        </div>
        <div className="flex-1 max-w-xl p-6 rounded-lg border bg-white shadow-lg cursor-pointer" onClick={handleClick}>
          <p className="text-lg min-h-[1.5rem]">
            {displayedText}
            <span className={isTyping ? "animate-pulse" : "hidden"}>|</span>
          </p>
        </div>
      </div>

      {showNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-2">당신의 이름은?</h2>
            <p className="text-gray-600 mb-4">저와 함께할 당신의 이름을 알려주세요.</p>
            <form onSubmit={handleSubmitName} className="space-y-4">
              <input
                type="text"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowNameModal(false)} className="px-4 py-2 border rounded">
                  취소
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

