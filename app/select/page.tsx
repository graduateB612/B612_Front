"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { updateGameProgress, GameStage } from "@/lib/api-config"

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

  // NPC 데이터
  const npcs: NPC[] = [
    {
      id: "prince",
      name: "어린왕자",
      image: "/image/select_prince.png",
      description: "머리가 노란 어린왕자",
      width: 200,
      height: 300,
    },
    {
      id: "rose",
      name: "장미",
      image: "/image/select_rose.png",
      description: "키가 작은 장미",
      width: 160,
      height: 240,
    },
    {
      id: "fox",
      name: "여우",
      image: "/image/select_fox.png",
      description: "꼬리가 있는 여우",
      width: 200,
      height: 300,
    },
    {
      id: "bob",
      name: "밥",
      image: "/image/select_bob.png",
      description: "나무인 바오밥",
      width: 200,
      height: 300,
    },
  ]

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

    try {
      // 로컬 스토리지에서 userId 가져오기
      const userId = localStorage.getItem("userId")
      if (!userId) {
        console.error("사용자 ID를 찾을 수 없습니다.")
        return
      }

      // 게임 진행 상태 업데이트 API 호출
      const response = await updateGameProgress(userId, {
        stage: GameStage.NPC_SELECTION,
        selectedNpc: npcId,
      })

      console.log("NPC 선택 성공:", response)

      // 게임 상태 업데이트
      localStorage.setItem("gameState", JSON.stringify(response))

      // 다음 페이지로 이동 (예: 결과 페이지로)
      window.location.href = "/result"
    } catch (error) {
      console.error("NPC 선택 실패:", error)
      alert("NPC 선택 중 오류가 발생했습니다. 다시 시도해주세요.")
      setIsSubmitting(false)
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
          <p className="text-lg">
            {selectedNPC
              ? `${npcs.find((npc) => npc.id === selectedNPC)?.name}와(과) 함께 이야기를 나눕니다...`
              : "캐릭터를 클릭하여 선택해주세요"}
          </p>
        </div>
      </div>
    </main>
  )
}
