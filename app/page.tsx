"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FallingPetals } from "@/app/components/falling-petals"
import { useState } from "react"

export default function Home() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleClick = () => {
    if (isNavigating) return // 중복 클릭 방지
    
    setIsNavigating(true)
    // 약간의 지연 후 라우팅 (애니메이션 정리 시간 확보)
    setTimeout(() => {
      router.push("/chat")
    }, 100)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <FallingPetals />
      <div 
        className={`cursor-pointer transition-transform hover:scale-110 ${isNavigating ? 'opacity-70' : ''}`} 
        onClick={handleClick}
      >
        <Image
          src="/image/rose.png"
          alt="Rose"
          width={400}
          height={400}
          priority
        />
      </div>
      <p className="mt-4 text-lg">노크 해 주세요</p>
    </main>
  )
}