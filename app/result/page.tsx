"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { GameStateResponse } from "@/lib/api-config"

export default function ResultPage() {
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [fadeIn, setFadeIn] = useState(false)
  const [dialogueText, setDialogueText] = useState({
    title: "의뢰가 접수되었습니다!",
    content: "작성해주신 주소로 의뢰 접수 확인서와 선물을 보냈습니다.",
  })
  // 캐릭터 선택 여부는 로컬 스토리지에서 직접 확인

  useEffect(() => {
    // 로컬 스토리지에서 사용자 이름과 이메일 가져오기
    const userNameFromStorage = localStorage.getItem("userName")
    const emailFromStorage = localStorage.getItem("userEmail")
    const gameStateStr = localStorage.getItem("gameState")
    const npcId = localStorage.getItem("selectedNpcId")

    if (userNameFromStorage) {
      setUserName(userNameFromStorage)
    }

    if (emailFromStorage) {
      setEmail(emailFromStorage)
    }

    // 캐릭터별 커스텀 문구 우선 적용
    if (npcId) {
      const name = userNameFromStorage || "OO"
      const byNpc: Record<string, { title: string; content: string }> = {
        prince: {
          title: `${name}님의 소중한 의뢰 받았습니다!`,
          content: "신속하게 처리할테니 잠시만 기다려주세요.",
        },
        rose: {
          title: "당신이 써준 의뢰 잘 받았어..",
          content: "가장 먼저 해결 해줄게.\n 걱정하지말고 날 기다려 줘.",
        },
        fox: {
          title: "이게 너의 의뢰구나!",
          content: "엄청 궁금하니까 나만 보고 올게! 기다려!",
        },
        bob: {
          title: "자네만한 사람이 어떤 의뢰를 맡겼을지 기대되는군.",
          content: "잠시 기다리게.",
        },
      }
      const mapped = byNpc[npcId]
      if (mapped) {
        setDialogueText(mapped)
      }
    }

    // 게임 상태에서 대화 데이터 가져오기
    if (gameStateStr) {
      try {
        const gameState = JSON.parse(gameStateStr) as GameStateResponse

        // dialogues 배열이 있고 비어있지 않은 경우
        if (gameState.dialogues && gameState.dialogues.length > 0) {
          // 마지막 대화 가져오기
          const lastDialogue = gameState.dialogues[gameState.dialogues.length - 1]

          if (lastDialogue && lastDialogue.dialogueText) {
            // $n을 줄바꿈 문자로 변환
            const processedText = lastDialogue.dialogueText.replace(/\$n/g, "\n")

            // 대화 텍스트에 줄바꿈이 있는 경우 분리
            const textParts = processedText.split("\n")

            if (!npcId && textParts.length >= 2) {
              setDialogueText({
                title: textParts[0],
                content: textParts.slice(1).join("\n"),
              })
            } else {
              // 줄바꿈이 없는 경우 전체 텍스트를 content로 설정
              if (!npcId) {
                setDialogueText({
                  title: "의뢰가 접수되었습니다!",
                  content: processedText,
                })
              }
            }
          } else {
            // 대화 텍스트가 없는 경우 기본값 설정
            if (!npcId) {
              setDialogueText({
                title: "의뢰가 접수되었습니다!",
                content: "작성해주신 주소로 의뢰 접수 확인서와 선물을 보냈습니다.",
              })
            }
          }
        } else {
          // 대화 데이터가 없는 경우 기본값 설정
          if (!npcId) {
            setDialogueText({
              title: "의뢰가 접수되었습니다!",
              content: "작성해주신 주소로 의뢰 접수 확인서와 선물을 보냈습니다.",
            })
          }
        }
      } catch {
        // 오류 발생 시 기본값 설정
        if (!npcId) {
          setDialogueText({
            title: "의뢰가 접수되었습니다!",
            content: "작성해주신 주소로 의뢰 접수 확인서와 선물을 보냈습니다.",
          })
        }
      }
    } else {
      // 게임 상태가 없는 경우 기본값 설정
      if (!npcId) {
        setDialogueText({
          title: "의뢰가 접수되었습니다!",
          content: "작성해주신 주소로 의뢰 접수 확인서와 선물을 보냈습니다.",
        })
      }
    }

    // 페이드인 애니메이션 시작
    const timer = setTimeout(() => {
      setFadeIn(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // OOO을 사용자 이름으로 대체하는 함수
  const replaceUserName = (text: string): string => {
    return text.replace(/OOO/g, userName || "OOO")
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div
        className={`max-w-2xl w-full text-center transition-opacity duration-1000 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >

        <div className="relative mb-8 max-w-md mx-auto">
          <Image
            src="/image/text_area.png"
            alt="대화창"
            width={500}
            height={300}
            className="w-full h-auto"
            style={{ maxWidth: "500px" }}
          />

          <div className="absolute inset-0 flex flex-col justify-center items-center p-8">
            <p className="text-white text-xl mb-4">{replaceUserName(dialogueText.title)}</p>
            <p className="text-white text-lg whitespace-pre-line">{replaceUserName(dialogueText.content)}</p>
          </div>
        </div>

        <div className="text-white text-lg mb-8">
          <p>입력하신 이메일: {email || "이메일 정보가 없습니다."}</p>
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition"
        >
          처음으로 돌아가기
        </Link>
      </div>
    </main>
  )
}
