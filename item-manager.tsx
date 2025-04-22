// 상호작용 가능한 아이템 관리 클래스
import { collectStar, StarType, GameStage, type GameStateResponse } from "@/lib/api-config"

export interface InteractiveItem {
  id: string
  x: number
  y: number
  width: number
  height: number
  imagePath: string
  isActive: boolean
  interactionDistance: number // 상호작용 가능한 거리
  starType?: StarType // 별 타입 추가
  requiredStage?: GameStage // 아이템이 활성화되기 위한 게임 단계
  itemType?: string // 아이템 타입 추가 (book, write 등)
  hasInteracted?: boolean // 사용자가 이미 상호작용했는지 여부
}

export class ItemManager {
  private items: InteractiveItem[] = []
  private imageCache: Record<string, HTMLImageElement> = {}
  private interactionIndicator: HTMLImageElement | null = null
  private exclamationMark: HTMLImageElement | null = null // 느낌표 이미지 추가
  private isDebugMode = false // 디버그 모드 플래그
  private currentGameState: GameStateResponse | null = null

  constructor() {
    // 아이템 초기화
    this.initializeItems()
    // 상호작용 표시 이미지 로드
    this.loadInteractionIndicator()
    // 느낌표 이미지 로드
    this.loadExclamationMark()
    // 현재 게임 상태 로드
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
          // 게임 상태에 따라 아이템 활성화 상태 업데이트
          this.updateItemsVisibility()
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

  private updateItemsVisibility(): void {
    if (!this.currentGameState) return

    const currentStage = this.currentGameState.currentStage

    this.safeLog("현재 게임 단계:", currentStage)
    this.safeLog(
      "아이템 활성화 상태 업데이트 전:",
      this.items.map((item) => ({ id: item.id, isActive: item.isActive })),
    )

    // 게임 단계에 따라 아이템 활성화 상태 업데이트
    this.items.forEach((item) => {
      // 디버그 모드에서는 모든 아이템 활성화 (단, 이미 수집한 별은 제외)
      if (this.isDebugMode) {
        if (item.starType) {
          item.isActive = !this.isStarCollected(item.starType)
        } else {
          // 별이 아닌 오브젝트(book, write 등)는 항상 활성화
          item.isActive = true
        }
        return
      }

      // 별이 아닌 오브젝트(book, write 등)는 항상 활성화
      if (!item.starType) {
        item.isActive = true
        return
      }

      // 먼저 이미 수집한 별인지 확인하고, 수집했다면 비활성화
      if (this.isStarCollected(item.starType)) {
        item.isActive = false
        return
      }

      // 수집하지 않은 별에 대해 게임 단계에 따라 활성화 여부 결정
      switch (item.starType) {
        case StarType.PRIDE:
          // PRIDE는 게임 시작 시부터 활성화
          item.isActive = true
          break
        case StarType.ENVY:
          // ENVY는 PRIDE 수집 후 활성화 (DELIVER_PRIDE가 아닌 COLLECT_PRIDE 이후)
          item.isActive =
            currentStage === GameStage.COLLECT_PRIDE ||
            currentStage === GameStage.COLLECT_ENVY ||
            this.isLaterStage(currentStage, GameStage.COLLECT_PRIDE)
          break
        case StarType.LONELY:
          // LONELY는 ENVY 수집 후 활성화 (원래 조건으로 복원)
          item.isActive =
            currentStage === GameStage.DELIVER_ENVY ||
            currentStage === GameStage.COLLECT_LONELY ||
            this.isLaterStage(currentStage, GameStage.DELIVER_ENVY)
          break
        case StarType.SAD:
          // SAD는 LONELY 수집 후 활성화 (원래 조건으로 복원)
          item.isActive =
            currentStage === GameStage.DELIVER_LONELY ||
            currentStage === GameStage.COLLECT_SAD ||
            this.isLaterStage(currentStage, GameStage.DELIVER_LONELY)
          break
        default:
          // 기본적으로 비활성화
          item.isActive = false
      }
    })

    this.safeLog(
      "아이템 활성화 상태 업데이트 후:",
      this.items.map((item) => ({ id: item.id, isActive: item.isActive })),
    )
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

  // 특정 별이 이미 수집되었는지 확인 - 개선된 로직
  private isStarCollected(starType?: StarType): boolean {
    if (!starType || !this.currentGameState) return false

    const currentStage = this.currentGameState.currentStage

    switch (starType) {
      case StarType.PRIDE:
        // PRIDE는 COLLECT_PRIDE 단계 이후면 수집된 것으로 간주
        return currentStage === GameStage.COLLECT_PRIDE || this.isLaterStage(currentStage, GameStage.COLLECT_PRIDE)
      case StarType.ENVY:
        // ENVY는 COLLECT_ENVY 단계 이후면 수집된 것으로 간주
        return currentStage === GameStage.COLLECT_ENVY || this.isLaterStage(currentStage, GameStage.COLLECT_ENVY)
      case StarType.LONELY:
        // LONELY는 COLLECT_LONELY 단계 이후면 수집된 것으로 간주
        return currentStage === GameStage.COLLECT_LONELY || this.isLaterStage(currentStage, GameStage.COLLECT_LONELY)
      case StarType.SAD:
        // SAD는 COLLECT_SAD 단계 이후면 수집된 것으로 간주
        return currentStage === GameStage.COLLECT_SAD || this.isLaterStage(currentStage, GameStage.COLLECT_SAD)
      default:
        return false
    }
  }

  private initializeItems(): void {
    // 네거티브 별 아이템들 추가 (이미지에 표시된 위치에 맞게 배치)
    this.items = [
      {
        id: "negative_pride",
        x: 2230, // 이미지의 1번 위치 (오른쪽 하단)
        y: 2638,
        width: 50,
        height: 50,
        imagePath: "/image/negative_pride.png",
        isActive: true, // 초기값은 true, 나중에 게임 상태에 따라 업데이트됨
        interactionDistance: 100,
        starType: StarType.PRIDE, // 교만 별 타입 (영문 대문자로 수정)
        hasInteracted: false, // 초기값은 false
      },
      {
        id: "negative_envy",
        x: 2235, // 이미지의 2번 위치 (오른쪽 중간)
        y: 2120,
        width: 50,
        height: 50,
        imagePath: "/image/negative_envy.png",
        isActive: false, // 초기에는 비활성화
        interactionDistance: 100,
        starType: StarType.ENVY, // 질투 별 타입 (영문 대문자로 수정)
        hasInteracted: false, // 초기값은 false
      },
      {
        id: "negative_lonely",
        x: 110, // 이미지의 3번 위치 (왼쪽 중간)
        y: 2120,
        width: 50,
        height: 50,
        imagePath: "/image/negative_lonely.png",
        isActive: false, // 초기에는 비활성화
        interactionDistance: 100,
        starType: StarType.LONELY, // 외로움 별 타입 (영문 대문자로 수정)
        hasInteracted: false, // 초기값은 false
      },
      {
        id: "negative_sad",
        x: 330, // 이미지의 4번 위치 (왼쪽 상단)
        y: 620,
        width: 50,
        height: 50,
        imagePath: "/image/negative_sad.png",
        isActive: false, // 초기에는 비활성화
        interactionDistance: 100,
        starType: StarType.SAD, // 슬픔 별 타입 (영문 대문자로 수정)
        hasInteracted: false, // 초기값은 false
      },
      // 새로운 오브젝트 추가 - 별 도감 (이미지에 표시된 위치에 맞게 배치)
      {
        id: "star_book",
        x: 900, // 이미지에서 보이는 위치 (왼쪽 상단 책장 근처)
        y: 950,
        width: 60,
        height: 40,
        imagePath: "/image/book.png",
        isActive: true, // 항상 활성화
        interactionDistance: 100,
        itemType: "book", // 별 도감 타입
        hasInteracted: false, // 초기값은 false
      },
      // 의뢰 작성 오브젝트 - 펜과 종이 (이미지에서 보이는 위치에 맞게 배치)
      {
        id: "request_write",
        x: 1100, // 이미지에서 보이는 위치 (오른쪽 하단 책상 근처)
        y: 2650,
        width: 60,
        height: 40,
        imagePath: "/image/write.png",
        isActive: true, // 항상 활성화
        interactionDistance: 100,
        itemType: "write", // 의뢰 작성 타입
        hasInteracted: false, // 초기값은 false
      },
      {
        id: "request_pen",
        x: 1200, // 종이 옆에 펜 배치
        y: 2650,
        width: 40,
        height: 60,
        imagePath: "/image/pen.png",
        isActive: true, // 항상 활성화
        interactionDistance: 100,
        itemType: "pen", // 의뢰 작성 펜 타입
        hasInteracted: false, // 초기값은 false
      },
    ]
  }

  private loadInteractionIndicator(): void {
    // E키 상호작용 표시 이미지 로드 (선택 사항)
    const img = new Image()
    img.onload = () => {
      this.interactionIndicator = img
    }
    img.src = "/image/e_key.png" // E키 이미지가 있다면 사용, 없으면 텍스트로 대체
  }

  private loadExclamationMark(): void {
    // 느낌표 이미지 로드
    const img = new Image()
    img.onload = () => {
      this.exclamationMark = img
    }
    img.src = "/image/exclamation_mark.png"
  }

  // 안전한 로그 출력 함수 - 디버그 모드에서만 출력
  private safeLog(message: string, ...args: any[]): void {
    if (this.isDebugMode) {
      console.log(message, ...args)
    }
  }

  // 아이템 이미지 프리로드
  public preloadImages(): Promise<void> {
    this.safeLog("아이템 이미지 프리로드 시작...")

    // 느낌표 이미지 프리로드
    const exclamationImg = new Image()
    exclamationImg.src = "/image/exclamation_mark.png"
    this.imageCache["/image/exclamation_mark.png"] = exclamationImg

    const promises = this.items.map((item) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()

        img.onload = () => {
          this.safeLog(`아이템 이미지 로드 성공: ${item.imagePath}`)
          this.imageCache[item.imagePath] = img
          resolve()
        }

        img.onerror = (error) => {
          console.error(`아이템 이미지 로드 실패: ${item.imagePath}`, error)
          // 이미지 로드 실패 시에도 resolve 처리하여 전체 프로세스가 중단되지 않도록 함
          resolve()
        }

        // 이미지 경로에 타임스탬프 추가하여 캐싱 방지
        img.src = `${item.imagePath}?t=${Date.now()}`
        this.safeLog(`아이템 이미지 로드 시도: ${img.src}`)
      })
    })

    return Promise.all(promises)
      .then(() => {
        this.safeLog("모든 아이템 이미지 로드 프로세스 완료")
      })
      .catch((error) => {
        console.error("아이템 이미지 로드 중 오류 발생:", error)
      })
  }

  // 아이템 렌더링
  public renderItems(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    playerX: number,
    playerY: number,
  ): void {
    // 로그 출력 완전히 제거

    // 활성화된 아이템만 렌더링
    this.items
      .filter((item) => item.isActive)
      .forEach((item) => {
        const img = this.imageCache[item.imagePath]

        if (img) {
          // 이미지가 로드된 경우 렌더링
          ctx.drawImage(img, item.x + offsetX, item.y + offsetY, item.width, item.height)

          // 플레이어가 상호작용 가능한 거리에 있는지 확인
          if (this.isPlayerNearItem(playerX, playerY, item)) {
            // 상호작용 가능 표시 (E키)
            this.renderInteractionIndicator(ctx, item.x + offsetX, item.y + offsetY - 30)
          }
          // 상호작용하지 않은 오브젝트에 느낌표 표시 (별 타입이 아닌 경우만)
          else if (!item.hasInteracted && item.itemType && this.exclamationMark) {
            // 느낌표 렌더링 (아이템 위에 표시)
            ctx.drawImage(
              this.exclamationMark,
              item.x + offsetX + item.width / 2 - 10, // 아이템 중앙 위에 위치
              item.y + offsetY - 25, // 아이템 위에 위치
              20, // 느낌표 크기
              20,
            )
          }
        } else {
          // 이미지가 없는 경우 플레이스홀더 사각형 그리기
          ctx.fillStyle = "rgba(255, 255, 0, 0.5)"
          ctx.fillRect(item.x + offsetX, item.y + offsetY, item.width, item.height)
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

  // 플레이어가 아이템 근처에 있는지 확인
  public isPlayerNearItem(playerX: number, playerY: number, item: InteractiveItem): boolean {
    const distance = Math.sqrt(Math.pow(playerX - item.x, 2) + Math.pow(playerY - item.y, 2))

    return distance <= item.interactionDistance
  }

  // 플레이어가 상호작용 가능한 아이템이 있는지 확인
  public getInteractableItem(playerX: number, playerY: number): InteractiveItem | null {
    for (const item of this.items) {
      if (item.isActive && this.isPlayerNearItem(playerX, playerY, item)) {
        return item
      }
    }
    return null
  }

  // 아이템 상호작용 처리 함수 수정
  public async interactWithItem(itemId: string): Promise<void> {
    const item = this.items.find((item) => item.id === itemId)
    if (!item) return

    // 상호작용 상태 업데이트
    item.hasInteracted = true

    // 별 타입 아이템인 경우 기존 로직 사용
    if (item.starType) {
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

        console.log(`${item.id} 별 수집 API 호출 중... userId: ${userId}, starType: ${item.starType}`)
        const response = await collectStar(userId, item.starType)
        console.log("별 수집 성공:", response)

        // 응답 데이터 상세 로깅
        if (response.dialogues && response.dialogues.length > 0) {
          console.log("API 응답 대화 데이터:", response.dialogues)
          const latestDialogue = response.dialogues[response.dialogues.length - 1]
          console.log("최신 대화:", latestDialogue)
        }

        // 게임 상태 업데이트
        localStorage.setItem("gameState", JSON.stringify(response))
        this.currentGameState = response

        // 게임 상태 업데이트 이벤트 발생
        window.dispatchEvent(new CustomEvent("gameStateUpdated"))

        // 아이템 즉시 비활성화
        item.isActive = false
        this.safeLog(`아이템 ${itemId}와 상호작용 완료`)

        // 다음 아이템 활성화 (게임 상태에 따라)
        this.updateItemsVisibility()

        // 대화창 표시 (게임 컴포넌트에서 처리)
        const collectEvent = new CustomEvent("starCollected", {
          detail: { starType: item.starType, gameState: response },
        })
        window.dispatchEvent(collectEvent)
      } catch (error) {
        console.error(`별 수집 API 오류:`, error)
        if (typeof window !== "undefined") {
          alert(`별 수집 중 오류가 발생했습니다: ${error}`)
        }
      }
    }
    // 별 도감(book) 오브젝트와 상호작용
    else if (item.itemType === "book") {
      console.log("별 도감 오브젝트와 상호작용")
      // 별 도감 열기 이벤트 발생
      const openStarGuideEvent = new CustomEvent("openStarGuide")
      window.dispatchEvent(openStarGuideEvent)
    }
    // 의뢰 작성(write, pen) 오브젝트와 상호작용
    else if (item.itemType === "write" || item.itemType === "pen") {
      console.log("의뢰 작성 오브젝트와 상호작용")
      // 의뢰 작성 UI 표시 이벤트 발생
      const openWriteRequestEvent = new CustomEvent("openWriteRequest")
      window.dispatchEvent(openWriteRequestEvent)
    }

    // 상호작용 이벤트 발생
    const interactEvent = new CustomEvent("objectInteraction", {
      detail: { itemType: item.itemType, itemId: item.id },
    })
    window.dispatchEvent(interactEvent)
  }
}

// 싱글톤 인스턴스
let itemManagerInstance: ItemManager | null = null

export function getItemManager(): ItemManager {
  if (!itemManagerInstance) {
    itemManagerInstance = new ItemManager()
  }
  return itemManagerInstance
}
