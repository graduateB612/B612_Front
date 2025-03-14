"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="cursor-pointer transition-transform hover:scale-110" onClick={() => router.push("/chat")}>
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
