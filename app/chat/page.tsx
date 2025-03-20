"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export default function Page() {
  const [dialogStep, setDialogStep] = useState(0)
  const [name, setName] = useState("")
  const [showNameInput, setShowNameInput] = useState(false)
  const [afterNameDialog, setAfterNameDialog] = useState<string[]>([])

  const dialogs = [
    "아! 안녕하세요. 오늘 방문 해 주시기로 한 의뢰자 분이시죠?",
    "죄송해요. 지금 사무실 안이 좀 소란스러워서요..",
    "조금만 기다려주신다면 안으로 안내 해 드리겠습니다.",
    "무슨 일이냐구요?",
    "큰 일은 아니에요. 저희가 관리하는 물건들이 쏟아져서..",
  ]

  const [showChoices, setShowChoices] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fullTextRef = useRef("")

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    if (dialogs.length > 0) {
      fullTextRef.current = dialogs[0]
      startTypingEffect(dialogs[0])
    }
  }, [])

  useEffect(() => {
    const currentText = dialogStep < dialogs.length ? dialogs[dialogStep] : afterNameDialog[dialogStep - dialogs.length]

    if (currentText) {
      fullTextRef.current = currentText
      startTypingEffect(currentText)
    }
  }, [dialogStep])

  // 타이핑 효과 시작 함수
  const startTypingEffect = (text: string) => {
    // 이전 타이머 정리
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
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
      // 타이핑이 끝났으면 다음 대화로 진행
      const totalDialogs = dialogs.length + afterNameDialog.length

      if (dialogStep < dialogs.length - 1) {
        // 기본 대화 진행
        setDialogStep((prev) => prev + 1)
      } else if (dialogStep === dialogs.length - 1) {
        // 마지막 대화 후 선택지 표시
        setShowChoices(true)
      } else if (dialogStep === dialogs.length + 1) {
        // "아, 혹시 의뢰자분 성함이 어떻게 되시나요?" 대화 후 이름 입력 모달 표시
        setShowNameInput(true)
      } else if (dialogStep < totalDialogs - 1) {
        // 이름 입력 후 대화 진행
        setDialogStep((prev) => prev + 1)
      } else if (dialogStep === totalDialogs - 1) {
        // 모든 대화가 끝난 후 페이지 이동
        setShouldRedirect(true)
      }
    }
  }

  const handleChoice = (choice: "help" | "noHelp") => {
    setShowChoices(false)

    if (choice === "help") {
      // 도와준다를 선택한 경우
      setAfterNameDialog([
        "염치없지만 정말 감사합니다.\n최선을 다해서 의뢰를 해결 해 드릴게요.",
        "아, 혹시 의뢰자분 성함이 어떻게 되시나요?",
      ])
      // 대화 시작
      setDialogStep(dialogs.length)
    } else {
      // 도와주지 않는다를 선택한 경우
      window.location.href = "/"
    }
  }

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      // 이름 입력 후 대화 설정 (기존 대화에 추가)
      const newDialogs = [
        `${name}님 반갑습니다.\n저는 해결단 '장미'의 단장 어린왕자라고 합니다.`,
        "그럼 이제 안으로 안내하겠습니다.",
        "'장미'에 어서오세요.",
      ]

      setAfterNameDialog((prev) => [...prev, ...newDialogs])
      setShowNameInput(false)
      // 이름 입력 후 다음 대화로 진행
      setDialogStep((prev) => prev + 1)
    }
  }

  // 모든 대화가 끝난 후 페이지 이동
  useEffect(() => {
    if (shouldRedirect) {
      console.log("Redirecting to play page...")
      window.location.href = "/play"
    }
  }, [shouldRedirect])

  // 줄바꿈 처리를 위한 함수 - 타이핑 효과와 함께 사용
  const formatTextWithCursor = (text: string, showCursor: boolean) => {
    if (!text) return null

    const lines = text.split("\n")
    const lastLineIndex = lines.length - 1

    return lines.map((line, i) => (
      <React.Fragment key={i}>
        {i === lastLineIndex ? (
          <span>
            {line}
            {showCursor && <span className="animate-pulse">|</span>}
          </span>
        ) : (
          line
        )}
        {i < lastLineIndex && <br />}
      </React.Fragment>
    ))
  }

  return (
    <main className="flex min-h-screen bg-white">
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl">
          <div className="flex items-end justify-center gap-8">
            <div className="w-64">
              <Image src="/image/prince_p.png" alt="Character portrait" width={256} height={256} priority />
            </div>
            <div className="relative flex-1 max-w-xl">
              <div
                className="p-6 rounded-lg border bg-white shadow-lg cursor-pointer"
                onClick={!showChoices && !showNameInput ? handleClick : undefined}
              >
                <div className="text-lg min-h-[4rem] flex flex-col justify-center">
                  {formatTextWithCursor(displayedText, isTyping)}
                </div>
              </div>

              {/* 선택지 영역 */}
              {showChoices && (
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={() => handleChoice("help")}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    도와준다
                  </button>
                  <button
                    onClick={() => handleChoice("noHelp")}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    도와주지 않는다
                  </button>
                </div>
              )}

              {/* 이름 입력 영역 */}
              {showNameInput && (
                <div className="w-full mt-4">
                  <form onSubmit={handleSubmitName} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="이름을 입력하세요"
                      className="flex-1 px-4 py-2 border rounded-lg text-black"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      확인
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

