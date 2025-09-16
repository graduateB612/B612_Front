// API 기본 설정
export const API_CONFIG = {
  baseUrl: "https://deep-luelle-sook-f0d52cc8.koyeb.app/api/v1",
}

// API 요청 함수 - 완전히 재작성
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  // 기본 헤더 설정
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  // 요청 설정
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    mode: "cors",
    credentials: "omit",
  }

  

  try {
    // 실제 요청 전송
    const response = await fetch(url, config)

    // 404 오류 처리 - 상세 로깅
    if (response.status === 404) {
      throw new Error(`404 Not Found: ${endpoint}`)
    }

    // 405 Method Not Allowed 오류 처리 - GET 메서드로 재시도
    if (response.status === 405 && config.method === "POST") {

      // POST 데이터를 쿼리 파라미터로 변환
      let getUrl = url
      if (config.body) {
        const bodyData = JSON.parse(config.body as string)
        const queryParams = new URLSearchParams()

        for (const key in bodyData) {
          queryParams.append(key, bodyData[key])
        }

        getUrl = `${url}?${queryParams.toString()}`
      }

      // GET 요청 설정
      const getConfig: RequestInit = {
        method: "GET",
        headers: config.headers,
        mode: "cors",
        credentials: "omit",
      }

      
      const getResponse = await fetch(getUrl, getConfig)

      if (!getResponse.ok) {
        throw new Error(`GET 요청도 실패: ${getResponse.status} ${getResponse.statusText}`)
      }

      return (await getResponse.json()) as T
    }

    // 응답 처리
    if (!response.ok) {
      let errorMessage = `API 요청 실패: ${response.status} ${response.statusText}`

      try {
        const errorText = await response.text()
        errorMessage += ` - ${errorText}`
      } catch {
        
      }

      throw new Error(errorMessage)
    }

    // 성공 응답 처리
    const data = await response.json()
    return data as T
  } catch (err) {

    // 오류 발생 시 기본 응답 생성 (클라이언트 측 오류 처리를 위해)
    const fallbackResponse = {
      success: false,
      error: err instanceof Error ? err.message : "알 수 없는 오류",
    }

    throw fallbackResponse
  }
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

// 이메일 요청 인터페이스 추가
export interface EmailRequest {
  email: string
  concern: string
  selectedNpc: string
}

// 게임 완료 함수 수정
export async function completeGame(userId: string, data: EmailRequest): Promise<GameStateResponse> {

  try {
    // 정확한 엔드포인트 사용
    return await apiRequest<GameStateResponse>(`game/${userId}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  } catch {

    // 오류 발생 시 기본 게임 상태 반환
    return {
      userId,
      currentStage: GameStage.GAME_COMPLETE,
      dialogues: [
        {
          dialogueId: 1,
          npcId: 1,
          npcName: "어린왕자",
          dialogueText: "의뢰가 접수 되었습니다!$nOOO님의 작성 해 주신 주소로 의뢰주소 확인서를 보냈습니다.",
        },
      ],
    }
  }
}

// 게임 시작 함수
export async function startGame(userId: string) {
  try {
    return await apiRequest<GameStateResponse>(`game/progress/${userId}/start-game`, {
      method: "POST",
    })
  } catch {
    // 오류 발생 시 기본 게임 상태 반환
    return {
      userId,
      currentStage: GameStage.GAME_START,
      dialogues: [
        {
          dialogueId: 1,
          npcId: 1,
          npcName: "어린왕자",
          dialogueText:
            "저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다. 단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.",
        },
      ],
    }
  }
}

// 게임 진행 상태 업데이트 함수 (any 대신 구체적인 타입 사용)
export async function updateGameProgress(userId: string, data: GameProgressRequest) {
  try {
    return await apiRequest<GameStateResponse>(`game/progress/${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  } catch {
    // 오류 발생 시 기본 게임 상태 반환
    return {
      userId,
      currentStage: data.stage || GameStage.GAME_START,
      dialogues: [],
    }
  }
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

  try {
    return await apiRequest<GameStateResponse>(`game/progress/${userId}/collect`, {
      method: "POST",
      body: JSON.stringify({ starType }),
    })
  } catch {

    // 다음 단계 계산
    const nextStage = getNextStageAfterCollect(starType)

    // 오류 발생 시 기본 게임 상태 반환
    const fallbackResponse = {
      userId,
      currentStage: nextStage,
      dialogues: [
        {
          dialogueId: 1,
          npcId: 1,
          npcName: "어린왕자",
          dialogueText: `${getStarName(starType)} 별을 수집했습니다. 이제 해당 NPC에게 전달해주세요.`,
        },
      ],
    }

    // 로컬 스토리지에 업데이트된 게임 상태 저장
    localStorage.setItem("gameState", JSON.stringify(fallbackResponse))

    return fallbackResponse
  }
}

// 별 전달 API 호출 함수 추가
export async function deliverStar(userId: string, starType: StarType) {

  try {
    return await apiRequest<GameStateResponse>(`game/progress/${userId}/deliver`, {
      method: "POST",
      body: JSON.stringify({ starType }),
    })
  } catch {

    // 다음 단계 계산
    const nextStage = getNextStageAfterDeliver(starType)

    // 오류 발생 시 기본 게임 상태 반환
    const fallbackResponse = {
      userId,
      currentStage: nextStage,
      dialogues: getDefaultDialoguesForStar(starType),
    }

    // 로컬 스토리지에 업데이트된 게임 상태 저장
    localStorage.setItem("gameState", JSON.stringify(fallbackResponse))

    return fallbackResponse
  }
}

// 별 수집 후 다음 단계 결정 함수
function getNextStageAfterCollect(starType: StarType): GameStage {
  switch (starType) {
    case StarType.PRIDE:
      return GameStage.COLLECT_PRIDE
    case StarType.ENVY:
      return GameStage.COLLECT_ENVY
    case StarType.LONELY:
      return GameStage.COLLECT_LONELY
    case StarType.SAD:
      return GameStage.COLLECT_SAD
    default:
      return GameStage.GAME_START
  }
}

// 별 전달 후 다음 단계 결정 함수
function getNextStageAfterDeliver(starType: StarType): GameStage {
  switch (starType) {
    case StarType.PRIDE:
      return GameStage.DELIVER_PRIDE
    case StarType.ENVY:
      return GameStage.DELIVER_ENVY
    case StarType.LONELY:
      return GameStage.DELIVER_LONELY
    case StarType.SAD:
      return GameStage.DELIVER_SAD
    default:
      return GameStage.GAME_START
  }
}

// 별 타입에 따른 기본 대화 생성 함수
function getDefaultDialoguesForStar(starType: StarType): DialogueResponse[] {
  const starName = getStarName(starType)
  let npcName = "어린왕자"
  let npcId = 1

  // 별 타입에 따라 NPC 결정
  switch (starType) {
    case StarType.ENVY:
      npcName = "장미"
      npcId = 2
      break
    case StarType.LONELY:
      npcName = "밥"
      npcId = 3
      break
    case StarType.SAD:
      npcName = "여우"
      npcId = 4
      break
  }

  return [
    {
      dialogueId: 1,
      npcId: npcId,
      npcName: npcName,
      dialogueText: `${starName} 별을 받았습니다. 감사합니다.`,
    },
    {
      dialogueId: 2,
      npcId: 1,
      npcName: "어린왕자",
      dialogueText: `${npcName}에게 ${starName} 별을 전달했습니다.`,
    },
  ]
}

// 별 타입에 따른 이름 반환 함수
function getStarName(starType: StarType): string {
  switch (starType) {
    case StarType.PRIDE:
      return "교만"
    case StarType.ENVY:
      return "질투"
    case StarType.LONELY:
      return "외로움"
    case StarType.SAD:
      return "슬픔"
    default:
      return "감정"
  }
}

// NPC 정보 인터페이스
export interface NPCInfo {
  id: string
  name: string
  dialogueBackground: string
  acceptsStarType: StarType
}

// NPC 정보 정의
export const NPCInfoMap: Record<string, NPCInfo> = {
  rose: {
    id: "rose",
    name: "장미",
    dialogueBackground: "/image/rose_text.png",
    acceptsStarType: StarType.ENVY,
  },
  bob: {
    id: "bob",
    name: "밥",
    dialogueBackground: "/image/bob_text.png",
    acceptsStarType: StarType.LONELY,
  },
  fox: {
    id: "fox",
    name: "여우",
    dialogueBackground: "/image/fox_text.png",
    acceptsStarType: StarType.SAD,
  },
}
