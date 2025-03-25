// API 기본 설정
export const API_CONFIG = {
  baseUrl: "https://deep-luelle-sook-f0d52cc8.koyeb.app/api/v1",
}

// API 요청 함수
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  const defaultHeaders = {
    "Content-Type": "application/json",
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  console.log("API 요청:", url, config)

  const response = await fetch(url, config)

  if (!response.ok) {
    // 응답 본문 확인 시도
    try {
      const errorBody = await response.text()
      console.error("API 오류 응답:", errorBody)
    } catch (e) {
      console.error("API 오류 응답 본문을 읽을 수 없음")
    }

    throw new Error(`API 요청 실패: ${response.status}`)
  }

  return response.json()
}

// 사용자 관련 API 함수
export async function createUser(userName: string) {
  return apiRequest<{
    id: string
    userName: string
    selectedNpc: string
    concern: string
    currentStage: string
  }>("users", {
    method: "POST",
    body: JSON.stringify({ userName }),
  })
}

// GameStage 열거형 정의
export enum GameStage {
  INTRO = "INTRO",
  GAME_START = "GAME_START",
  COLLECT_PRIDE = "COLLECT_PRIDE",
  DELIVER_PRIDE = "DELIVER_PRIDE",
  COLLECT_ENVY = "COLLECT_ENVY",
  DELIVER_ENVY = "DELIVER_ENVY",
  COLLECT_LONELY = "COLLECT_LONELY",
  DELIVER_LONELY = "DELIVER_LONELY",
  COLLECT_SAD = "COLLECT_SAD",
  DELIVER_SAD = "DELIVER_SAD",
  REQUEST_INPUT = "REQUEST_INPUT",
  NPC_SELECTION = "NPC_SELECTION",
  GAME_COMPLETE = "GAME_COMPLETE",
}

// GameStage 설명 부분을 다음과 같이 수정합니다.
export const GameStageDescription: Record<GameStage, string> = {
  [GameStage.INTRO]: "첫 화면",
  [GameStage.GAME_START]: "게임 화면 진입 완료",
  [GameStage.COLLECT_PRIDE]: "첫번째 별 수집 완료",
  [GameStage.DELIVER_PRIDE]: "첫번째 별 전달 완료",
  [GameStage.COLLECT_ENVY]: "두번째 별 수집 완료",
  [GameStage.DELIVER_ENVY]: "두번째 별 전달 완료",
  [GameStage.COLLECT_LONELY]: "세번째 별 수집 완료",
  [GameStage.DELIVER_LONELY]: "세번째 별 전달 완료",
  [GameStage.COLLECT_SAD]: "네번째 별 수집 완료",
  [GameStage.DELIVER_SAD]: "네번째 별 전달 완료",
  [GameStage.REQUEST_INPUT]: "고민 작성 완료",
  [GameStage.NPC_SELECTION]: "npc 선택 완료",
  [GameStage.GAME_COMPLETE]: "이메일 전송 완료 및 게임 클리어",
}

// DialogueResponse 타입 정의
export interface DialogueResponse {
  dialogueId: number
  npcId: number
  npcName: string
  dialogueText: string
  quest_tutorial?: string // 튜토리얼 대화 추가
}

// 게임 상태 응답 인터페이스
export interface GameStateResponse {
  userId: string
  currentStage: GameStage
  dialogues: DialogueResponse[]
}

// 게임 진행 요청 인터페이스
export interface GameProgressRequest {
  // 공통 필드
  stage?: GameStage

  // REQUEST_INPUT 단계에서 사용
  concern?: string

  // NPC_SELECTION 단계에서 사용
  selectedNpc?: string

  // 다른 단계에서 필요한 필드들
  // 예: 아이템 수집, 전달 등에 필요한 필드
  itemId?: number
  completed?: boolean
}

export async function startGame(userId: string) {
  return apiRequest<GameStateResponse>(`game/progress/${userId}/start-game`, {
    method: "POST",
  })
}

// 게임 진행 상태 업데이트 함수 (any 대신 구체적인 타입 사용)
export async function updateGameProgress(userId: string, data: GameProgressRequest) {
  return apiRequest<GameStateResponse>(`game/progress/${userId}`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// 별 타입 정의 (Java enum과 일치하도록 수정)
export enum StarType {
  LONELY = "LONELY",
  ENVY = "ENVY",
  SAD = "SAD",
  PRIDE = "PRIDE",
}

// 별 수집 API 호출 함수 수정
export async function collectStar(userId: string, starType: StarType) {
  console.log(`별 수집 API 호출: userId=${userId}, starType=${starType}`)

  // 요청 형식 수정 - 서버 측 요구사항에 맞게 조정
  return apiRequest<GameStateResponse>(`game/progress/${userId}/collect`, {
    method: "POST",
    body: JSON.stringify({ starType }),
  })
}

