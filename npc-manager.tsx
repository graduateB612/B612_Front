// 간단한 NPC 관리 클래스 - 이미지만 표시
import { StarType, NPCInfoMap, deliverStar, type GameStateResponse, GameStage } from "@/lib/api-config"

export interface NPC {
  id: string
  x: number
  y: number
  width: number
  height: number
  imagePath: string
  interactionDistance: number // 상호작용 가능한 거리 추가
  acceptsStarType?: StarType // NPC가 받는 별 타입 추가
}

export class NPCManager {
  private npcs: NPC[] = []
  private imageCache: Record<string, HTMLImageElement> = {}
  private interactionIndicator: HTMLImageElement | null = null
  private isDebugMode = false // 디버그 모드 플래그
  private collectedStars: Set<StarType> = new Set() // 수집한 별 목록
  private deliveredStars: Set<StarType> = new Set() // 전달한 별 목록
  private currentGameState: GameStateResponse | null = null // 현재 게임 상태

  constructor() {
    // NPC 초기화
    this.initializeNPCs()
    // 상호작용 표시 이미지 로드
    this.loadInteractionIndicator()
    // 게임 상태 로드
    this.loadGameState()

    // URL 파라미터에서 디버그 모드 확인 (예: ?debug=true)
    this.isDebugMode =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "true"
  }

  private loadGameState(): void {
    // 로컬 스토리지에서 게임 상태 로드
    if (typeof window !== "undefined") {
      const gameStateStr = localStorage.getItem("gameState")
      if (gameStateStr) {
        try {
          this.currentGameState = JSON.parse(gameStateStr)
          this.safeLog("게임 상태 로드 완료:", this.currentGameState)

          // 게임 상태에서 수집한 별과 전달한 별 정보 추출
          this.updateStarStatus()
        } catch (error) {
          console.error("게임 상태 파싱 오류:", error)
        }
      }
    }

    // 게임 상태 변경 이벤트 리스너 등록
    window.addEventListener("gameStateUpdated", () => {
      this.loadGameState()
    })
  }

  private updateStarStatus(): void {
    if (!this.currentGameState) return

    const currentStage = this.currentGameState.currentStage as GameStage

    // 현재 게임 단계에 따라 수집한 별과 전달한 별 상태 업데이트
    this.collectedStars.clear()
    this.deliveredStars.clear()

    // 정확한 게임 단계 비교를 위해 GameStage enum 사용
    if (currentStage === GameStage.COLLECT_PRIDE || this.isLaterStage(currentStage, GameStage.COLLECT_PRIDE)) {
      this.collectedStars.add(StarType.PRIDE)
    }
    if (currentStage === GameStage.DELIVER_PRIDE || this.isLaterStage(currentStage, GameStage.DELIVER_PRIDE)) {
      this.deliveredStars.add(StarType.PRIDE)
    }
    if (currentStage === GameStage.COLLECT_ENVY || this.isLaterStage(currentStage, GameStage.COLLECT_ENVY)) {
      this.collectedStars.add(StarType.ENVY)
    }
    if (currentStage === GameStage.DELIVER_ENVY || this.isLaterStage(currentStage, GameStage.DELIVER_ENVY)) {
      this.deliveredStars.add(StarType.ENVY)
    }
    if (currentStage === GameStage.COLLECT_LONELY || this.isLaterStage(currentStage, GameStage.COLLECT_LONELY)) {
      this.collectedStars.add(StarType.LONELY)
    }
    if (currentStage === GameStage.DELIVER_LONELY || this.isLaterStage(currentStage, GameStage.DELIVER_LONELY)) {
      this.deliveredStars.add(StarType.LONELY)
    }
    if (currentStage === GameStage.COLLECT_SAD || this.isLaterStage(currentStage, GameStage.COLLECT_SAD)) {
      this.collectedStars.add(StarType.SAD)
    }
    if (currentStage === GameStage.DELIVER_SAD || this.isLaterStage(currentStage, GameStage.DELIVER_SAD)) {
      this.deliveredStars.add(StarType.SAD)
    }

    this.safeLog("수집한 별:", Array.from(this.collectedStars))
    this.safeLog("전달한 별:", Array.from(this.deliveredStars))
  }

  // 특정 단계가 기준 단계보다 이후인지 확인
  private isLaterStage(currentStage: GameStage, baseStage: GameStage): boolean {
    const stageOrder = [
      GameStage.INTRO,
      GameStage.GAME_START,
      GameStage.COLLECT_PRIDE,
      GameStage.DELIVER_PRIDE,
      GameStage.COLLECT_ENVY,
      GameStage.DELIVER_ENVY,
      GameStage.COLLECT_LONELY,
      GameStage.DELIVER_LONELY,
      GameStage.COLLECT_SAD,
      GameStage.DELIVER_SAD,
      GameStage.REQUEST_INPUT,
      GameStage.NPC_SELECTION,
      GameStage.GAME_COMPLETE,
    ]

    const currentIndex = stageOrder.indexOf(currentStage)
    const baseIndex = stageOrder.indexOf(baseStage)

    return currentIndex > baseIndex
  }

  private initializeNPCs(): void {
    // 이미지에 표시된 빨간색 영역에 맞게 NPC 위치 조정
    // 플레이어 크기보다 약간 작게 설정 (플레이어는 playerSize * 4 = 200px)
    const npcSize = 200 // 적절한 크기로 조정

    this.npcs = [
      {
        id: "fox",
        x: 1030, // 상단 빨간색 영역 (이미지 상단 중앙 부분)
        y: 450,
        width: npcSize,
        height: npcSize,
        imagePath: "/image/npc_fox.png",
        interactionDistance: 250,
        acceptsStarType: StarType.SAD,
      },
      {
        id: "rose",
        x: 1150, // 중간 빨간색 영역 (이미지 중앙 부분)
        y: 2000,
        width: npcSize,
        height: npcSize,
        imagePath: "/image/npc_rose.png",
        interactionDistance: 350,
        acceptsStarType: StarType.ENVY,
      },
      {
        id: "bob",
        x: 320, // 하단 빨간색 영역 (이미지 좌측 하단 부분)
        y: 2500,
        width: npcSize,
        height: npcSize,
        imagePath: "/image/npc_bob.png",
        interactionDistance: 220,
        acceptsStarType: StarType.LONELY,
      },
    ]
  }

  private loadInteractionIndicator(): void {
    // E키 상호작용 표시 이미지 로드
    const img = new Image()
    img.onload = () => {
      this.interactionIndicator = img
    }
    img.src = "/image/e_key.png"
  }

  // 안전한 로그 출력 함수 - 디버그 모드에서만 출력
  private safeLog(message: string, ...args: any[]): void {
    if (this.isDebugMode) {
      console.log(message, ...args)
    }
  }

  // NPC 이미지 프리로드
  public preloadImages(): Promise<void> {
    this.safeLog("NPC 이미지 프리로드 시작...")

    const promises = this.npcs.map((npc) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()

        img.onload = () => {
          this.safeLog(`NPC 이미지 로드 성공: ${npc.imagePath}`)
          this.imageCache[npc.imagePath] = img
          resolve()
        }

        img.onerror = (error) => {
          console.error(`NPC 이미지 로드 실패: ${npc.imagePath}`, error)
          // 이미지 로드 실패 시에도 resolve 처리하여 전체 프로세스가 중단되지 않도록 함
          resolve()
        }

        // 이미지 경로에 타임스탬프 추가하여 캐싱 방지
        img.src = `${npc.imagePath}?t=${Date.now()}`
        this.safeLog(`NPC 이미지 로드 시도: ${img.src}`)
      })
    })

    return Promise.all(promises)
      .then(() => {
        this.safeLog("모든 NPC 이미지 로드 프로세스 완료")
      })
      .catch((error) => {
        console.error("NPC 이미지 로드 중 오류 발생:", error)
      })
  }

  // NPC 렌더링
  public renderNPCs(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    playerX: number,
    playerY: number,
  ): void {
    this.npcs.forEach((npc) => {
      const img = this.imageCache[npc.imagePath]

      if (img) {
        // 이미지가 로드된 경우 렌더링
        ctx.drawImage(img, npc.x + offsetX, npc.y + offsetY, npc.width, npc.height)

        // 플레이어가 상호작용 가능한 거리에 있고, 해당 NPC가 받는 별을 수집했지만 아직 전달하지 않은 경우
        if (
          this.isPlayerNearNPC(playerX, playerY, npc) &&
          npc.acceptsStarType &&
          this.collectedStars.has(npc.acceptsStarType) &&
          !this.deliveredStars.has(npc.acceptsStarType)
        ) {
          // 상호작용 가능 표시 (E키)
          this.renderInteractionIndicator(ctx, npc.x + offsetX, npc.y + offsetY - 30)
        }
      } else {
        // 이미지가 없는 경우 플레이스홀더 사각형 그리기
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)"
        ctx.fillRect(npc.x + offsetX, npc.y + offsetY, npc.width, npc.height)

        // NPC ID 텍스트 표시
        ctx.fillStyle = "white"
        ctx.font = "16px Arial"
        ctx.fillText(npc.id, npc.x + offsetX + 10, npc.y + offsetY + 30)
      }
    })
  }

  // 상호작용 표시 렌더링
  private renderInteractionIndicator(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (this.interactionIndicator) {
      // 이미지가 있으면 이미지 사용
      ctx.drawImage(this.interactionIndicator, x, y, 30, 30)
    } else {
      // 이미지가 없으면 텍스트로 표시
      ctx.fillStyle = "white"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.fillText("E", x + 15, y + 20)

      // 원형 배경
      ctx.beginPath()
      ctx.arc(x + 15, y + 15, 15, 0, Math.PI * 2)
      ctx.strokeStyle = "white"
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  // 플레이어가 NPC 근처에 있는지 확인
  public isPlayerNearNPC(playerX: number, playerY: number, npc: NPC): boolean {
    const distance = Math.sqrt(Math.pow(playerX - npc.x, 2) + Math.pow(playerY - npc.y, 2))
    return distance <= npc.interactionDistance
  }

  // 플레이어가 상호작용 가능한 NPC가 있는지 확인
  public getInteractableNPC(playerX: number, playerY: number): NPC | null {
    for (const npc of this.npcs) {
      if (
        this.isPlayerNearNPC(playerX, playerY, npc) &&
        npc.acceptsStarType &&
        this.collectedStars.has(npc.acceptsStarType) &&
        !this.deliveredStars.has(npc.acceptsStarType)
      ) {
        return npc
      }
    }
    return null
  }

  // NPC와 상호작용 처리 함수
  public async interactWithNPC(npcId: string): Promise<void> {
    const npc = this.npcs.find((npc) => npc.id === npcId)
    if (!npc || !npc.acceptsStarType) return

    try {
      // 로컬 스토리지에서 userId 가져오기
      const userId = localStorage.getItem("userId")

      // userId가 없으면 오류 발생
      if (!userId) {
        console.error("사용자 ID를 찾을 수 없습니다.")
        console.log("localStorage 내용:", {
          userId: localStorage.getItem("userId"),
          gameState: localStorage.getItem("gameState"),
          userName: localStorage.getItem("userName"),
        })

        if (typeof window !== "undefined") {
          alert("사용자 ID를 찾을 수 없습니다. 게임을 다시 시작해주세요.")
        }
        return
      }

      // 이미 수집한 별이 있고, 아직 전달하지 않은 경우에만 처리
      if (this.collectedStars.has(npc.acceptsStarType) && !this.deliveredStars.has(npc.acceptsStarType)) {
        console.log(`${npc.id} NPC에게 ${npc.acceptsStarType} 별 전달 API 호출 중... userId: ${userId}`)
        const response = await deliverStar(userId, npc.acceptsStarType)
        console.log("별 전달 성공:", response)

        // 응답 데이터 상세 로깅
        if (response.dialogues && response.dialogues.length > 0) {
          console.log("API 응답 대화 데이터:", response.dialogues)

          // 어린왕자와 현재 NPC의 대화 찾기
          const npcDialogues = response.dialogues.filter(
            (d) => d.npcName === NPCInfoMap[npc.id]?.name || d.npcName === npc.id,
          )
          const princeDialogues = response.dialogues.filter((d) => d.npcName === "어린왕자")

          console.log("NPC 대화:", npcDialogues)
          console.log("어린왕자 대화:", princeDialogues)
        }

        // 게임 상태 업데이트
        localStorage.setItem("gameState", JSON.stringify(response))
        this.currentGameState = response

        // 별 전달 상태 업데이트
        this.deliveredStars.add(npc.acceptsStarType)

        // 게임 상태 업데이트 이벤트 발생
        window.dispatchEvent(new CustomEvent("gameStateUpdated"))

        // 대화창 표시 (게임 컴포넌트에서 처리)
        const deliverEvent = new CustomEvent("starDelivered", {
          detail: {
            npcId: npc.id,
            starType: npc.acceptsStarType,
            gameState: response,
            npcInfo: NPCInfoMap[npc.id] || null,
          },
        })
        window.dispatchEvent(deliverEvent)
      } else {
        // 별을 수집하지 않았거나 이미 전달한 경우 안내 메시지 표시
        console.log(`${npc.id} NPC에게 전달할 별이 없습니다.`)

        // 별을 수집하지 않은 경우 안내 메시지 표시
        if (!this.collectedStars.has(npc.acceptsStarType)) {
          const npcInfo = NPCInfoMap[npc.id]
          const starName = this.getStarName(npc.acceptsStarType)

          // 대화창 표시 (게임 컴포넌트에서 처리)
          const noStarEvent = new CustomEvent("noStarToDeliver", {
            detail: {
              npcId: npc.id,
              starType: npc.acceptsStarType,
              message: `${npcInfo?.name || npc.id}에게 전달할 ${starName} 별을 먼저 수집해야 합니다.`,
              npcInfo: NPCInfoMap[npc.id] || null,
            },
          })
          window.dispatchEvent(noStarEvent)
        }
        // 이미 전달한 경우 안내 메시지 표시
        else if (this.deliveredStars.has(npc.acceptsStarType)) {
          const npcInfo = NPCInfoMap[npc.id]
          const starName = this.getStarName(npc.acceptsStarType)

          // 대화창 표시 (게임 컴포넌트에서 처리)
          const alreadyDeliveredEvent = new CustomEvent("starAlreadyDelivered", {
            detail: {
              npcId: npc.id,
              starType: npc.acceptsStarType,
              message: `이미 ${npcInfo?.name || npc.id}에게 ${starName} 별을 전달했습니다.`,
              npcInfo: NPCInfoMap[npc.id] || null,
            },
          })
          window.dispatchEvent(alreadyDeliveredEvent)
        }
      }
    } catch (error) {
      console.error(`별 전달 API 오류:`, error)
      if (typeof window !== "undefined") {
        alert(`별 전달 중 오류가 발생했습니다: ${error}`)
      }
    }
  }

  // 별 타입에 따른 이름 반환
  private getStarName(starType?: StarType): string {
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
}

// 싱글톤 인스턴스
let npcManagerInstance: NPCManager | null = null

export function getNPCManager(): NPCManager {
  if (!npcManagerInstance) {
    npcManagerInstance = new NPCManager()
  }
  return npcManagerInstance
}

