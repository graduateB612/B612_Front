"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { createUser, startGame } from "@/lib/api-config"

export default function Page() {
  // 기존 상태 유지
  const [dialogStep, setDialogStep] = useState(0)
  const [name, setName] = useState("")
  const [showNameInput, setShowNameInput] = useState(false)
  const [afterNameDialog, setAfterNameDialog] = useState<string[]>([])
  const [rejectMessage, setRejectMessage] = useState<string | null>(null)

  // API 관련 상태 추가
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const dialogs = [
    "아! 안녕하세요. 오늘 방문 해 주시기로 한 의뢰자 분이시죠?",
    "죄송해요. 지금 사무실 안이 좀 소란스러워서요..",
    "조금만 기다려주신다면 안으로 안내 해 드리겠습니다.",
    "무슨 일이냐구요?",
    "큰 일은 아니에요. 저희가 관리하는 물건들이 쏟아져서..",
    "실례가 안된다면 저를 도와주시겠어요?",
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
    } else if (rejectMessage) {
      // 거절 메시지가 표시된 경우 홈으로 리다이렉트
      window.location.href = "/"
    } else {
      // 현재 대화 텍스트 가져오기
      const currentText =
        dialogStep < dialogs.length ? dialogs[dialogStep] : afterNameDialog[dialogStep - dialogs.length]

      // 타이핑이 끝났으면 다음 대화로 진행
      if (dialogStep < dialogs.length - 1) {
        // 기본 대화 진행
        setDialogStep((prev) => prev + 1)
      } else if (dialogStep === dialogs.length - 1) {
        // 마지막 대화 후 선택지 표시
        setShowChoices(true)
      } else if (currentText === "아, 혹시 의뢰자분 성함이 어떻게 되시나요?") {
        // 이름을 물어보는 대화 후에는 이름 입력창 표시
        setShowNameInput(true)
      } else if (dialogStep < dialogs.length + afterNameDialog.length - 1) {
        // 일반 대화 진행
        setDialogStep((prev) => prev + 1)
      } else {
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
        "염치없지만 정말 감사합니다.",
        "최선을 다해서 의뢰를 해결 해 드릴게요.",
        "아, 혹시 의뢰자분 성함이 어떻게 되시나요?",
      ])
      // 대화 시작
      setDialogStep(dialogs.length)
    } else {
      // 거절한다를 선택한 경우
      setRejectMessage("알겠습니다! 잠시 후 다시 방문 해 주세요!")
      startTypingEffect("알겠습니다! 잠시 후 다시 방문 해 주세요!")

      // 타이핑이 끝난 후 3초 후에 홈으로 리다이렉트
      setTimeout(() => {
        window.location.href = "/"
      }, 3000)
    }
  }

  const handleSubmitName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      // API 호출 시작
      setIsLoading(true)
      setApiError(null)

      try {
        // 중앙화된 API 함수 사용
        const userData = await createUser(name.trim())
        console.log("사용자 생성 성공:", userData)

        // 사용자 ID 저장
        setUserId(userData.id)

        // 기존 로직 유지 - 이름 입력 후 대화 설정
        const newDialogs = [
          `${name}님 반갑습니다. 저는 해결단 '장미'의 단장 어린왕자라고 합니다.`,
          "그럼 이제 안으로 안내하겠습니다.",
          "'장미'에 어서오세요.",
        ]

        // 이름 입력 전 대화와 이름 입력 후 대화를 합침
        const nameAskingIndex = afterNameDialog.findIndex((d) => d === "아, 혹시 의뢰자분 성함이 어떻게 되시나요?")
        const updatedDialogs = [...afterNameDialog.slice(0, nameAskingIndex + 1), ...newDialogs]

        setAfterNameDialog(updatedDialogs)
        setShowNameInput(false)

        // 이름 입력 후 다음 대화로 진행 (이름 물어보는 대화 다음으로)
        setDialogStep(dialogs.length + nameAskingIndex + 1)
      } catch (error) {
        console.error("API 오류:", error)
        setApiError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // 모든 대화가 끝난 후 페이지 이동
  useEffect(() => {
    const redirectToPlayPage = async () => {
      if (shouldRedirect && userId && !isRedirecting) {
        setIsRedirecting(true)
        try {
          console.log("게임 시작 API 호출 중...")
          const gameState = await startGame(userId)
          console.log("게임 시작 성공:", gameState)

          // 로컬 스토리지에 게임 상태 저장 (선택사항)
          localStorage.setItem("gameState", JSON.stringify(gameState))

          // 페이지 이동
          console.log("Redirecting to play page...")
          window.location.href = "/play"
        } catch (error) {
          console.error("게임 시작 API 오류:", error)
          // 에러가 발생해도 페이지 이동
          window.location.href = "/play"
        }
      }
    }

    redirectToPlayPage()
  }, [shouldRedirect, userId, isRedirecting])

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

  return (
    <main className="flex min-h-screen bg-white">
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl">
          <div className="flex items-end justify-center gap-8">
            <div className="w-64">
              <Image src="/image/prince_p.png" alt="Character portrait" width={256} height={256} priority />
            </div>
            <div className="relative flex-1">
              <div
                className="relative cursor-pointer flex items-center justify-center"
                onClick={!showChoices && !showNameInput ? handleClick : undefined}
              >
                <div className="w-full" style={{ minWidth: "600px" }}>
                  <Image
                    src="/image/text_bar.png"
                    alt="Dialog background"
                    width={1000}
                    height={120}
                    className="w-full h-auto"
                    style={{ minWidth: "600px" }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center px-12">
                  <div className="text-lg whitespace-nowrap">{formatTextWithCursor(displayedText, isTyping)}</div>
                </div>
              </div>

              {/* 선택지 영역 */}
              {showChoices && !rejectMessage && (
                <div className="flex justify-center gap-4 mt-4">
                  <div className="relative">
                    <Image
                      src="/image/button_bar.png"
                      alt="Help button background"
                      width={200}
                      height={60}
                      className="w-40 h-auto"
                    />
                    <button
                      onClick={() => handleChoice("help")}
                      className="absolute inset-0 flex items-center justify-center text-black hover:opacity-80 transition"
                    >
                      도와준다
                    </button>
                  </div>
                  <div className="relative">
                    <Image
                      src="/image/button_bar.png"
                      alt="Don't help button background"
                      width={200}
                      height={60}
                      className="w-40 h-auto"
                    />
                    <button
                      onClick={() => handleChoice("noHelp")}
                      className="absolute inset-0 flex items-center justify-center text-black hover:opacity-80 transition"
                    >
                      거절한다
                    </button>
                  </div>
                </div>
              )}

              {/* 이름 입력 영역 */}
              {showNameInput && (
                <div className="relative" style={{ minWidth: "600px", width: "100%" }}>
                  <form onSubmit={handleSubmitName} className="flex flex-col items-center mt-4 px-12">
                    <div className="flex w-full">
                      <input
                        type="text"
                        placeholder="이름을 입력하세요"
                        className="flex-1 px-4 py-2 border rounded-lg text-black"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                        autoFocus
                      />
                      <div className="relative ml-2">
                        <Image
                          src="/image/button_bar.png"
                          alt="Confirm button background"
                          width={120}
                          height={40}
                          className="w-24 h-auto"
                        />
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="absolute inset-0 flex items-center justify-center text-black hover:opacity-80 transition"
                        >
                          {isLoading ? "처리중" : "확인"}
                        </button>
                      </div>
                    </div>
                    {apiError && <div className="text-red-500 mt-2 text-sm">{apiError}</div>}
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

