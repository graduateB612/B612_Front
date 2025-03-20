// 간단한 NPC 관리 클래스 - 이미지만 표시
export interface NPC {
  id: string
  x: number
  y: number
  width: number
  height: number
  imagePath: string
}

export class NPCManager {
  private npcs: NPC[] = []
  private imageCache: Record<string, HTMLImageElement> = {}

  constructor() {
    // NPC 초기화
    this.initializeNPCs()
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
      },
      {
        id: "rose",
        x: 1150, // 중간 빨간색 영역 (이미지 중앙 부분)
        y: 2000,
        width: npcSize,
        height: npcSize,
        imagePath: "/image/npc_rose.png",
      },
      {
        id: "bob",
        x: 275, // 하단 빨간색 영역 (이미지 좌측 하단 부분)
        y: 2450,
        width: npcSize,
        height: npcSize,
        imagePath: "/image/npc_bob.png",
      },
    ]
  }

  // NPC 이미지 프리로드
  public preloadImages(): Promise<void> {
    console.log("NPC 이미지 프리로드 시작...")

    const promises = this.npcs.map((npc) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()

        img.onload = () => {
          console.log(`NPC 이미지 로드 성공: ${npc.imagePath}`)
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
        console.log(`NPC 이미지 로드 시도: ${img.src}`)
      })
    })

    return Promise.all(promises)
      .then(() => {
        console.log("모든 NPC 이미지 로드 프로세스 완료")
      })
      .catch((error) => {
        console.error("NPC 이미지 로드 중 오류 발생:", error)
      })
  }

  // NPC 렌더링
  public renderNPCs(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number): void {
    // 렌더링 시작 로그
    console.log("NPC 렌더링 시작...")

    this.npcs.forEach((npc) => {
      const img = this.imageCache[npc.imagePath]

      if (img) {
        console.log(`NPC 렌더링: ${npc.id} at (${npc.x + offsetX}, ${npc.y + offsetY})`)

        // 이미지가 로드된 경우 렌더링
        ctx.drawImage(img, npc.x + offsetX, npc.y + offsetY, npc.width, npc.height)
      } else {
        console.warn(`NPC 이미지 없음: ${npc.id} (${npc.imagePath})`)

        // 이미지가 없는 경우 플레이스홀더 사각형 그리기
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)"
        ctx.fillRect(npc.x + offsetX, npc.y + offsetY, npc.width, npc.height)

        // NPC ID 텍스트 표시
        ctx.fillStyle = "white"
        ctx.font = "16px Arial"
        ctx.fillText(npc.id, npc.x + offsetX + 10, npc.y + offsetY + 30)
      }
    })

    // 렌더링 완료 로그
    console.log("NPC 렌더링 완료")
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

