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
  imageUrl?: string // API에서 제공하지 않는 경우를 위한 옵션 필드
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
  // API 페이지 번호 (0부터 시작)
  const [apiPage, setApiPage] = useState(0)
  const [guideData, setGuideData] = useState<StarGuideResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDialogue, setShowDialogue] = useState(true) // 처음부터 대화창 표시
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [dialoguesCompleted, setDialoguesCompleted] = useState(false) // 대화가 모두 완료되었는지 여부

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

      // API 호출 시 페이지 번호는 그대로 사용 (API는 0부터 시작)
      const apiUrl = `${API_CONFIG.baseUrl}/interactions/${userId}/star-guide?page=${page}&includeDialogues=${includeDialogues}`

      console.log("별 도감 데이터 요청 시작:", apiUrl, "API 페이지:", page)

      // API 호출
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`)
      }

      const data: StarGuideResponse = await response.json()
      console.log("별 도감 데이터 로드 성공:", data)

      setGuideData(data)
      setApiPage(data.currentPage) // API 응답의 currentPage 저장

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
          },
          {
            entryId: 2,
            starName: "본노의 별",
            starSource: "감정: 본노에서 빚어진 별",
            description: "화가 나고 억울할 때 크게 생성. 가끔은 우리를 성장시키는 별이 되기도 해.",
          },
          {
            entryId: 3,
            starName: "슬픔의 별",
            starSource: "감정: 슬픔에서 빚어진 별",
            description: "슬프다는 건 감정이 마르지 않았다 증거라고 생각해. 그 덕에 기쁨이 더 클테니까!",
          },
          {
            entryId: 4,
            starName: "불안의 별",
            starSource: "감정: 불안함에서 빚어진 별",
            description: "적당한 불안감과 긴장은 좀 더 꼼꼼한 사람을 만들어져 한 번 성공을 하면 없어지기도 해.",
          },
        ],
        totalPages: 7,
        currentPage: page,
      }

      setGuideData(dummyData)
      setApiPage(page) // 더미 데이터의 경우 요청한 페이지를 API 페이지로 설정
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    console.log("StarGuide 컴포넌트 마운트됨, 데이터 로드 시작")
    fetchStarGuideData(0)
  }, [])

  // 대화 진행
  const handleDialogueNext = () => {
    if (!guideData || !guideData.dialogues) return

    if (currentDialogueIndex < guideData.dialogues.length - 1) {
      setCurrentDialogueIndex((prev) => prev + 1)
    } else {
      setShowDialogue(false)
      setCurrentDialogueIndex(0)
      setDialoguesCompleted(true) // 모든 대화가 완료됨
      // 대화가 완료되면 API 페이지 0의 데이터를 표시하고 이미지는 page_1.png 사용
      fetchStarGuideData(0, false)
    }
  }

  // 페이지 이동
  const goToPage = (page: number) => {
    if (dialoguesCompleted) {
      if (page >= 0 && page < (guideData?.totalPages || 1)) {
        setApiPage(page)
        // 페이지 변경 시 해당 페이지의 데이터 로드
        fetchStarGuideData(page, false)
      }
    } else {
      // 대화 중에는 첫 페이지만 표시
      fetchStarGuideData(0, true)
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
      <div className="absolute inset-0">
        {/* 페이지 제목 (첫 번째 페이지인 경우) */}
        {apiPage === 0 && (
          <div className="absolute font-bold text-lg" style={{ top: "80px", left: "100px", color: "#8B4513" }}>
            부정적 감정의 별
          </div>
        )}

        {/* 왼쪽 페이지 - 첫 번째 별 */}
        {entries.length > 0 && (
          <div className="absolute" style={{ top: "120px", left: "100px", width: "400px" }}>
            <div className="flex">
              <div className="w-24 h-24 relative">{/* 별 이미지는 배경에 있으므로 여기서는 공간만 확보 */}</div>
              <div className="ml-4">
                <p className="font-bold text-m">{entries[0].starSource}</p>
                <p className="text-sm mt-1 pr-4 leading-tight">{entries[0].description}</p>
              </div>
            </div>
            <p className="font-bold text-m mt-2" style={{ marginLeft: "8px", marginTop: "-2px" }}>
              {entries[0].starName}
            </p>
          </div>
        )}

        {/* 왼쪽 페이지 - 세 번째 별 */}
        {entries.length > 2 && (
          <div className="absolute" style={{ top: "320px", left: "100px", width: "400px" }}>
            <div className="flex">
              <div className="w-24 h-24 relative">{/* 별 이미지는 배경에 있으므로 여기서는 공간만 확보 */}</div>
              <div className="ml-4">
                <p className="font-bold text-m">{entries[2].starSource}</p>
                <p className="text-sm mt-1 pr-4 leading-tight">{entries[2].description}</p>
              </div>
            </div>
            <p className="font-bold text-m mt-2" style={{ marginLeft: "8px", marginTop: "-2px" }}>
              {entries[2].starName}
            </p>
          </div>
        )}

        {/* 오른쪽 페이지 - 두 번째 별 */}
        {entries.length > 1 && (
          <div className="absolute" style={{ top: "120px", left: "520px", width: "400px" }}>
            <div className="flex">
              <div className="w-24 h-24 relative">{/* 별 이미지는 배경에 있으므로 여기서는 공간만 확보 */}</div>
              <div className="ml-4">
                <p className="font-bold text-m">{entries[1].starSource}</p>
                <p className="text-sm mt-1 pr-4 leading-tight">{entries[1].description}</p>
              </div>
            </div>
            <p className="font-bold text-m mt-2" style={{ marginLeft: "8px", marginTop: "-2px" }}>
              {entries[1].starName}
            </p>
          </div>
        )}

        {/* 오른쪽 페이지 - 네 번째 별 */}
        {entries.length > 3 && (
          <div className="absolute" style={{ top: "320px", left: "520px", width: "400px" }}>
            <div className="flex">
              <div className="w-24 h-24 relative">{/* 별 이미지는 배경에 있으므로 여기서는 공간만 확보 */}</div>
              <div className="ml-4">
                <p className="font-bold text-m">{entries[3].starSource}</p>
                <p className="text-sm mt-1 pr-4 leading-tight">{entries[3].description}</p>
              </div>
            </div>
            <p className="font-bold text-m mt-2" style={{ marginLeft: "8px", marginTop: "-2px" }}>
              {entries[3].starName}
            </p>
          </div>
        )}

        {/* 왼쪽 페이지 - 하단 별 이름 */}
        {entries.length > 0 && (
          <div className="absolute font-bold text-m" style={{ bottom: "120px", left: "180px", color: "#8B4513" }}>
            {entries[0].starName}
          </div>
        )}

        {/* 오른쪽 페이지 - 하단 별 이름 */}
        {entries.length > 1 && (
          <div className="absolute font-bold text-m" style={{ bottom: "120px", right: "180px", color: "#8B4513" }}>
            {entries[1].starName}
          </div>
        )}
      </div>
    )
  }

  // 이미지 파일 번호 계산 (API 페이지 + 1)
  const getImagePageNumber = () => {
    // 대화 중일 때는 page_0.png 표시
    if (!dialoguesCompleted) {
      return 0
    }
    // 대화 완료 후에는 API 페이지 + 1 (API 페이지 0 -> page_1.png)
    return apiPage + 1
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
            src={`/image/page_${getImagePageNumber()}.png`}
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
              {/* 페이지 번호 표시 - API 페이지 번호 그대로 표시 */}
              <div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 font-bold"
                style={{ color: "#8B4513" }}
              >
                {apiPage + 1} / {guideData?.totalPages || 1}
              </div>

              {/* 좌측 하단 버튼 영역 (이전 페이지) */}
              <div
                className={`absolute bottom-8 left-16 w-16 h-16 ${
                  apiPage <= 0 ? "opacity-50" : "cursor-pointer hover:bg-opacity-20 rounded-full"
                }`}
                style={{ backgroundColor: apiPage > 0 ? "rgba(139, 69, 19, 0.1)" : "transparent" }}
                onClick={() => apiPage > 0 && goToPage(apiPage - 1)}
              ></div>

              {/* 우측 하단 버튼 영역 (다음 페이지) */}
              <div
                className={`absolute bottom-8 right-16 w-16 h-16 ${
                  apiPage >= (guideData?.totalPages || 1) - 1
                    ? "opacity-50"
                    : "cursor-pointer hover:bg-opacity-20 rounded-full"
                }`}
                style={{
                  backgroundColor:
                    apiPage < (guideData?.totalPages || 1) - 1 ? "rgba(139, 69, 19, 0.1)" : "transparent",
                }}
                onClick={() => apiPage < (guideData?.totalPages || 1) - 1 && goToPage(apiPage + 1)}
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
