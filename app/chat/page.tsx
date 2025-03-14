"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"

export default function ChatPage() {
  const [dialogStep, setDialogStep] = useState(0)
  const [showNameModal, setShowNameModal] = useState(false)
  const [name, setName] = useState("")

  const dialogs = [
    "안녕하세요! 만나서 반가워요.",
    "저는 이 장미정원의 주인이에요. 여러분에게 제 이야기를 들려드리고 싶어요.",
    "그런데 먼저, 당신의 이름을 알 수 있을까요?",
  ]

  const handleClick = () => {
    if (dialogStep < dialogs.length - 1) {
      setDialogStep((prev) => prev + 1)
    } else {
      setShowNameModal(true)
    }
  }

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      setShowNameModal(false)
      // 여기에 추가 대화 로직 구현
    }
  }

  return (
    <main className="flex min-h-screen bg-white p-8">
      <div className="container mx-auto flex items-center justify-center gap-8">
        <div className="w-64">
          <Image src="/image/prince_p.png" alt="Character portrait" width={256} height={256} priority />
        </div>
        <div className="flex-1 max-w-xl p-6 rounded-lg border bg-white shadow-lg cursor-pointer" onClick={handleClick}>
          <p className="text-lg">{dialogs[dialogStep]}</p>
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

