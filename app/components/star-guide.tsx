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
      setError("별 도감 데이터를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
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
      // API의 totalPages 대신 하드코딩된 값(6)을 사용합니다
      if (page >= 0 && page < 6) {
        // 페이지 번호를 먼저 설정
        setApiPage(page)

        // 마지막 페이지(5)로 이동할 때는 API 호출을 하지 않음
        if (page < 5) {
          // 페이지 변경 시 해당 페이지의 데이터 로드
          fetchStarGuideData(page, false)
        }
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

    // 마지막 페이지(page_6)인 경우 텍스트 오버레이를 표시하지 않음
    if (apiPage === 5) {
      return null
    }

    // 한 페이지에 4개의 항목을 표시 (왼쪽 2개, 오른쪽 2개)
    const entries = guideData.starEntries

    return (
      <div className="absolute inset-0">
        {/* 페이지 제목 */}
        <div
          className="absolute font-bold text-lg"
          style={{
            top: "35px",
            left: "100px",
            color: "#f3c677",
          }}
        >
          {apiPage <= 2 ? "부정적 감정의 별" : "긍정적 감정의 별"}
        </div>

        {/* 왼쪽 페이지 - 첫 번째 별 */}
        {entries.length > 0 && (
          <>
            {/* 이미지 프레임 영역 */}
            <div className="absolute" style={{ top: "140px", left: "120px", width: "80px", height: "80px" }}>
              {/* 여기에 이미지가 들어갈 수 있음 */}
            </div>

            {/* 별 이름 (오른쪽 상단) */}
            <div className="absolute" style={{ top: "115px", left: "200px" }}>
              <p className="font-bold">{entries[0].starSource}</p>
            </div>

            {/* 설명 텍스트 */}
            <div className="absolute" style={{ top: "140px", left: "200px", width: "200px" }}>
              <p>{entries[0].description}</p>
            </div>

            {/* 별 이름 (하단) */}
            <div className="absolute" style={{ top: "210px", left: "107px" }}>
              <p className="font-bold">{entries[0].starName}</p>
            </div>
          </>
        )}

        {/* 왼쪽 페이지 - 두 번째 별 */}
        {entries.length > 1 && (
          <>
            {/* 이미지 프레임 영역 */}
            <div className="absolute" style={{ top: "340px", left: "120px", width: "80px", height: "80px" }}>
              {/* 여기에 이미지가 들어갈 수 있음 */}
            </div>

            {/* 별 이름 (오른쪽 상단) */}
            <div className="absolute" style={{ top: "295px", left: "200px" }}>
              <p className="font-bold">{entries[1].starSource}</p>
            </div>

            {/* 설명 텍스트 */}
            <div className="absolute" style={{ top: "320px", left: "200px", width: "200px" }}>
              <p>{entries[1].description}</p>
            </div>

            {/* 별 이름 (하단) */}
            <div className="absolute" style={{ top: "390px", left: "107px" }}>
              <p className="font-bold">{entries[1].starName}</p>
            </div>
          </>
        )}

        {/* 오른쪽 페이지 - 세 번째 별 */}
        {entries.length > 2 && (
          <>
            {/* 이미지 프레임 영역 */}
            <div className="absolute" style={{ top: "140px", left: "560px", width: "80px", height: "80px" }}>
              {/* 여기에 이미지가 들어갈 수 있음 */}
            </div>

            {/* 별 이름 (오른쪽 상단) */}
            <div className="absolute" style={{ top: "115px", left: "600px" }}>
              <p className="font-bold">{entries[2].starSource}</p>
            </div>

            {/* 설명 텍스트 */}
            <div className="absolute" style={{ top: "142px", left: "600px", width: "200px" }}>
              <p>{entries[2].description}</p>
            </div>

            {/* 별 이름 (하단) */}
            <div className="absolute" style={{ top: "210px", left: "510px" }}>
              <p className="font-bold">{entries[2].starName}</p>
            </div>
          </>
        )}

        {/* 오른쪽 페이지 - 네 번째 별 */}
        {entries.length > 3 && (
          <>
            {/* 이미지 프레임 영역 */}
            <div className="absolute" style={{ top: "340px", left: "560px", width: "80px", height: "80px" }}>
              {/* 여기에 이미지가 들어갈 수 있음 */}
            </div>

            {/* 별 이름 (오른쪽 상단) */}
            <div className="absolute" style={{ top: "294px", left: "600px" }}>
              <p className="font-bold">{entries[3].starSource}</p>
            </div>

            {/* 설명 텍스트 */}
            <div className="absolute" style={{ top: "320px", left: "600px", width: "200px" }}>
              <p>{entries[3].description}</p>
            </div>

            {/* 별 이름 (하단) */}
            <div className="absolute" style={{ top: "391px", left: "510px" }}>
              <p className="font-bold">{entries[3].starName}</p>
            </div>
          </>
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
    // 마지막 페이지(apiPage가 5)일 때는 page_6.png 표시
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
                {apiPage + 1} / 6
              </div>

              {/* 좌측 하단 버튼 영역 (이전 페이지) */}
              <div
                className={`absolute bottom-12 left-9 w-16 h-16 ${
                  apiPage <= 0 ? "opacity-50" : "cursor-pointer hover:bg-opacity-20 rounded-full"
                }`}
                style={{ backgroundColor: apiPage > 0 ? "rgba(139, 69, 19, 0.1)" : "transparent" }}
                onClick={() => apiPage > 0 && goToPage(apiPage - 1)}
              ></div>

              {/* 우측 하단 버튼 영역 (다음 페이지) */}
              <div
                className={`absolute bottom-12 right-9 w-16 h-16 ${
                  apiPage >= 5 // 하드코딩된 값 사용 (0부터 5까지 총 6페이지, 마지막 페이지는 6)
                    ? "opacity-50"
                    : "cursor-pointer hover:bg-opacity-20 rounded-full"
                }`}
                style={{
                  backgroundColor: apiPage < 5 ? "rgba(139, 69, 19, 0.1)" : "transparent",
                }}
                onClick={() => apiPage < 5 && goToPage(apiPage + 1)}
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
