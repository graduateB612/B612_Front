"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { API_CONFIG } from "@/lib/api-config"

// API 응답 타입 정의 수정
interface DialogueResponse {
  dialogueId: number
  npcId: number
  npcName: string
  dialogueText: string
}

// StarEntry 타입 수정 - API 응답 형식에 맞게
interface StarGuideEntry {
  entryId: number
  starName: string
  starSource: string
  description: string
  imageUrl?: string // API에서 제공하지 않는 경우を 위한 옵션 필드
}

interface StarGuideResponse {
  dialogues: DialogueResponse[]
  starEntries: StarGuideEntry[]
  totalPages: number
  currentPage: number
}

interface StarGuideProps {
  onClose?: () => void
}

export default function StarGuide({ onClose }: StarGuideProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [guideData, setGuideData] = useState<StarGuideResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDialogue, setShowDialogue] = useState(true) // 처음부터 대화창 표시
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [dialoguesCompleted, setDialoguesCompleted] = useState(false) // 대화가 모두 완료되었는지 여부

  // 별 이미지 매핑 - 별 이름에 따라 이미지 경로 결정
  const getStarImageByName = (starName: string): string => {
    const nameToImageMap: Record<string, string> = {
      "교만의 별": "/image/negative_pride.png",
      "질투의 별": "/image/negative_envy.png",
      "외로움의 별": "/image/negative_lonely.png",
      "슬픔의 별": "/image/negative_sad.png",
      "욕망의 별": "/image/negative_desire.png", // 추가 이미지
      "의심의 별": "/image/negative_doubt.png", // 추가 이미지
      "불안의 별": "/image/negative_anxiety.png", // 추가 이미지
    }

    return nameToImageMap[starName] || "/image/default_star.png"
  }

  // 별 도감 데이터 가져오기
  const fetchStarGuideData = async (page = 0, includeDialogues = true) => {
    setLoading(true)
    setError(null)

    try {
      // 로컬 스토리지에서 userId 가져오기
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setError("사용자 ID를 찾을 수 없습니다.")
        setLoading(false)
        return
      }

      // 정확한 API 엔드포인트 사용
      const apiUrl = `${API_CONFIG.baseUrl}/interactions/${userId}/star-guide?page=${page}&includeDialogues=${includeDialogues}`

      console.log("별 도감 데이터 요청 시작:", apiUrl)

      // API 호출
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`)
      }

      const data: StarGuideResponse = await response.json()
      console.log("별 도감 데이터 로드 성공:", data)

      // 이미지 URL 추가
      if (data.starEntries) {
        data.starEntries = data.starEntries.map((entry) => ({
          ...entry,
          imageUrl: getStarImageByName(entry.starName),
        }))
      }

      setGuideData(data)

      // 첫 페이지이고 대화가 있으면 대화 표시
      if (page === 0 && includeDialogues && data.dialogues && data.dialogues.length > 0) {
        setShowDialogue(true)
        setDialoguesCompleted(false)
        setCurrentDialogueIndex(0)
      }
    } catch (err) {
      console.error("별 도감 데이터 로드 실패:", err)

      // 로컬 스토리지에서 userId 가져오기
      const userId = localStorage.getItem("userId")
      const apiUrl = `${API_CONFIG.baseUrl}/interactions/${userId}/star-guide?page=${page}&includeDialogues=${includeDialogues}`
      console.error("API 요청 URL:", apiUrl)

      setError("별 도감 데이터를 불러오는 중 오류가 발생했습니다.")

      // 개발 중에는 더미 데이터 사용
      const dummyData = {
        dialogues: [
          {
            dialogueId: 1,
            npcId: 4,
            npcName: "여우",
            dialogueText:
              "감정들은 종류가 다양해!. 하지만 그 중 자주 느낄 수 있고, 우리에게 친숙한 감정들만 별의 모습을 갖추고 있어.",
          },
          {
            dialogueId: 2,
            npcId: 4,
            npcName: "여우",
            dialogueText:
              "우리! 부정적 감정의 별과 긍정적 감정의 별로 나누어서 관리해. 도감의 초반은 부정적 감정의 별을 구경 할 수 있어.",
          },
          {
            dialogueId: 3,
            npcId: 4,
            npcName: "여우",
            dialogueText: "음... 그건 아니라 생각해! 아름다운 별과 감정은 어두운 곳에서 비로소 탄생하니까?",
          },
          {
            dialogueId: 4,
            npcId: 4,
            npcName: "여우",
            dialogueText: "아무튼 재미있게 구경해!",
          },
        ],
        starEntries: [
          {
            entryId: 1,
            starName: "교만의 별",
            starSource: "감정: 교만함에서 빚어진 별",
            description: "잘 달래 준다면 자신감이 넘치는 에너지로도 자란지도 몰라!",
            imageUrl: "/image/negative_pride.png",
          },
          {
            entryId: 2,
            starName: "질투의 별",
            starSource: "감정: 질투에서 빚어진 별",
            description: "질투가 아름다운 순간이 존재한다면 믿을까? 사랑의 감정을 고귀하게 탄생시켜주는 별이야.",
            imageUrl: "/image/negative_envy.png",
          },
          {
            entryId: 3,
            starName: "슬픔의 별",
            starSource: "감정: 슬픔에서 빚어진 별",
            description: "슬픔은 건 감정이 마르지 않았다 죽은 증거라고 생각해. 그 덕에 기쁨이 더 클테니까!",
            imageUrl: "/image/negative_sad.png",
          },
          {
            entryId: 4,
            starName: "외로움의 별",
            starSource: "감정: 외로움에서 빚어진 별",
            description: "외로움은 내 주변을 바라보게 해. 그런 뒤 누군가가 있다면... 그 순간을 훨씬 더 기쁘게 해주지!",
            imageUrl: "/image/negative_lonely.png",
          },
        ],
        totalPages: 7,
        currentPage: 0,
      }

      setGuideData(dummyData)
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    console.log("StarGuide 컴포넌트 마운트됨, 데이터 로드 시작")
    fetchStarGuideData(currentPage)
  }, [currentPage])

  // 대화 진행
  const handleDialogueNext = () => {
    if (!guideData || !guideData.dialogues) return

    if (currentDialogueIndex < guideData.dialogues.length - 1) {
      setCurrentDialogueIndex((prev) => prev + 1)
    } else {
      setShowDialogue(false)
      setCurrentDialogueIndex(0)
      setDialoguesCompleted(true) // 모든 대화가 완료됨
      setCurrentPage(1) // 대화가 완료되면 자동으로 page_1.png로 이동
    }
  }

  // 페이지 이동
  const goToPage = (page: number) => {
    if (dialoguesCompleted) {
      if (page >= 1 && page <= (guideData?.totalPages || 1)) {
        setCurrentPage(page)
        // 페이지 변경 시 해당 페이지의 데이터 로드
        fetchStarGuideData(page, false)
      }
    } else {
      // 대화 중에는 page_0만 표시
      setCurrentPage(0)
    }
  }

  // 도감 닫기
  const closeGuide = () => {
    if (onClose) {
      onClose()
    }
  }

  // 별 항목 렌더링 함수
  const renderStarEntries = () => {
    if (!guideData || !guideData.starEntries || guideData.starEntries.length === 0) {
      return null
    }

    // 한 페이지에 4개의 항목을 표시 (왼쪽 2개, 오른쪽 2개)
    const entries = guideData.starEntries

    return (
      <div className="absolute inset-0 flex">
        {/* 왼쪽 페이지 */}
        <div className="w-1/2 p-8 pt-16">
          {entries.length > 0 && (
            <div className="mb-12 ml-24 mt-16">
              <div className="mb-2">
                <p className="text-amber-800 font-bold">{entries[0].starSource}</p>
                <p className="text-amber-900 text-sm mt-1">{entries[0].description}</p>
              </div>
              <p className="text-center text-amber-800 font-bold mt-2">{entries[0].starName}</p>
            </div>
          )}

          {entries.length > 2 && (
            <div className="ml-24 mt-16">
              <div className="mb-2">
                <p className="text-amber-800 font-bold">{entries[2].starSource}</p>
                <p className="text-amber-900 text-sm mt-1">{entries[2].description}</p>
              </div>
              <p className="text-center text-amber-800 font-bold mt-2">{entries[2].starName}</p>
            </div>
          )}
        </div>

        {/* 오른쪽 페이지 */}
        <div className="w-1/2 p-8 pt-16">
          {entries.length > 1 && (
            <div className="mb-12 ml-24 mt-16">
              <div className="mb-2">
                <p className="text-amber-800 font-bold">{entries[1].starSource}</p>
                <p className="text-amber-900 text-sm mt-1">{entries[1].description}</p>
              </div>
              <p className="text-center text-amber-800 font-bold mt-2">{entries[1].starName}</p>
            </div>
          )}

          {entries.length > 3 && (
            <div className="ml-24 mt-16">
              <div className="mb-2">
                <p className="text-amber-800 font-bold">{entries[3].starSource}</p>
                <p className="text-amber-900 text-sm mt-1">{entries[3].description}</p>
              </div>
              <p className="text-center text-amber-800 font-bold mt-2">{entries[3].starName}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={closeGuide}></div>

      {/* 도감 컨테이너 */}
      <div className="relative w-full max-w-4xl">
        {/* 도감 이미지 */}
        <div className="relative">
          <Image
            src={`/image/page_${currentPage}.png`}
            alt="별 도감"
            width={1200}
            height={800}
            className="w-full h-auto"
          />

          {/* 별 정보 오버레이 - 대화가 완료된 후에만 표시 */}
          {dialoguesCompleted && renderStarEntries()}

          {/* 페이지 네비게이션 - 대화가 완료된 후에만 표시 */}
          {dialoguesCompleted && (
            <>
              {/* 페이지 번호 표시 */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-amber-800 font-bold">
                {currentPage} / {guideData?.totalPages || 1}
              </div>

              {/* 좌측 하단 버튼 영역 (이전 페이지) */}
              <div
                className={`absolute bottom-8 left-16 w-16 h-16 ${
                  currentPage <= 1 ? "opacity-50" : "cursor-pointer hover:bg-amber-800 hover:bg-opacity-20 rounded-full"
                }`}
                onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
              ></div>

              {/* 우측 하단 버튼 영역 (다음 페이지) */}
              <div
                className={`absolute bottom-8 right-16 w-16 h-16 ${
                  currentPage >= (guideData?.totalPages || 1)
                    ? "opacity-50"
                    : "cursor-pointer hover:bg-amber-800 hover:bg-opacity-20 rounded-full"
                }`}
                onClick={() => currentPage < (guideData?.totalPages || 1) && goToPage(currentPage + 1)}
              ></div>
            </>
          )}

          {/* 로딩 표시 */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="text-white">로딩 중...</div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-red-500 text-white p-4 rounded">{error}</div>
            </div>
          )}
        </div>

        {/* 대화창 - 크기 증가 및 스타일 수정, 텍스트 영역 조정 */}
        {showDialogue && guideData && guideData.dialogues && guideData.dialogues.length > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0"
            onClick={handleDialogueNext}
            style={{
              backgroundImage: `url('${currentDialogueIndex === 0 ? "/image/prince_text.png" : "/image/fox_text.png"}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "280px", // 높이 증가
              display: "flex",
              alignItems: "center",
              padding: `0 40px 0 ${currentDialogueIndex === 0 ? "240px" : "240px"}`, // 왼쪽 여백 조정
              marginBottom: "20px", // 하단 여백 추가
            }}
          >
            {/* 대화 내용 */}
            <div className="flex-1">
              <p className="text-white text-xl whitespace-pre-line">
                {guideData.dialogues[currentDialogueIndex].dialogueText.replace(/\$n/g, "\n")}
              </p>
            </div>
          </div>
        )}

        {/* 닫기 버튼 */}
        <button
          onClick={closeGuide}
          className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full"
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          X
        </button>
      </div>
    </div>
  )
}
