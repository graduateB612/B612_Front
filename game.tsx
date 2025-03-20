"use client"

import { useEffect, useState, useRef } from "react"
import { type ImageCollisionMap, getCollisionMap } from "./image-collision"

export default function Game() {
  // 가상 플레이어 위치 (실제 게임 세계에서의 위치)
  const [playerWorldPosition, setPlayerWorldPosition] = useState({ x: 2030, y: 2560 }) // 초기 위치를 이동 가능한 곳으로 설정
  // 화면상 플레이어 위치
  const [playerScreenPosition, setPlayerScreenPosition] = useState({
    x: 0,
    y: 0,
  })
  // 배경 위치
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 })
  // 키 상태 추적
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({})
  // 플레이어 방향
  const [playerDirection, setPlayerDirection] = useState<"up" | "down" | "left" | "right">("down")
  // 애니메이션 프레임
  const [animationFrame, setAnimationFrame] = useState(1)
  // 이동 중인지 여부
  const [isMoving, setIsMoving] = useState(false)
  // 이미지 로딩 상태
  const [imagesLoaded, setImagesLoaded] = useState(false)
  // 충돌 맵 로딩 상태
  const [collisionMapLoaded, setCollisionMapLoaded] = useState(false)
  // 충돌 맵 인스턴스
  const collisionMapRef = useRef<ImageCollisionMap | null>(null)
  // 애니메이션 타이머
  const animationTimerRef = useRef<number | null>(null)
  // 이미지 캐시
  const imageCache = useRef<Record<string, HTMLImageElement>>({})
  // 디버그 모드 (충돌 맵 시각화)
  const [debugMode, setDebugMode] = useState(true)
  // 캔버스 ref
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // 오류 메시지
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // 충돌 감지 방식
  const [collisionMode, setCollisionMode] = useState<"strict" | "foot">("foot")

  // 게임 설정 (사용자 제공 값으로 업데이트)
  const viewportWidth = 1366
  const viewportHeight = 768
  const playerSpeed = 2
  const playerSize = 50 // 플레이어 충돌 크기를 50으로 고정

  // 배경 이미지 크기 (사용자 제공 값으로 업데이트)
  const backgroundWidth = 2408
  const backgroundHeight = 2751

  // 게임 루프를 위한 requestAnimationFrame ID
  const animationFrameRef = useRef<number | null>(null)

  // 중앙 위치 계산
  const centerX = viewportWidth / 2 - playerSize / 2
  const centerY = viewportHeight / 2 - playerSize / 2

  // 충돌 맵 로드
  useEffect(() => {
    const loadCollisionMap = async () => {
      try {
        console.log("충돌 맵 로드 시작")
        // 이미지 파일이 존재하는지 확인
        const testImg = new Image()
        testImg.onload = () => console.log("충돌 맵 이미지가 존재합니다!")
        testImg.onerror = () => console.error("충돌 맵 이미지를 찾을 수 없습니다!")
        testImg.src = "/image/collision.PNG"

        const collisionMap = await getCollisionMap()

        if (!collisionMap.isLoaded()) {
          setErrorMessage("충돌 맵을 로드할 수 없습니다. 파일 경로를 확인하세요.")
          return
        }

        collisionMapRef.current = collisionMap
        setCollisionMapLoaded(true)
        console.log("충돌 맵 로드 완료")
      } catch (error) {
        console.error("충돌 맵 로드 실패:", error)
        setErrorMessage(`충돌 맵 로드 실패: ${error}`)
      }
    }

    loadCollisionMap()
  }, [])

  // 이미지 프리로딩
  useEffect(() => {
    const directions = ["up", "down", "left", "right"]
    const frames = [1, 2]
    const imagesToLoad = directions.length * frames.length
    let loadedCount = 0

    directions.forEach((direction) => {
      frames.forEach((frame) => {
        const imagePath = `/image/player_${direction}_0${frame}.png`
        const img = new Image()
        img.onload = () => {
          loadedCount++
          imageCache.current[imagePath] = img
          if (loadedCount === imagesToLoad) {
            setImagesLoaded(true)
          }
        }
        img.onerror = () => {
          console.error(`Failed to load image: ${imagePath}`)
          loadedCount++
          if (loadedCount === imagesToLoad) {
            setImagesLoaded(true)
          }
        }
        img.src = imagePath
      })
    })
  }, [])

  // 초기 위치 설정
  useEffect(() => {
    setPlayerScreenPosition({ x: centerX, y: centerY })
  }, [centerX, centerY])

  // 키보드 이벤트 리스너 설정
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [e.key]: true }))

      // D 키를 눌러 디버그 모드 토글
      if (e.key === "d" || e.key === "D") {
        setDebugMode((prev) => !prev)
      }

      // C 키를 눌러 충돌 감지 방식 토글
      if (e.key === "c" || e.key === "C") {
        setCollisionMode((prev) => (prev === "strict" ? "foot" : "strict"))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [e.key]: false }))
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // 애니메이션 타이머 설정
  useEffect(() => {
    // 이동 중일 때만 애니메이션 실행
    if (isMoving) {
      // 150ms마다 애니메이션 프레임 전환
      animationTimerRef.current = window.setInterval(() => {
        setAnimationFrame((prev) => (prev === 1 ? 2 : 1))
      }, 150)
    } else {
      // 이동 중이 아니면 애니메이션 중지 및 기본 프레임으로 설정
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current)
        animationTimerRef.current = null
      }
      setAnimationFrame(1)
    }

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current)
      }
    }
  }, [isMoving])

  // 디버그 모드에서 이동 가능 영역 렌더링
  useEffect(() => {
    if (debugMode && canvasRef.current && collisionMapRef.current) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        // 캔버스 초기화
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        // 이동 가능 영역 그리기
        ctx.save()
        ctx.translate(backgroundPosition.x, backgroundPosition.y)

        // 충돌 맵 시각화
        collisionMapRef.current.drawDebug(ctx)

        // 플레이어 발 영역 시각화 (월드 좌표 기준)
        collisionMapRef.current.drawPlayerFootDebug(
          ctx,
          playerWorldPosition.x,
          playerWorldPosition.y,
          playerSize,
          playerSize,
        )

        ctx.restore()
      }
    }
  }, [debugMode, backgroundPosition, collisionMapLoaded, playerWorldPosition])

  // 게임 루프
  useEffect(() => {
    // 이미지와 충돌 맵이 로드되지 않았으면 게임 루프를 시작하지 않음
    if (!imagesLoaded || !collisionMapLoaded || !collisionMapRef.current) return

    const gameLoop = () => {
      // 플레이어 이동 처리
      let newX = playerWorldPosition.x
      let newY = playerWorldPosition.y
      let isPlayerMoving = false
      let newDirection = playerDirection

      // 방향키 입력에 따른 이동 및 방향 설정
      // 충돌 감지 로직 추가 - 다리 부분만 확인
      if (keysPressed["ArrowUp"]) {
        const testY = newY - playerSpeed

        // 충돌 감지 방식에 따라 다른 메서드 사용
        let canMove = false
        if (collisionMode === "strict") {
          // 엄격한 충돌 감지 (모든 모서리가 이동 가능해야 함)
          canMove =
            collisionMapRef.current?.isWalkable(newX, testY) &&
            collisionMapRef.current?.isWalkable(newX + playerSize, testY) &&
            collisionMapRef.current?.isWalkable(newX, testY + playerSize) &&
            collisionMapRef.current?.isWalkable(newX + playerSize, testY + playerSize)
        } else {
          // 발 영역 기반 충돌 감지
          canMove = collisionMapRef.current?.isPlayerFootWalkable(newX, testY, playerSize, playerSize) || false

          // 전체 이동이 불가능하면 절반 이동 시도
          if (!canMove) {
            const halfStepY = newY - playerSpeed / 2
            // 절반 이동도 불가능하면 1/4 이동 시도
            if (collisionMapRef.current?.isPlayerFootWalkable(newX, halfStepY, playerSize, playerSize)) {
              newY = halfStepY
            } else {
              const quarterStepY = newY - playerSpeed / 4
              if (collisionMapRef.current?.isPlayerFootWalkable(newX, quarterStepY, playerSize, playerSize)) {
                newY = quarterStepY
              }
            }
          } else {
            newY = testY
          }
        }

        if (canMove && collisionMode === "strict") {
          newY = testY
        }

        newDirection = "up"
        isPlayerMoving = true
      } else if (keysPressed["ArrowDown"]) {
        const testY = newY + playerSpeed

        // 충돌 감지 방식에 따라 다른 메서드 사용
        let canMove = false
        if (collisionMode === "strict") {
          // 엄격한 충돌 감지
          canMove =
            collisionMapRef.current?.isWalkable(newX, testY) &&
            collisionMapRef.current?.isWalkable(newX + playerSize, testY) &&
            collisionMapRef.current?.isWalkable(newX, testY + playerSize) &&
            collisionMapRef.current?.isWalkable(newX + playerSize, testY + playerSize)
        } else {
          // 발 영역 기반 충돌 감지
          canMove = collisionMapRef.current?.isPlayerFootWalkable(newX, testY, playerSize, playerSize) || false

          // 전체 이동이 불가능하면 절반 이동 시도
          if (!canMove) {
            const halfStepY = newY + playerSpeed / 2
            // 절반 이동도 불가능하면 1/4 이동 시도
            if (collisionMapRef.current?.isPlayerFootWalkable(newX, halfStepY, playerSize, playerSize)) {
              newY = halfStepY
            } else {
              const quarterStepY = newY + playerSpeed / 4
              if (collisionMapRef.current?.isPlayerFootWalkable(newX, quarterStepY, playerSize, playerSize)) {
                newY = quarterStepY
              }
            }
          } else {
            newY = testY
          }
        }

        if (canMove && collisionMode === "strict") {
          newY = testY
        }

        newDirection = "down"
        isPlayerMoving = true
      } else if (keysPressed["ArrowLeft"]) {
        const testX = newX - playerSpeed

        // 충돌 감지 방식에 따라 다른 메서드 사용
        let canMove = false
        if (collisionMode === "strict") {
          // 엄격한 충돌 감지
          canMove =
            collisionMapRef.current?.isWalkable(testX, newY) &&
            collisionMapRef.current?.isWalkable(testX + playerSize, newY) &&
            collisionMapRef.current?.isWalkable(testX, newY + playerSize) &&
            collisionMapRef.current?.isWalkable(testX + playerSize, newY + playerSize)
        } else {
          // 발 영역 기반 충돌 감지
          canMove = collisionMapRef.current?.isPlayerFootWalkable(testX, newY, playerSize, playerSize) || false

          // 전체 이동이 불가능하면 절반 이동 시도
          if (!canMove) {
            const halfStepX = newX - playerSpeed / 2
            // 절반 이동도 불가능하면 1/4 이동 시도
            if (collisionMapRef.current?.isPlayerFootWalkable(halfStepX, newY, playerSize, playerSize)) {
              newX = halfStepX
            } else {
              const quarterStepX = newX - playerSpeed / 4
              if (collisionMapRef.current?.isPlayerFootWalkable(halfStepX, newY, playerSize, playerSize)) {
                newX = quarterStepX
              }
            }
          } else {
            newX = testX
          }
        }

        if (canMove && collisionMode === "strict") {
          newX = testX
        }

        newDirection = "left"
        isPlayerMoving = true
      } else if (keysPressed["ArrowRight"]) {
        const testX = newX + playerSpeed

        // 충돌 감지 방식에 따라 다른 메서드 사용
        let canMove = false
        if (collisionMode === "strict") {
          // 엄격한 충돌 감지
          canMove =
            collisionMapRef.current?.isWalkable(testX, newY) &&
            collisionMapRef.current?.isWalkable(testX + playerSize, newY) &&
            collisionMapRef.current?.isWalkable(testX, newY + playerSize) &&
            collisionMapRef.current?.isWalkable(testX + playerSize, newY + playerSize)
        } else {
          // 발 영역 기반 충돌 감지
          canMove = collisionMapRef.current?.isPlayerFootWalkable(testX, newY, playerSize, playerSize) || false

          // 전체 이동이 불가능하면 절반 이동 시도
          if (!canMove) {
            const halfStepX = newX + playerSpeed / 2
            // 절반 이동도 불가능하면 1/4 이동 시도
            if (collisionMapRef.current?.isPlayerFootWalkable(halfStepX, newY, playerSize, playerSize)) {
              newX = halfStepX
            } else {
              const quarterStepX = newX + playerSpeed / 4
              if (collisionMapRef.current?.isPlayerFootWalkable(halfStepX, newY, playerSize, playerSize)) {
                newX = quarterStepX
              }
            }
          } else {
            newX = testX
          }
        }

        if (canMove && collisionMode === "strict") {
          newX = testX
        }

        newDirection = "right"
        isPlayerMoving = true
      }

      // 대각선 이동 보정 (모서리에 끼는 것 방지)
      if (
        (keysPressed["ArrowUp"] || keysPressed["ArrowDown"]) &&
        (keysPressed["ArrowLeft"] || keysPressed["ArrowRight"])
      ) {
        // 대각선 이동 시 충돌 확인
        if (!collisionMapRef.current?.isPlayerFootWalkable(newX, newY, playerSize, playerSize)) {
          // 수직 이동만 시도
          if (collisionMapRef.current?.isPlayerFootWalkable(playerWorldPosition.x, newY, playerSize, playerSize)) {
            newX = playerWorldPosition.x
          }
          // 수평 이동만 시도
          else if (collisionMapRef.current?.isPlayerFootWalkable(newX, playerWorldPosition.y, playerSize, playerSize)) {
            newY = playerWorldPosition.y
          }
          // 둘 다 안되면 이동 취소
          else {
            newX = playerWorldPosition.x
            newY = playerWorldPosition.y
          }
        }
      }

      // 플레이어 위치 및 방향 업데이트
      setPlayerWorldPosition({ x: newX, y: newY })

      // 방향이 변경된 경우에만 방향 상태 업데이트
      if (newDirection !== playerDirection) {
        setPlayerDirection(newDirection)
      }

      // 이동 상태 업데이트
      setIsMoving(isPlayerMoving)

      // 배경 위치 계산 (플레이어가 중앙에 오도록)
      let bgX = -newX + centerX
      let bgY = -newY + centerY

      // 배경이 경계를 넘지 않도록 제한
      bgX = Math.min(0, bgX)
      bgX = Math.max(-(backgroundWidth - viewportWidth), bgX)
      bgY = Math.min(0, bgY)
      bgY = Math.max(-(backgroundHeight - viewportHeight), bgY)

      // 플레이어 화면 위치 계산
      let playerX = centerX
      let playerY = centerY

      // 배경이 경계에 도달했을 때 플레이어 위치 조정
      if (bgX === 0) {
        // 왼쪽 경계
        playerX = newX
      } else if (bgX === -(backgroundWidth - viewportWidth)) {
        // 오른쪽 경계
        playerX = viewportWidth - (backgroundWidth - newX)
      }

      if (bgY === 0) {
        // 위쪽 경계
        playerY = newY
      } else if (bgY === -(backgroundHeight - viewportHeight)) {
        // 아래쪽 경계
        playerY = viewportHeight - (backgroundHeight - newY)
      }

      // 배경 및 플레이어 위치 업데이트
      setBackgroundPosition({ x: bgX, y: bgY })
      setPlayerScreenPosition({ x: playerX, y: playerY })

      // 디버그 모드에서 이동 가능 영역 업데이트
      if (debugMode && canvasRef.current && collisionMapRef.current) {
        const ctx = canvasRef.current.getContext("2d")
        if (ctx) {
          // 캔버스 초기화
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

          // 이동 가능 영역 그리기
          ctx.save()
          ctx.translate(bgX, bgY)

          // 충돌 맵 시각화
          collisionMapRef.current.drawDebug(ctx)

          // 플레이어 발 영역 시각화 (월드 좌표 기준)
          collisionMapRef.current.drawPlayerFootDebug(ctx, newX, newY, playerSize, playerSize)

          ctx.restore()
        }
      }

      // 다음 프레임 요청
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    // 게임 루프 시작
    animationFrameRef.current = requestAnimationFrame(gameLoop)

    // 컴포넌트 언마운트 시 게임 루프 정리
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [
    keysPressed,
    playerWorldPosition,
    centerX,
    centerY,
    playerDirection,
    imagesLoaded,
    collisionMapLoaded,
    debugMode,
    collisionMode,
    backgroundWidth,
    backgroundHeight,
    viewportWidth,
    viewportHeight,
    playerSize,
  ])

  // 현재 플레이어 스프라이트 이미지 경로 계산
  const playerSprite = `/image/player_${playerDirection}_0${animationFrame}.png`

  // 로딩 화면 또는 오류 화면
  if (errorMessage) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "white",
          backgroundColor: "#000",
        }}
      >
        <p>오류 발생: {errorMessage}</p>
        <p>파일 경로를 확인하세요: /image/collision.PNG</p>
      </div>
    )
  }

  if (!imagesLoaded || !collisionMapLoaded) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "white",
          backgroundColor: "#000",
        }}
      >
        <p>이미지 및 충돌 맵 로딩 중... {!imagesLoaded ? "(캐릭터 이미지 로딩 중)" : "(이동 가능 영역 분석 중)"}</p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          width: `${viewportWidth}px`,
          height: `${viewportHeight}px`,
          boxShadow: "0 0 20px rgba(0, 0, 255, 0.5)",
        }}
      >
        {/* 배경 */}
        <div
          style={{
            position: "absolute",
            width: `${backgroundWidth}px`,
            height: `${backgroundHeight}px`,
            backgroundImage: `url('/image/background.png')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${backgroundWidth}px ${backgroundHeight}px`,
            transform: `translate(${backgroundPosition.x}px, ${backgroundPosition.y}px)`,
          }}
        />

        {/* 디버그용 이동 가능 영역 오버레이 */}
        {debugMode && (
          <canvas
            ref={canvasRef}
            width={backgroundWidth}
            height={backgroundHeight}
            style={{
              position: "absolute",
              transform: `translate(${backgroundPosition.x}px, ${backgroundPosition.y}px)`,
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
        )}

        {/* 플레이어 */}
        <div
          style={{
            position: "absolute",
            width: `${playerSize * 4}px`, // 시각적 크기는 충돌 크기보다 크게
            height: `${playerSize * 4}px`,
            left: `${playerScreenPosition.x - playerSize * 1.5}px`, // 중앙 정렬을 위해 오프셋 조정
            top: `${playerScreenPosition.y - playerSize * 3}px`, // 충돌 박스가 캐릭터 하반신에 오도록 위치 조정
            backgroundImage: `url('${playerSprite}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            zIndex: 10,
            imageRendering: "pixelated", // 픽셀 아트 이미지를 선명하게 표시
          }}
        />

        {/* 디버그: 플레이어 충돌 박스 */}
        {debugMode && (
          <div
            style={{
              position: "absolute",
              width: `${playerSize}px`,
              height: `${playerSize}px`,
              left: `${playerScreenPosition.x}px`,
              top: `${playerScreenPosition.y}px`,
              border: "2px solid red",
              zIndex: 20,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      <div
        style={{
          marginTop: "20px",
          color: "white",
          fontFamily: '"Courier New", monospace',
          textAlign: "center",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "10px 20px",
          borderRadius: "5px",
        }}
      >
        <p>
          방향키를 사용하여 캐릭터를 움직이세요 | D키: 디버그 모드 {debugMode ? "켜짐" : "꺼짐"} | 충돌 감지:{" "}
          {collisionMode === "strict" ? "엄격" : "발 영역 기준"}
        </p>
        <p>
          플레이어 위치: X: {Math.round(playerWorldPosition.x)}, Y: {Math.round(playerWorldPosition.y)}
        </p>
      </div>
    </div>
  )
}

