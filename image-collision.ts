// 이미지 기반 충돌 감지 클래스
export class ImageCollisionMap {
  private collisionData: boolean[][] = []
  private width = 0
  private height = 0
  private loaded = false

  constructor() {}

  // 이미지 URL에서 충돌 맵 로드
  async loadFromImage(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          console.error("Canvas context could not be created")
          this.loaded = false
          resolve(false)
          return
        }

        this.width = img.width
        this.height = img.height

        canvas.width = this.width
        canvas.height = this.height

        // 이미지를 캔버스에 그리기
        ctx.drawImage(img, 0, 0)

        // 픽셀 데이터 가져오기
        const imageData = ctx.getImageData(0, 0, this.width, this.height)
        const pixelData = imageData.data

        // 충돌 맵 배열 초기화
        this.collisionData = Array(this.height)
          .fill(0)
          .map(() => Array(this.width).fill(false))

        // 첫 몇 개 픽셀의 색상 값 로깅 (디버깅용)
        console.log("이미지 크기:", this.width, "x", this.height)
        console.log("첫 10x10 픽셀의 색상 값:")
        let foundColorPixels = 0

        // 파란색 픽셀(이동 가능 영역)만 true로 설정
        // #1870B9 (RGB: 24, 112, 185) 색상 감지
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (y * this.width + x) * 4

            // 첫 10x10 픽셀의 색상 값 로깅
            if (y < 10 && x < 10) {
              console.log(
                `픽셀(${x},${y}): R=${pixelData[idx]}, G=${pixelData[idx + 1]}, B=${pixelData[idx + 2]}, A=${pixelData[idx + 3]}`,
              )
            }

            // #1870B9 (RGB: 24, 112, 185) 색상 감지 - 넓은 범위 적용
            const r = pixelData[idx]
            const g = pixelData[idx + 1]
            const b = pixelData[idx + 2]
            const a = pixelData[idx + 3]

            // 알파 채널이 0이 아닌 경우에만 확인 (투명하지 않은 픽셀)
            if (a > 0) {
              // 색상 범위를 넓게 설정 (±20)
              if (Math.abs(r - 24) <= 20 && Math.abs(g - 112) <= 20 && Math.abs(b - 185) <= 20) {
                this.collisionData[y][x] = true
                foundColorPixels++

                // 처음 발견된 몇 개의 픽셀 위치 로깅
                if (foundColorPixels <= 5) {
                  console.log(`발견된 #1870B9 픽셀: (${x}, ${y}), 정확한 색상: R=${r}, G=${g}, B=${b}`)
                }
              }
            }
          }
        }

        // 파란색 픽셀 수 계산
        let bluePixelCount = 0
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            if (this.collisionData[y][x]) {
              bluePixelCount++
            }
          }
        }
        console.log(`이동 가능한 픽셀 수: ${bluePixelCount} / ${this.width * this.height}`)
        console.log(`#1870B9 색상 픽셀 발견 수: ${foundColorPixels}`)

        // 이동 가능한 픽셀이 없으면 경고
        if (bluePixelCount === 0) {
          console.warn("경고: 이동 가능한 픽셀이 발견되지 않았습니다! 색상 감지 로직을 확인하세요.")

          // 대안으로 다른 파란색 계열 감지 시도
          console.log("대안 색상 감지 시도 중...")
          let alternativeFound = 0

          for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
              const idx = (y * this.width + x) * 4

              // 일반적인 파란색 계열 감지
              if (
                pixelData[idx] < 50 && // R: 낮음
                pixelData[idx + 1] > 80 &&
                pixelData[idx + 1] < 150 && // G: 중간
                pixelData[idx + 2] > 150 // B: 높음
              ) {
                this.collisionData[y][x] = true
                alternativeFound++

                // 처음 발견된 몇 개의 픽셀 위치 로깅
                if (alternativeFound <= 5) {
                  console.log(
                    `대안 파란색 픽셀: (${x}, ${y}), 색상: R=${pixelData[idx]}, G=${pixelData[idx + 1]}, B=${pixelData[idx + 2]}`,
                  )
                }
              }
            }
          }

          console.log(`대안 파란색 픽셀 발견 수: ${alternativeFound}`)
        }

        this.loaded = true
        resolve(true)
      }

      img.onerror = (error) => {
        console.error(`Failed to load collision map from URL: ${imageUrl}`, error)
        this.loaded = false
        resolve(false)
      }

      img.src = imageUrl
    })
  }

  // 특정 위치가 이동 가능한지 확인
  isWalkable(x: number, y: number): boolean {
    if (!this.loaded) return false

    // 맵 경계 확인
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false
    }

    // 해당 위치가 이동 가능한지 반환
    return this.collisionData[Math.floor(y)][Math.floor(x)]
  }

  // 플레이어의 다리 부분만 충돌 감지 (발 부분 영역) - 개선된 버전
  isPlayerFootWalkable(x: number, y: number, width: number, height: number): boolean {
    // 발 부분 영역 정의 (캐릭터 전체 높이 사용)
    const footY = y // 충돌 박스 시작점 (이미 하반신에 위치함)
    const footHeight = height // 충돌 박스 전체 높이 사용
    const footWidth = width * 0.8 // 발 영역 너비를 80%로 조정
    const footX = x + (width - footWidth) / 2 // 중앙 정렬

    // 발 영역의 여러 지점 확인 (더 많은 지점 확인)
    const footPoints = [
      // 왼쪽 발 영역 (3개 지점)
      { x: footX + footWidth * 0.2, y: footY + footHeight * 0.5 },
      { x: footX + footWidth * 0.2, y: footY + footHeight * 0.75 },
      { x: footX + footWidth * 0.2, y: y + height - 2 }, // 왼쪽 하단 (바닥에 더 가깝게)

      // 오른쪽 발 영역 (3개 지점)
      { x: footX + footWidth * 0.8, y: footY + footHeight * 0.5 },
      { x: footX + footWidth * 0.8, y: footY + footHeight * 0.75 },
      { x: footX + footWidth * 0.8, y: y + height - 2 }, // 오른쪽 하단 (바닥에 더 가깝게)

      // 중앙 발 영역 (3개 지점)
      { x: footX + footWidth * 0.5, y: footY + footHeight * 0.5 },
      { x: footX + footWidth * 0.5, y: footY + footHeight * 0.75 },
      { x: footX + footWidth * 0.5, y: y + height - 2 }, // 중앙 하단 (바닥에 더 가깝게)
    ]

    // 발 영역의 모든 지점 중 최소 필요 지점 수
    const requiredPoints = 6 // 9개 중 최소 6개 이상이 이동 가능해야 함 (더 엄격하게)
    let walkablePoints = 0

    // 각 지점이 이동 가능한지 확인
    for (const point of footPoints) {
      if (this.isWalkable(point.x, point.y)) {
        walkablePoints++
      }
    }

    // 하단 중앙점은 반드시 이동 가능해야 함 (가장 중요한 지점)
    const bottomCenterX = footX + footWidth * 0.5
    const bottomCenterY = y + height - 2 // 바닥에 더 가깝게
    const bottomCenterWalkable = this.isWalkable(bottomCenterX, bottomCenterY)

    // 최소 필요 지점 수 이상이 이동 가능하고, 하단 중앙점이 이동 가능해야 함
    return walkablePoints >= requiredPoints && bottomCenterWalkable
  }

  // 디버그용: 충돌 맵을 시각화하여 캔버스에 그리기
  drawDebug(ctx: CanvasRenderingContext2D): void {
    if (!this.loaded) return

    const imageData = ctx.createImageData(this.width, this.height)
    const data = imageData.data

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (y * this.width + x) * 4
        if (this.collisionData[y][x]) {
          // 이동 가능한 영역은 반투명 파란색으로 표시 (RGB: 24, 112, 185)
          data[idx] = 24 // R
          data[idx + 1] = 112 // G
          data[idx + 2] = 185 // B
          data[idx + 3] = 128 // Alpha
        } else {
          // 이동 불가능한 영역은 투명하게 표시
          data[idx] = 0
          data[idx + 1] = 0
          data[idx + 2] = 0
          data[idx + 3] = 0
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  // 디버그용: 플레이어의 발 영역 시각화 (개선된 버전)
  drawPlayerFootDebug(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    if (!this.loaded) return

    // 발 부분 영역 정의 (캐릭터 전체 높이 사용)
    const footY = y // 충돌 박스 시작점 (이미 하반신에 위치함)
    const footHeight = height // 충돌 박스 전체 높이 사용
    const footWidth = width * 0.8 // 발 영역 너비를 80%로 조정
    const footX = x + (width - footWidth) / 2 // 중앙 정렬

    // 발 영역 시각화
    ctx.strokeStyle = "yellow"
    ctx.lineWidth = 2
    ctx.strokeRect(footX, footY, footWidth, footHeight)

    // 발 영역의 충돌 감지 포인트 표시
    const footPoints = [
      // 왼쪽 발 영역 (3개 지점)
      { x: footX + footWidth * 0.2, y: footY + footHeight * 0.5, color: "red" },
      { x: footX + footWidth * 0.2, y: footY + footHeight * 0.75, color: "red" },
      { x: footX + footWidth * 0.2, y: y + height - 2, color: "red" }, // 왼쪽 하단

      // 오른쪽 발 영역 (3개 지점)
      { x: footX + footWidth * 0.8, y: footY + footHeight * 0.5, color: "orange" },
      { x: footX + footWidth * 0.8, y: footY + footHeight * 0.75, color: "orange" },
      { x: footX + footWidth * 0.8, y: y + height - 2, color: "orange" }, // 오른쪽 하단

      // 중앙 발 영역 (3개 지점)
      { x: footX + footWidth * 0.5, y: footY + footHeight * 0.5, color: "green" },
      { x: footX + footWidth * 0.5, y: footY + footHeight * 0.75, color: "green" },
      { x: footX + footWidth * 0.5, y: y + height - 2, color: "blue" }, // 중앙 하단 (가장 중요)
    ]

    // 각 지점 시각화 및 이동 가능 여부 표시
    for (const point of footPoints) {
      const isPointWalkable = this.isWalkable(point.x, point.y)

      // 이동 가능한 지점은 채워진 원, 불가능한 지점은 빈 원으로 표시
      ctx.beginPath()
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)

      if (isPointWalkable) {
        ctx.fillStyle = point.color as string
        ctx.fill()
      } else {
        ctx.strokeStyle = point.color as string
        ctx.stroke()
      }
    }

    // 하단 중앙점 강조 (가장 중요한 지점)
    const bottomCenterX = footX + footWidth * 0.5
    const bottomCenterY = y + height - 2
    const isBottomCenterWalkable = this.isWalkable(bottomCenterX, bottomCenterY)

    ctx.beginPath()
    ctx.arc(bottomCenterX, bottomCenterY, 5, 0, Math.PI * 2)
    if (isBottomCenterWalkable) {
      ctx.fillStyle = "blue"
      ctx.fill()
    } else {
      ctx.strokeStyle = "blue"
      ctx.lineWidth = 3
      ctx.stroke()
    }
  }

  isLoaded(): boolean {
    return this.loaded
  }

  getWidth(): number {
    return this.width
  }

  getHeight(): number {
    return this.height
  }
}

// 이미지 충돌 맵 인스턴스 생성 및 로드
let collisionMapInstance: ImageCollisionMap | null = null

export async function getCollisionMap(): Promise<ImageCollisionMap> {
  if (!collisionMapInstance) {
    collisionMapInstance = new ImageCollisionMap()
    // 파일 이름이 대소문자를 구분할 수 있으므로 정확한 파일 이름 사용
    // 파일 경로를 콘솔에 출력하여 디버깅에 도움이 되도록 함
    const imagePath = "/image/collision.PNG"
    console.log("Loading collision map from:", imagePath)
    await collisionMapInstance.loadFromImage(imagePath)
  }
  return collisionMapInstance
}

