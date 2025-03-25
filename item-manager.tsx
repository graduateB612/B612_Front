// 상호작용 가능한 아이템 관리 클래스
import { collectStar, StarType } from "@/lib/api-config"

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
}

export class ItemManager {
  private items: InteractiveItem[] = []
  private imageCache: Record<string, HTMLImageElement> = {}
  private interactionIndicator: HTMLImageElement | null = null
  private isDebugMode = false // 디버그 모드 플래그

  constructor() {
    // 아이템 초기화
    this.initializeItems()
    // 상호작용 표시 이미지 로드
    this.loadInteractionIndicator()

    // URL 파라미터에서 디버그 모드 확인 (예: ?debug=true)
    this.isDebugMode =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "true"
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
        isActive: true,
        interactionDistance: 100,
        starType: StarType.PRIDE, // 교만 별 타입 (영문 대문자로 수정)
      },
      {
        id: "negative_envy",
        x: 2235, // 이미지의 2번 위치 (��른쪽 중간)
        y: 2120,
        width: 50,
        height: 50,
        imagePath: "/image/negative_envy.png",
        isActive: true,
        interactionDistance: 100,
        starType: StarType.ENVY, // 질투 별 타입 (영문 대문자로 수정)
      },
      {
        id: "negative_lonely",
        x: 110, // 이미지의 3번 위치 (왼쪽 중간)
        y: 2120,
        width: 50,
        height: 50,
        imagePath: "/image/negative_lonely.png",
        isActive: true,
        interactionDistance: 100,
        starType: StarType.LONELY, // 외로움 별 타입 (영문 대문자로 수정)
      },
      {
        id: "negative_sad",
        x: 330, // 이미지의 4번 위치 (왼쪽 상단)
        y: 620,
        width: 50,
        height: 50,
        imagePath: "/image/negative_sad.png",
        isActive: true,
        interactionDistance: 100,
        starType: StarType.SAD, // 슬픔 별 타입 (영문 대문자로 수정)
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

  // 안전한 로그 출력 함수 - 디버그 모드에서만 출력
  private safeLog(message: string, ...args: any[]): void {
    if (this.isDebugMode) {
      console.log(message, ...args)
    }
  }

  // 아이템 이미지 프리로드
  public preloadImages(): Promise<void> {
    this.safeLog("아이템 이미지 프리로드 시작...")

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
    if (item && item.starType) {
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

        // 아이템 비활성화
        item.isActive = false
        this.safeLog(`아이템 ${itemId}와 상호작용 완료`)

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

