"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"

interface ConcernModalProps {
  onSubmit: (email: string, concern: string) => void
  onClose: () => void
  userName: string
}

export default function ConcernModal({ onSubmit }: ConcernModalProps) {
  const [email, setEmail] = useState("")
  const [concern, setConcern] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      alert("이메일 주소를 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    onSubmit(email, concern)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="relative w-full max-w-md">
        {/* 배경 이미지 */}
        <div className="relative">
          <Image src="/image/text_area.png" alt="Modal background" width={500} height={600} className="w-full h-auto" />

          {/* 폼 콘텐츠 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              <div className="space-y-2">
                <label className="block text-white text-lg font-bold">당신의 주소는?</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소를 입력 해 주세요"
                  className="w-full p-2 bg-white text-black"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-white text-lg font-bold">의뢰을 작성 해 주세요!</label>
                <textarea
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  placeholder="고민이 있다면 적어주세요"
                  className="w-full h-40 p-2 bg-white text-black resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-white text-black font-bold hover:bg-gray-200 transition"
                >
                  {isSubmitting ? "제출 중..." : "제출하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
