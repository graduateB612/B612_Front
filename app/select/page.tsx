"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { completeGame } from "@/lib/api-config"

// NPC 정보 타입 정의
interface NPC {
  id: string
  name: string
  image: string
  description: string
  width: number
  height: number
}

export default function SelectPage() {
  // 애니메이션 상태
  const [animationStarted, setAnimationStarted] = useState(false)
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null)
  const [userName, setUserName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // NPC 데이터
  const npcs: NPC[] = [
    {
      id: "prince",
      name: "어린왕자",
      image: "/image/select_prince.png",
      description: "",
      width: 200,
      height: 300,
    },
    {
      id: "rose",
      name: "장미",
      image: "/image/select_rose.png",
      description: "",
      width: 160,
      height: 240,
    },
    {
      id: "fox",
      name: "여우",
      image: "/image/select_fox.png",
      description: "",
      width: 200,
      height: 300,
    },
    {
      id: "bob",
      name: "바오밥",
      image: "/image/select_bob.png",
      description: "",
      width: 200,
      height: 300,
    },
  ]

  // NPC 이름 매핑 (성공/실패 공통 사용)
  const npcNameMap: Record<string, string> = {
    prince: "어린왕자",
    rose: "장미",
    fox: "여우",
    bob: "바오밥",
  }

  // 컴포넌트 마운트 시 애니메이션 시작
  useEffect(() => {
    // 사용자 이름 가져오기
    const userNameFromStorage = localStorage.getItem("userName")
    if (userNameFromStorage) {
      setUserName(userNameFromStorage)
    }

    // 애니메이션 시작 (약간의 지연 후)
    const timer = setTimeout(() => {
      setAnimationStarted(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // NPC 선택 처리
  const handleSelectNPC = async (npcId: string) => {
    if (isSubmitting) return

    setSelectedNPC(npcId)
    setIsSubmitting(true)
    setError(null)

    try {
      // 로컬 스토리지에서 userId, 이메일, 고민 가져오기
      const userId = localStorage.getItem("userId")
      const email = localStorage.getItem("userEmail")
      const concern = localStorage.getItem("userConcern")

      if (!userId) {
        setError("사용자 ID를 찾을 수 없습니다.")
        setIsSubmitting(false)
        return
      }

      if (!email) {
        setError("이메일 정보를 찾을 수 없습니다.")
        setIsSubmitting(false)
        return
      }

      

      // 게임 완료 API 호출
      const response = await completeGame(userId, {
        email,
        concern: concern || "",
        selectedNpc: npcNameMap[npcId] || npcId,
      })

      

      // 게임 상태 업데이트
      localStorage.setItem("gameState", JSON.stringify(response))
      // 선택 캐릭터 정보를 저장하여 result 페이지에서 문구 분기
      localStorage.setItem("selectedNpcId", npcId)
      localStorage.setItem("selectedNpcName", npcNameMap[npcId] || npcId)

      // 결과 페이지로 이동
      window.location.href = "/result"
    } catch (error) {

      // 오류 메시지 표시
      let errorMessage = "요청 처리 중 오류가 발생했습니다. 다시 시도해주세요."
      if (error && typeof error === "object" && "error" in error) {
        errorMessage += ` (${error.error})`
      }

      setError(errorMessage)
      setIsSubmitting(false)

      // 오류가 발생해도 결과 페이지로 이동 (사용자 경험 개선)
      setTimeout(() => {
        // 기본 게임 상태 생성
        const fallbackGameState = {
          userId: localStorage.getItem("userId") || "",
          currentStage: "GAME_COMPLETE",
          dialogues: [
            {
              dialogueId: 1,
              npcId: 1,
              npcName: "어린왕자",
              dialogueText: "의뢰가 접수 되었습니다!\nOOO님의 작성 해 주신 주소로 의뢰주소 확인서를 보냈습니다.",
            },
          ],
        }

        // 게임 상태 저장
        localStorage.setItem("gameState", JSON.stringify(fallbackGameState))
        // 선택 캐릭터 정보도 함께 저장(실패 케이스)
        localStorage.setItem("selectedNpcId", npcId)
        localStorage.setItem("selectedNpcName", npcNameMap[npcId] || npcId)

        // 결과 페이지로 이동
        window.location.href = "/result"
      }, 3000)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-16">
          {userName ? `${userName}님, ` : ""}당신의 이야기를 들어줄 친구를 선택해주세요
        </h1>

        <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
          {npcs.map((npc, index) => (
            <div
              key={npc.id}
              className={`flex flex-col items-center transition-all duration-1000 ease-out ${
                animationStarted ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
              }`}
              style={{
                transitionDelay: `${index * 200}ms`,
              }}
            >
              <div
                className={`relative cursor-pointer transition-transform duration-300 ${
                  selectedNPC === npc.id
                    ? "scale-110 ring-4 ring-yellow-400"
                    : "hover:scale-105 hover:ring-2 hover:ring-white"
                } ${isSubmitting && selectedNPC !== npc.id ? "opacity-50" : "opacity-100"}`}
                onClick={() => !isSubmitting && handleSelectNPC(npc.id)}
                style={{
                  height: "350px",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <div style={{ width: npc.width, height: npc.height, position: "relative" }}>
                  <Image
                    src={npc.image || "/placeholder.svg"}
                    alt={npc.name}
                    fill
                    className="object-contain pixelated"
                    style={{
                      imageRendering: "pixelated",
                      objectPosition: "bottom",
                    }}
                  />
                </div>
              </div>
              <h2 className="text-xl font-bold">{npc.name}</h2>
              <p className="mt-2 text-center text-sm text-gray-300">{npc.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {isSubmitting ? (
            <p className="text-lg">처리 중입니다...</p>
          ) : (
            <p className="text-lg">
              {selectedNPC
                ? `${npcs.find((npc) => npc.id === selectedNPC)?.name}와(과) 함께 이야기를 나눕니다...`
                : "캐릭터를 클릭하여 선택해주세요."}
            </p>
            
          
          )}
          <p>각 캐릭터는 고유한 성격을 가지고 있습니다.</p>
          <p className=" text-gray-300">선택한 캐릭터에 따라 다른 답변을 받아보실 수 있습니다.</p>
        </div>
      </div>

      <style jsx global>{`
        .pixelated {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      `}</style>
    </main>
  )
}
