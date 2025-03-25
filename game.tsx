"use client"

import { useEffect, useState, useRef } from "react"
import { type ImageCollisionMap, getCollisionMap } from "./image-collision"
import { getNPCManager } from "./npc-manager" // NPC 매니저 import
import { getItemManager } from "./item-manager" // 아이템 매니저 import
import DialogueBox from "@/app/components/dialogue-box" // 대화창 컴포넌트 import
import { startGame } from "@/lib/api-config" // api-config에서 startGame 함수 import

export default function Game() {
  // 가상 플레이어 위치 (실제 게임 세계에서의 위치)
  const [playerWorldPosition, setPlayerWorldPosition] = useState({ x: 2030, y: 2560 }) // 초기 위치를 이동 가능한 곳으로 설정
  // 화면상 플레이어 위치
  const [playerScreenPosition, setPlayerScreenPosition] = useState({
    x: 0,
    y: 0,
  })
  // 배경 위치
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 2030, y: 2560 })
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
  // 캔버스 ref
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // 오류 메시지
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // NPC 매니저 ref
  const npcManagerRef = useRef<any>(null)
  // 아이템 매니저 ref
  const itemManagerRef = useRef<any>(null)
  // NPC 이미지 로딩 상태
  const [npcImagesLoaded, setNpcImagesLoaded] = useState(false)
  // 아이템 이미지 로딩 상태
  const [itemImagesLoaded, setItemImagesLoaded] = useState(false)
  // 상호작용 가능한 아이템 표시
  const [interactableItem, setInteractableItem] = useState<string | null>(null)

  // 대화창 관련 상태 추가
  const [showDialogue, setShowDialogue] = useState(false)
  const [dialogueText, setDialogueText] = useState("")
  const [userName, setUserName] = useState("")
  // 대화창 위치 상태 추가
  const [dialoguePosition, setDialoguePosition] = useState<"center" | "bottom">("center")

  // 게임 설정 (사용자 제공 값으로 업데이트)
  const viewportWidth = 1366
  const viewportHeight = 768
  const playerSpeed = 3
  const playerSize = 50 // 플레이어 충돌 크기를 50으로 고정

  // 배경 이미지 크기 (사용자 제공 값으로 업데이트)
  const backgroundWidth = 2408
  const backgroundHeight = 2751

  // 게임 루프를 위한 requestAnimationFrame ID
  const animationFrameRef = useRef<number | null>(null)

  // 중앙 위치 계산
  const centerX = viewportWidth / 2 - playerSize / 2
  const centerY = viewportHeight / 2 - playerSize / 2

  // 게임 상태 및 대화 데이터 로드
  useEffect(() => {
    // 로컬 스토리지에서 게임 상태 로드
    const gameStateStr = localStorage.getItem("gameState")
    const userIdStr = localStorage.getItem("userId")

    // 사용자 이름 가져오기 (로컬 스토리지에서)
    const userNameStr = localStorage.getItem("userName")
    if (userNameStr) {
      setUserName(userNameStr)
      console.log("localStorage에서 userName 로드:", userNameStr)
    }

    console.log("현재 localStorage 상태:", {
      userId: userIdStr,
      userName: userNameStr,
      gameState: gameStateStr ? "있음" : "없음",
    })

    if (gameStateStr) {
      try {
        const gameState = JSON.parse(gameStateStr)
        console.log("게임 상태 로드:", gameState)

        // 대화 데이터 설정
        if (gameState.dialogues && gameState.dialogues.length > 0) {
          // quest_tutorial 대화 찾기
          const tutorialDialogue = gameState.dialogues.find((d: any) => d.quest_tutorial)

          if (tutorialDialogue) {
            setDialogueText(tutorialDialogue.quest_tutorial || tutorialDialogue.dialogueText)
            setDialoguePosition("center") // 튜토리얼은 중앙에 표시
          } else {
            // 어린왕자의 대화 찾기
            const princeDialogue = gameState.dialogues.find((d: any) => d.npcName === "어린왕자")

            if (princeDialogue) {
              setDialogueText(
                princeDialogue.dialogueText ||
                  `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
              )
              setDialoguePosition("center") // 기본 대화는 중앙에 표시
            } else {
              // 기본 튜토리얼 텍스트 설정
              setDialogueText(
                `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
              )
              setDialoguePosition("center")
            }
          }
        } else {
          // 대화 데이터가 없는 경우 기본 텍스트 설정
          setDialogueText(
            `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
          )
          setDialoguePosition("center")
        }

        // 대화창 표시
        setShowDialogue(true)
      } catch (error) {
        console.error("게임 상태 파싱 오류:", error)

        // 오류 발생 시 기본 텍스트 설정
        setDialogueText(
          `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
        )
        setDialoguePosition("center")
        setShowDialogue(true)
      }
    } else if (userIdStr) {
      // 게임 상태가 없지만 userId가 있는 경우 API 호출
      const fetchGameState = async () => {
        try {
          const userId = userIdStr
          console.log("게임 시작 API 호출 중... userId:", userId)
          const gameState = await startGame(userId)
          console.log("게임 시작 성공:", gameState)

          // 로컬 스토리지에 게임 상태 저장
          localStorage.setItem("gameState", JSON.stringify(gameState))

          // 대화 데이터 설정
          if (gameState.dialogues && gameState.dialogues.length > 0) {
            // quest_tutorial 대화 찾기
            const tutorialDialogue = gameState.dialogues.find((d) => d.quest_tutorial)

            if (tutorialDialogue) {
              setDialogueText(tutorialDialogue.quest_tutorial || tutorialDialogue.dialogueText)
              setDialoguePosition("center") // 튜토리얼은 중앙에 표시
            } else {
              // 어린왕자의 대화 찾기
              const princeDialogue = gameState.dialogues.find((d) => d.npcName === "어린왕자")

              if (princeDialogue) {
                setDialogueText(
                  princeDialogue.dialogueText ||
                    `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
                )
                setDialoguePosition("center")
              } else {
                // 기본 튜토리얼 텍스트 설정
                setDialogueText(
                  `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
                )
                setDialoguePosition("center")
              }
            }
          } else {
            // 대화 데이터가 없는 경우 기본 텍스트 설정
            setDialogueText(
              `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
            )
            setDialoguePosition("center")
          }

          // 대화창 표시
          setShowDialogue(true)
        } catch (error) {
          console.error("게임 시작 API 오류:", error)

          // 오류 발생 시 기본 텍스트 설정
          setDialogueText(
            `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
          )
          setDialoguePosition("center")
          setShowDialogue(true)
        }
      }

      fetchGameState()
    } else {
      // userId도 없는 경우 기본 텍스트 설정
      setDialogueText(
        `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
      )
      setDialoguePosition("center")
      setShowDialogue(true)
    }
  }, [])

  // 별 수집 이벤트 리스너
  useEffect(() => {
    const handleStarCollected = (event: CustomEvent) => {
      const { starType, gameState } = event.detail
      console.log(`별 수집 이벤트 발생: ${starType}`, gameState)

      // 대화 데이터 설정
      if (gameState.dialogues && gameState.dialogues.length > 0) {
        console.log("수집 후 대화 데이터:", gameState.dialogues)

        // 가장 최근 대화를 사용 (API 응답의 마지막 대화)
        const latestDialogue = gameState.dialogues[gameState.dialogues.length - 1]

        if (latestDialogue && latestDialogue.dialogueText) {
          console.log("표시할 대화:", latestDialogue.dialogueText)
          setDialogueText(latestDialogue.dialogueText)
          setDialoguePosition("bottom") // 별 수집 후 대화는 하단에 표시
          setShowDialogue(true)
        } else {
          console.log("대화 텍스트가 없습니다.")
        }
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener("starCollected", handleStarCollected as EventListener)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("starCollected", handleStarCollected as EventListener)
    }
  }, [])

  // 충돌 맵 로드
  useEffect(() => {
    const loadCollisionMap = async () => {
      try {
        console.log("충돌 맵 로드 시작")
        // 이미지 파일이 존재하는지 확인
        const testImg = new Image()
        testImg.onload = () => console.log("충돌 맵 이미지가 존재합니다!")
        testImg.onerror = () => console.error("충돌 맵 이미지를 찾을 수 없습니다!")
        testImg.src = "/image/collision.png"

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

  // NPC 관리자 초기화
  useEffect(() => {
    const initNPCs = async () => {
      try {
        console.log("NPC 관리자 초기화 시작")
        // NPC 관리자 가져오기
        const npcManager = getNPCManager()
        npcManagerRef.current = npcManager

        // NPC 이미지 로드
        console.log("NPC 이미지 로드 시작")
        await npcManager.preloadImages()
        console.log("NPC 이미지 로드 완료")

        // 이미지 로드 상태 업데이트
        setNpcImagesLoaded(true)
      } catch (error) {
        console.error("NPC 초기화 실패:", error)
        // 오류가 발생해도 게임은 계속 진행
        setNpcImagesLoaded(true)
      }
    }

    initNPCs()
  }, [])

  // 아이템 관리자 초기화
  useEffect(() => {
    const initItems = async () => {
      try {
        console.log("아이템 관리자 초기화 시작")
        // 아이템 관리자 가져오기
        const itemManager = getItemManager()
        itemManagerRef.current = itemManager

        // 아이템 이미지 로드
        console.log("아이템 이미지 로드 시작")
        await itemManager.preloadImages()
        console.log("아이템 이미지 로드 완료")

        // 이미지 로드 상태 업데이트
        setItemImagesLoaded(true)
      } catch (error) {
        console.error("아이템 초기화 실패:", error)
        // 오류가 발생해도 게임은 계속 진행
        setItemImagesLoaded(true)
      }
    }

    initItems()
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

    // prince_text.png 이미지 프리로드
    const princeTextImg = new Image()
    princeTextImg.src = "/image/prince_text.png"
  }, [])

  // 초기 위치 설정
  useEffect(() => {
    setPlayerScreenPosition({ x: centerX, y: centerY })
  }, [centerX, centerY])

  // 키보드 이벤트 리스너 설정
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 대화창이 표시 중일 때는 키 입력 무시
      if (showDialogue) return

      setKeysPressed((prev) => ({ ...prev, [e.key]: true }))

      // E키 입력 감지 (상호작용)
      if (e.key === "e" || e.key === "E") {
        // 상호작용 가능한 아이템이 있는지 확인
        if (interactableItem && itemManagerRef.current) {
          // 아이템과 상호작용
          itemManagerRef.current.interactWithItem(interactableItem)
          // 상호작용 후 상태 초기화
          setInteractableItem(null)
        }
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
  }, [interactableItem, showDialogue])

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

  // 게임 루프
  useEffect(() => {
    // 이미지와 충돌 맵이 로드되지 않았으면 게임 루프를 시작하지 않음
    if (!imagesLoaded || !collisionMapLoaded || !collisionMapRef.current || !npcImagesLoaded || !itemImagesLoaded)
      return

    // 대화창이 표시 중일 때는 게임 루프 일시 중지
    if (showDialogue) return

    // 디버그 모드 확인
    const isDebugMode =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "true"

    // 안전한 로그 출력 함수
    const safeLog = (message: string, ...args: any[]) => {
      if (isDebugMode) {
        console.log(message, ...args)
      }
    }

    // 마지막 FPS 계산 시간
    let lastFpsTime = performance.now()
    let frames = 0
    let fps = 0

    const gameLoop = () => {
      // FPS 계산 (디버그 모드에서만)
      if (isDebugMode) {
        frames++
        const now = performance.now()
        const elapsed = now - lastFpsTime

        if (elapsed >= 1000) {
          fps = Math.round((frames * 1000) / elapsed)
          lastFpsTime = now
          frames = 0
          safeLog(`FPS: ${fps}`)
        }
      }

      // 플레이어 이동 처리
      let newX = playerWorldPosition.x
      let newY = playerWorldPosition.y
      let isPlayerMoving = false
      let newDirection = playerDirection

      // 방향키 입력에 따른 이동 및 방향 설정
      // 충돌 감지 로직 추가 - 엄격한 충돌 감지 사용
      if (keysPressed["ArrowUp"]) {
        const testY = newY - playerSpeed

        // 엄격한 충돌 감지 (모든 모서리가 이동 가능해야 함)
        const canMove =
          collisionMapRef.current?.isWalkable(newX, testY) &&
          collisionMapRef.current?.isWalkable(newX + playerSize, testY) &&
          collisionMapRef.current?.isWalkable(newX, testY + playerSize) &&
          collisionMapRef.current?.isWalkable(newX + playerSize, testY + playerSize)

        if (canMove) {
          newY = testY
        }

        newDirection = "up"
        isPlayerMoving = true
      } else if (keysPressed["ArrowDown"]) {
        const testY = newY + playerSpeed

        // 엄격한 충돌 감지
        const canMove =
          collisionMapRef.current?.isWalkable(newX, testY) &&
          collisionMapRef.current?.isWalkable(newX + playerSize, testY) &&
          collisionMapRef.current?.isWalkable(newX, testY + playerSize) &&
          collisionMapRef.current?.isWalkable(newX + playerSize, testY + playerSize)

        if (canMove) {
          newY = testY
        }

        newDirection = "down"
        isPlayerMoving = true
      } else if (keysPressed["ArrowLeft"]) {
        const testX = newX - playerSpeed

        // 엄격한 충돌 감지
        const canMove =
          collisionMapRef.current?.isWalkable(testX, newY) &&
          collisionMapRef.current?.isWalkable(testX + playerSize, newY) &&
          collisionMapRef.current?.isWalkable(testX, newY + playerSize) &&
          collisionMapRef.current?.isWalkable(testX + playerSize, newY + playerSize)

        if (canMove) {
          newX = testX
        }

        newDirection = "left"
        isPlayerMoving = true
      } else if (keysPressed["ArrowRight"]) {
        const testX = newX + playerSpeed

        // 엄격한 충돌 감지
        const canMove =
          collisionMapRef.current?.isWalkable(testX, newY) &&
          collisionMapRef.current?.isWalkable(testX + playerSize, newY) &&
          collisionMapRef.current?.isWalkable(testX, newY + playerSize) &&
          collisionMapRef.current?.isWalkable(testX + playerSize, newY + playerSize)

        if (canMove) {
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
        const canMove =
          collisionMapRef.current?.isWalkable(newX, newY) &&
          collisionMapRef.current?.isWalkable(newX + playerSize, newY) &&
          collisionMapRef.current?.isWalkable(newX, newY + playerSize) &&
          collisionMapRef.current?.isWalkable(newX + playerSize, newY + playerSize)

        if (!canMove) {
          // 수직 이동만 시도
          const canMoveVertical =
            collisionMapRef.current?.isWalkable(playerWorldPosition.x, newY) &&
            collisionMapRef.current?.isWalkable(playerWorldPosition.x + playerSize, newY) &&
            collisionMapRef.current?.isWalkable(playerWorldPosition.x, newY + playerSize) &&
            collisionMapRef.current?.isWalkable(playerWorldPosition.x + playerSize, newY + playerSize)

          if (canMoveVertical) {
            newX = playerWorldPosition.x
          } else {
            // 수평 이동만 시도
            const canMoveHorizontal =
              collisionMapRef.current?.isWalkable(newX, playerWorldPosition.y) &&
              collisionMapRef.current?.isWalkable(newX + playerSize, playerWorldPosition.y) &&
              collisionMapRef.current?.isWalkable(newX, playerWorldPosition.y + playerSize) &&
              collisionMapRef.current?.isWalkable(newX + playerSize, playerWorldPosition.y + playerSize)

            if (canMoveHorizontal) {
              newY = playerWorldPosition.y
            } else {
              // 둘 다 안되면 이동 취소
              newX = playerWorldPosition.x
              newY = playerWorldPosition.y
            }
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

      // 상호작용 가능한 아이템 확인
      if (itemManagerRef.current) {
        const item = itemManagerRef.current.getInteractableItem(newX, newY)
        if (item) {
          setInteractableItem(item.id)
        } else {
          setInteractableItem(null)
        }
      }

      // 캔버스 업데이트 (NPC 및 아이템 렌더링)
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d")
        if (ctx) {
          // 캔버스 초기화
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

          // NPC 렌더링
          if (npcManagerRef.current) {
            npcManagerRef.current.renderNPCs(ctx, bgX, bgY)
          }

          // 아이템 렌더링
          if (itemManagerRef.current) {
            itemManagerRef.current.renderItems(ctx, bgX, bgY, newX, newY)
          }
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
    backgroundWidth,
    backgroundHeight,
    viewportWidth,
    viewportHeight,
    playerSize,
    npcImagesLoaded,
    itemImagesLoaded,
    showDialogue,
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
        <p>파일 경로를 확인하세요: /image/collision.png</p>
      </div>
    )
  }

  // 로딩 화면 부분 수정 - 아이템 이미지 로딩 상태 추가
  if (!imagesLoaded || !collisionMapLoaded || !npcImagesLoaded || !itemImagesLoaded) {
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
        <p>
          이미지 및 충돌 맵 로딩 중...
          {!imagesLoaded
            ? "(캐릭터 이미지 로딩 중)"
            : !collisionMapLoaded
              ? "(이동 가능 영역 분석 중)"
              : !npcImagesLoaded
                ? "(NPC 이미지 로딩 중)"
                : !itemImagesLoaded
                  ? "(아이템 이미지 로딩 중)"
                  : ""}
        </p>
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

        {/* 캔버스 오버레이 (NPC 및 아이템 렌더링용) */}
        <canvas
          ref={canvasRef}
          width={viewportWidth}
          height={viewportHeight}
          style={{
            position: "absolute",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />

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

        {/* 상호작용 안내 메시지 */}
        {interactableItem && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              zIndex: 20,
            }}
          >
            E키를 눌러 상호작용
          </div>
        )}

        {/* 대화창 - 게임 화면 내부에 위치하도록 수정 */}
        {showDialogue && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              zIndex: 30,
            }}
          >
            <DialogueBox
              text={dialogueText}
              onClose={() => setShowDialogue(false)}
              userName={userName || "모험가"}
              position={dialoguePosition}
            />
          </div>
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
        <p>방향키를 사용하여 캐릭터를 움직이세요</p>
        <p>
          플레이어 위치: X: {Math.round(playerWorldPosition.x)}, Y: {Math.round(playerWorldPosition.y)}
        </p>
      </div>
    </div>
  )
}

