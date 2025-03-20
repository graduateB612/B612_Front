// 상호작용 가능한 아이템 관리 클래스
export interface InteractiveItem {
  id: string
  x: number
  y: number
  width: number
  height: number
  imagePath: string
  isActive: boolean
  interactionDistance: number // 상호작용 가능한 거리
}

export class ItemManager {
  private items: InteractiveItem[] = []
  private imageCache: Record<string, HTMLImageElement> = {}
  private interactionIndicator: HTMLImageElement | null = null

  constructor() {
    // 아이템 초기화
    this.initializeItems()
    // 상호작용 표시 이미지 로드
    this.loadInteractionIndicator()
  }

  private initializeItems(): void {
    // 슬픈 별 아이템 추가
    this.items = [
      {
        id: "sad_star",
        x: 330,
        y: 620,
        width: 50,
        height: 50,
        imagePath: "/image/sad_star.png",
        isActive: true,
        interactionDistance: 100, // 상호작용 가능한 거리 (픽셀)
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

  // 아이템 이미지 프리로드
  public preloadImages(): Promise<void> {
    console.log("아이템 이미지 프리로드 시작...")

    const promises = this.items.map((item) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()

        img.onload = () => {
          console.log(`아이템 이미지 로드 성공: ${item.imagePath}`)
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
        console.log(`아이템 이미지 로드 시도: ${img.src}`)
      })
    })

    return Promise.all(promises)
      .then(() => {
        console.log("모든 아이템 이미지 로드 프로세스 완료")
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

  // 아이템 상호작용 처리
  public interactWithItem(itemId: string): void {
    const item = this.items.find((item) => item.id === itemId)
    if (item) {
      item.isActive = false
      console.log(`아이템 ${itemId}와 상호작용 완료`)
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

