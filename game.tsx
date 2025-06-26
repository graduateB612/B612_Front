"use client"

import { useEffect, useState, useRef } from "react"
import { type ImageCollisionMap, getCollisionMap } from "./image-collision"
import { getNPCManager } from "./npc-manager" // NPC 매니저 import
import { getItemManager } from "./item-manager" // 아이템 매니저 import
import DialogueBox from "@/app/components/dialogue-box" // 대화창 컴포넌트 import
import ConcernModal from "@/app/components/modal" // 모달 컴포넌트 import
import { startGame, GameStage, StarType } from "@/lib/api-config" // api-config에서 startGame 함수와 NPCInfoMap import
// 상단에 StarGuide 컴포넌트 import 추가
import StarGuide from "@/app/components/star-guide"

export default function Game() {
  // 가상 플레이어 위치 (실제 게임 세계에서의 위치)
  const [playerWorldPosition, setPlayerWorldPosition] = useState({ x: 2030, y: 2560 }) // 초기 위치를 이동 가능한 곳으로 설정
  // 화면상 플레이어 위치
  const [playerScreenPosition, setPlayerScreenPosition] = useState({
    x: 0,
    y: 0,
  })
  // 배경 위치
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 2000, y: 2000 })
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
  // 상호작용 가능한 NPC 표시
  const [interactableNPC, setInteractableNPC] = useState<string | null>(null)

  // 대화창 관련 상태 추가
  const [showDialogue, setShowDialogue] = useState(false)
  const [dialogueText, setDialogueText] = useState("")
  const [userName, setUserName] = useState("")
  // 대화창 위치 상태 추가
  const [dialoguePosition, setDialoguePosition] = useState<"center" | "bottom">("bottom")
  // 대화창 배경 이미지 상태 추가
  const [dialogueBackground, setDialogueBackground] = useState("/image/prince_text.png")

  // 모든 별이 전달되었는지 여부
  const [allStarsDelivered, setAllStarsDelivered] = useState(false)
  // 현재 게임 단계
  const [currentGameStage, setCurrentGameStage] = useState<GameStage | null>(null)

  // 대화 큐 상태 - 컴포넌트 내부에서 관리하도록 변경
  const [dialogueQueue, setDialogueQueue] = useState<{ text: string; background: string }[]>([])

  // 마지막 별 전달 처리 중인지 여부
  const [processingLastStar, setProcessingLastStar] = useState(false)

  // 여우와의 대화가 완료되었는지 여부
  const [foxDialogueCompleted, setFoxDialogueCompleted] = useState(false)

  // 여우 대화 텍스트 추적
  const [foxDialogueText, setFoxDialogueText] = useState<string | null>(null)

  // 모달 표시 여부
  const [showConcernModal, setShowConcernModal] = useState(false)

  // 마지막 대화 표시 여부
  const [showFinalDialogue, setShowFinalDialogue] = useState(false)

  // 게임 설정 (사용자 제공 값으로 업데이트)
  const viewportWidth = 1366
  const viewportHeight = 768
  const playerSpeed = 5 // 이동 속도 증가 (3에서 5로)
  const playerSize = 50 // 플레이어 충돌 크기를 50으로 고정

  // 배경 이미지 크기 (사용자 제공 값으로 업데이트)
  const backgroundWidth = 2408
  const backgroundHeight = 2751

  // 게임 루프를 위한 requestAnimationFrame ID
  const animationFrameRef = useRef<number | null>(null)

  // 중앙 위치 계산
  const centerX = viewportWidth / 2 - playerSize / 2
  const centerY = viewportHeight / 2 - playerSize / 2

  // 상태 추가 (useState 부분에 추가)
  const [showStarGuide, setShowStarGuide] = useState(false)

  // 여우 대화 완료 이벤트 리스너 수정
  useEffect(() => {
    const handleFoxDialogueCompleted = () => {
      console.log("여우 대화 완료 이벤트 수신")
      setFoxDialogueCompleted(true)
      console.log("여우 대화 완료 상태로 설정됨")

      // 마지막 별 처리 중이면 즉시 대화 큐 처리
      if (processingLastStar && dialogueQueue.length === 0) {
        console.log("마지막 별 처리 중이고 대화 큐가 비어있음, 화면 전환 처리")

        // 화면 전환 처리
        setAllStarsDelivered(true)
        setProcessingLastStar(false)

        // 플레이어 위치 초기화 코드 제거
        // setPlayerWorldPosition({ x: 2030, y: 2560 })

        // 플레이어 방향을 정면(아래쪽)으로 설정
        setPlayerDirection("down")

        // 대화 큐 설정 - 두 부분으로 나누어 표시
        setDialogueQueue([
          {
            text: "의뢰서 작성을 부탁드릴게요 OOO님.\n종이와 펜은 저희 건물 안에 준비되어 있어요.",
            background: "/image/prince_text.png",
          },
        ])

        // 첫 번째 대화 표시
        setDialogueText(
          "이제 얼추 정리가 된 것 같군요. 다시 한 번 '장미'의 단장으로서 감사드립니다.\n그렇다면 이제 OOO님의 의뢰를 받아볼까요?",
        )
        setDialoguePosition("bottom") // 하단에 표시하도록 변경
        setDialogueBackground("/image/prince_text.png")
        setShowDialogue(true)
        setShowFinalDialogue(false) // 마지막 대화가 아님을 표시
      }
    }

    // foxDialogueFinished 이벤트 리스너 추가
    const handleFoxDialogueFinished = () => {
      console.log("여우 대화 완전히 종료 이벤트 수신")

      // 여우 대화 완료 이벤트 발생
      window.dispatchEvent(new CustomEvent("foxDialogueCompleted"))
    }

    window.addEventListener("foxDialogueCompleted", handleFoxDialogueCompleted)
    window.addEventListener("foxDialogueFinished", handleFoxDialogueFinished)

    return () => {
      window.removeEventListener("foxDialogueCompleted", handleFoxDialogueCompleted)
      window.removeEventListener("foxDialogueFinished", handleFoxDialogueFinished)
    }
  }, [processingLastStar, dialogueQueue])

  // 대화 배경 이미지 결정 함수
  const getDialogueBackground = (npcName: string): string => {
    switch (npcName) {
      case "어린왕자":
        return "/image/prince_text.png"
      case "장미":
        return "/image/rose_text.png"
      case "밥":
      case "바오밥":
        return "/image/bob_text.png"
      case "여우":
        return "/image/fox_text.png"
      default:
        return "/image/prince_text.png"
    }
  }

  // 대화 큐 처리 함수 수정
  const processDialogueQueue = () => {
    console.log("대화 큐 처리 중:", dialogueQueue.length, "개 남음")

    if (dialogueQueue.length > 0) {
      const nextDialogue = dialogueQueue[0]
      console.log("다음 대화 표시:", nextDialogue)

      setDialogueText(nextDialogue.text)
      setDialogueBackground(nextDialogue.background)
      setDialoguePosition("bottom")
      setShowDialogue(true)

      // 여우 대화인지 확인하고 텍스트 저장
      if (nextDialogue.background === "/image/fox_text.png") {
        setFoxDialogueText(nextDialogue.text)
        console.log("여우 대화 텍스트 저장:", nextDialogue.text)
      }

      // 큐에서 현재 대화 제거
      setDialogueQueue((prev) => prev.slice(1))

      // 마지막 대화인지 확인
      if (dialogueQueue.length === 1 && allStarsDelivered) {
        setShowFinalDialogue(true)
      }
    } else if (processingLastStar && foxDialogueCompleted) {
      // 마지막 별 전달 후 대화가 모두 끝났을 때
      console.log("마지막 별 처리 완료, 최종 메시지 표시")

      // 화면 전환 처리
      setProcessingLastStar(false)
      setAllStarsDelivered(true)

      // 플레이어 위치 초기화 코드 제거
      // setPlayerWorldPosition({ x: 2030, y: 2560 })

      // 플레이어 방향을 정면(아래쪽)으로 설정
      setPlayerDirection("down")

      // 대화 큐 설정 - 두 부분으로 나누어 표시
      setDialogueQueue([
        {
          text: "의뢰서 작성을 부탁드릴게요 OOO님.\n종이와 펜은 저희 건물 안에 준비되어 있어요.",
          background: "/image/prince_text.png",
        },
      ])

      // 첫 번째 대화 표시
      setDialogueText(
        "이제 얼추 정리가 된 것 같군요. 다시 한 번 '장미'의 단장으로서 감사드립니다.\n그렇다면 이제 OOO님의 의뢰를 받아볼까요?",
      )
      setDialoguePosition("bottom") // 하단에 표시하도록 변경
      setDialogueBackground("/image/prince_text.png")
      setShowDialogue(true)
      setShowFinalDialogue(false) // 마지막 대화가 아님을 표시
    }
  }

  // 마지막 대화 후 모달 표시
  const handleFinalDialogueClosed = () => {
    console.log("마지막 대화 닫힘, 이제 종이와 펜 오브젝트와 상호작용하세요")
    // 모달을 바로 표시하지 않고, 종이와 펜 오브젝트와 상호작용하도록 안내
    setShowFinalDialogue(false)
    // 모달 표시 코드 제거
    // setShowConcernModal(true)
  }

  // 모달 제출 처리
  const handleConcernSubmit = async (email: string, concern: string) => {
    console.log("모달 제출:", email, concern)

    try {
      // 로컬 스토리지에 이메일과 고민 저장 (select 페이지에서 사용하기 위해)
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userConcern", concern)

      // 모달 닫기
      setShowConcernModal(false)

      // select 페이지로 이동
      window.location.href = "/select"
    } catch (error) {
      console.error("고민 제출 실패:", error)
      alert("고민 제출 중 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }

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

        // 현재 게임 단계 설정
        setCurrentGameStage(gameState.currentStage)

        // 모든 별이 전달되었는지 확인
        if (
          gameState.currentStage === GameStage.REQUEST_INPUT ||
          gameState.currentStage === GameStage.NPC_SELECTION ||
          gameState.currentStage === GameStage.GAME_COMPLETE
        ) {
          setAllStarsDelivered(true)
        }

        // 대화 데이터 설정
        if (gameState.dialogues && gameState.dialogues.length > 0) {
          // quest_tutorial 대화 찾기
          const tutorialDialogue = gameState.dialogues.find((d: any) => d.quest_tutorial)

          if (tutorialDialogue) {
            setDialogueText(tutorialDialogue.quest_tutorial || tutorialDialogue.dialogueText)
            setDialoguePosition("bottom") // 튜토리얼을 하단에 표시하도록 변경
          } else {
            // 어린왕자의 대화 찾기
            const princeDialogue = gameState.dialogues.find((d: any) => d.npcName === "어린왕자")

            if (princeDialogue) {
              setDialogueText(
                princeDialogue.dialogueText ||
                  `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
              )
              setDialoguePosition("bottom") // 기본 대화도 하단에 표시하도록 변경
            } else {
              // 기본 튜토리얼 텍스트 설정
              setDialogueText(
                `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
              )
              setDialoguePosition("bottom") // 하단에 표시하도록 변경
            }
          }
        } else {
          // 대화 데이터가 없는 경우 기본 텍스트 설정
          setDialogueText(
            `${userName}님, 저희가 각각 관리하는 감정의 별이 흩어져있는 상태입니다.$n단원들에게 어떤 별을 전달 해 줘야 하는지 제가 알려드리겠습니다.`,
          )
          setDialoguePosition("bottom") // 하단에 표시하도록 변경
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

          // 현재 게임 단계 설정
          setCurrentGameStage(gameState.currentStage)

          // 모든 별이 전달되었는지 확인
          if (
            gameState.currentStage === GameStage.REQUEST_INPUT ||
            gameState.currentStage === GameStage.NPC_SELECTION ||
            gameState.currentStage === GameStage.GAME_COMPLETE
          ) {
            setAllStarsDelivered(true)
          }

          // 로컬 스토리지에 게임 상태 저장
          localStorage.setItem("gameState", JSON.stringify(gameState))

          // 게임 상태 업데이트 이벤트 발생
          window.dispatchEvent(new CustomEvent("gameStateUpdated"))

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

  // 대화창이 닫힐 때 다음 대화 표시
  useEffect(() => {
    if (!showDialogue) {
      if (showFinalDialogue) {
        // 마지막 대화가 닫혔을 때 모달 표시
        handleFinalDialogueClosed()
        setShowFinalDialogue(false)
      } else {
        // 일반 대화 큐 처리
        processDialogueQueue()
      }
    }
  }, [showDialogue, dialogueQueue, showFinalDialogue])

  // 별 수집 이벤트 리스너
  useEffect(() => {
    const handleStarCollected = (event: CustomEvent) => {
      const { starType, gameState } = event.detail
      console.log(`별 수집 이벤트 발생: ${starType}`, gameState)

      // 현재 게임 단계 설정
      setCurrentGameStage(gameState.currentStage)

      // 대화 데이터 설정
      if (gameState.dialogues && gameState.dialogues.length > 0) {
        console.log("수집 후 대화 데이터:", gameState.dialogues)

        // 가장 최근 대화를 사용 (API 응답의 마지막 대화)
        const latestDialogue = gameState.dialogues[gameState.dialogues.length - 1]

        if (latestDialogue && latestDialogue.dialogueText) {
          console.log("표시할 대화:", latestDialogue.dialogueText)
          setDialogueText(latestDialogue.dialogueText)
          setDialoguePosition("bottom") // 별 수집 후 대화는 하단에 표시

          // 대화 NPC에 따라 배경 이미지 설정
          setDialogueBackground(getDialogueBackground(latestDialogue.npcName))

          // 대화 큐 초기화 (새로운 별 수집 시 이전 대화 큐는 무시)
          setDialogueQueue([])
          console.log("별 수집으로 대화 큐 초기화")

          setShowDialogue(true)
        } else {
          console.log("대화 텍스트가 없습니다.")
        }
      }
    }

    const handleStarDelivered = (event: CustomEvent) => {
      const { npcId, starType, gameState, npcInfo } = event.detail
      console.log(`별 전달 이벤트 발생: ${npcId}, ${starType}`, gameState)

      // 현재 게임 단계 설정
      setCurrentGameStage(gameState.currentStage)

      // 마지막 별인지 확인 (슬픔 별)
      const isLastStar = starType === StarType.SAD

      // 마지막 별이면 처리 중 상태로 설정
      if (isLastStar && gameState.currentStage === GameStage.DELIVER_SAD) {
        console.log("마지막 별(슬픔) 전달 감지, 처리 중 상태로 설정")
        setProcessingLastStar(true)
        // 여우 대화 완료 상태 초기화
        setFoxDialogueCompleted(false)
      }

      // 대화 데이터 설정
      if (gameState.dialogues) {
        console.log("전달 후 대화 데이터:", gameState.dialogues)

        // 여우 NPC인 경우 특별 처리
        if (npcId === "fox") {
          console.log("여우 NPC 대화 특별 처리")

          // NPC 매니저의 여우 대화 처리 함수 사용
          const foxDialogueQueue = npcManagerRef.current.handleFoxDialogue(gameState.dialogues)

          // 첫 번째 대화 표시하고 나머지는 큐에 저장
          if (foxDialogueQueue.length > 0) {
            const firstDialogue = foxDialogueQueue[0]
            setDialogueText(firstDialogue.text)
            setDialoguePosition("bottom")
            setDialogueBackground(firstDialogue.background)
            setShowDialogue(true)

            // 나머지 대화 큐에 저장
            if (foxDialogueQueue.length > 1) {
              setDialogueQueue(foxDialogueQueue.slice(1))
              console.log("여우 대화 큐 저장:", foxDialogueQueue.slice(1))

              // 여우 대화 텍스트 저장 - 모든 대화 텍스트를 저장
              foxDialogueQueue.forEach((dialogue: any) => {
                if (dialogue.background === "/image/fox_text.png") {
                  setFoxDialogueText(dialogue.text)
                }
              })
            } else {
              setDialogueQueue([])
              // 대화가 하나뿐이면 바로 여우 대화 텍스트 저장
              if (firstDialogue.background === "/image/fox_text.png") {
                setFoxDialogueText(firstDialogue.text)
              }
            }
          }
          return
        }

        // 대화 순서 관리를 위한 새로운 큐 생성
        const newDialogueQueue: { text: string; background: string }[] = []

        // 대화 ID 기준으로 정렬 (오름차순)
        const sortedDialogues = [...gameState.dialogues].sort((a, b) => a.dialogueId - b.dialogueId)
        console.log("정렬된 대화:", sortedDialogues)

        // 모든 대화를 순서대로 큐에 추가
        sortedDialogues.forEach((dialogue) => {
          if (dialogue.dialogueText && dialogue.dialogueText.trim() !== "") {
            let background = "/image/prince_text.png" // 기본 배경

            // NPC에 따라 배경 설정
            if (dialogue.npcName === "어린왕자") {
              background = "/image/prince_text.png"
            } else if (dialogue.npcName === "장미") {
              background = "/image/rose_text.png"
            } else if (dialogue.npcName === "밥" || dialogue.npcName === "바오밥") {
              background = "/image/bob_text.png"
            } else if (dialogue.npcName === "여우") {
              background = "/image/fox_text.png"
            } else if (npcInfo && npcInfo.dialogueBackground) {
              background = npcInfo.dialogueBackground
            }

            newDialogueQueue.push({
              text: dialogue.dialogueText,
              background: background,
            })
          }
        })

        console.log("생성된 대화 큐:", newDialogueQueue)

        // 첫 번째 대화 표시하고 나머지는 큐에 저장
        if (newDialogueQueue.length > 0) {
          const firstDialogue = newDialogueQueue[0]
          setDialogueText(firstDialogue.text)
          setDialoguePosition("bottom")
          setDialogueBackground(firstDialogue.background)
          setShowDialogue(true)

          // 나머지 대화 큐에 저장
          if (newDialogueQueue.length > 1) {
            setDialogueQueue(newDialogueQueue.slice(1))
            console.log("대화 큐 저장:", newDialogueQueue.slice(1))
          } else {
            setDialogueQueue([])
          }
        }
      }
    }

    // 별이 없는 경우 이벤트 리스너 추가
    const handleNoStarToDeliver = (event: CustomEvent) => {
      const { npcId, message, npcInfo } = event.detail
      console.log(`별 없음 이벤트 발생: ${npcId}`, message)

      setDialogueText(message)
      setDialoguePosition("bottom")

      // NPC에 맞는 대화창 배경 설정
      if (npcInfo && npcInfo.dialogueBackground) {
        setDialogueBackground(npcInfo.dialogueBackground)
      } else {
        // 기본값은 어린왕자 대화창
        setDialogueBackground("/image/prince_text.png")
      }

      setShowDialogue(true)
      // 대화 큐 초기화
      setDialogueQueue([])
    }

    // 이미 전달한 경우 이벤트 리스너 추가
    const handleStarAlreadyDelivered = (event: CustomEvent) => {
      const { npcId, message, npcInfo } = event.detail
      console.log(`이미 전달 이벤트 발생: ${npcId}`, message)

      setDialogueText(message)
      setDialoguePosition("bottom")

      // NPC에 맞는 대화창 배경 설정
      if (npcInfo && npcInfo.dialogueBackground) {
        setDialogueBackground(npcInfo.dialogueBackground)
      } else {
        // 기본값은 어린왕자 대화창
        setDialogueBackground("/image/prince_text.png")
      }

      setShowDialogue(true)
      // 대화 큐 초기화
      setDialogueQueue([])
    }

    // 모든 별이 전달된 경우 이벤트 리스너 수정
    const handleAllStarsDelivered = (event: CustomEvent) => {
      const { gameState, message } = event.detail
      console.log("모든 별 전달 완료 이벤트 발생:", gameState)

      // 현재 게임 단계 설정
      setCurrentGameStage(gameState.currentStage)

      // 모든 별이 전달되었음을 표시
      setAllStarsDelivered(true)

      // 플레이어 위치 초기화 코드 제거
      // setPlayerWorldPosition({ x: 2030, y: 2560 })

      // 플레이어 방향을 정면(아래쪽)으로 설정
      setPlayerDirection("down")

      // 대화 큐 설정 - 두 부분으로 나누어 표시
      setDialogueQueue([
        {
          text: "의뢰서 작성을 부탁드릴게요 OOO님.\n종이와 펜은 저희 건물 안에 준비되어 있어요.",
          background: "/image/prince_text.png",
        },
      ])

      // 첫 번째 대화 표시
      setDialogueText(
        "이제 얼추 정리가 된 것 같군요. 다시 한 번 '장미'의 단장으로서 감사드립니다.\n그렇다면 이제 OOO님의 의뢰를 받아볼까요?",
      )
      setDialoguePosition("bottom") // 하단에 표시하도록 변경
      setDialogueBackground("/image/prince_text.png")
      setShowDialogue(true)
      setShowFinalDialogue(false) // 마지막 대화가 아님을 표시

      console.log("모든 별 전달 완료로 대화 큐 초기화 및 새 대화 설정")
    }

    // 이벤트 리스너 등록
    window.addEventListener("starCollected", handleStarCollected as EventListener)
    window.addEventListener("starDelivered", handleStarDelivered as EventListener)
    window.addEventListener("noStarToDeliver", handleNoStarToDeliver as EventListener)
    window.addEventListener("starAlreadyDelivered", handleStarAlreadyDelivered as EventListener)
    window.addEventListener("allStarsDelivered", handleAllStarsDelivered as EventListener)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("starCollected", handleStarCollected as EventListener)
      window.removeEventListener("starDelivered", handleStarDelivered as EventListener)
      window.removeEventListener("noStarToDeliver", handleNoStarToDeliver as EventListener)
      window.removeEventListener("starAlreadyDelivered", handleStarAlreadyDelivered as EventListener)
      window.removeEventListener("allStarsDelivered", handleAllStarsDelivered as EventListener)
    }
  }, [dialogueQueue, foxDialogueText])

  // 오브젝트 상호작용 이벤트 리스너 추가 (useEffect 내부에 추가)
  useEffect(() => {
    const handleObjectInteraction = (event: CustomEvent) => {
      const { itemType, itemId } = event.detail
      console.log(`오브젝트 상호작용: ${itemType}, ${itemId}`)

      // 오브젝트 타입에 따른 처리
      switch (itemType) {
        case "book":
          console.log("별 도감 오브젝트와 상호작용")
          // 나중에 별 도감 UI 표시 기능 구현
          break
        case "write":
        case "pen":
          console.log("의뢰 작성 오브젝트와 상호작용")
          // 모든 별이 전달된 상태에서만 모달 표시
          if (allStarsDelivered) {
            setShowConcernModal(true)
          }
          break
        default:
          console.log("알 수 없는 오브젝트 타입")
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener("objectInteraction", handleObjectInteraction as EventListener)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("objectInteraction", handleObjectInteraction as EventListener)
    }
  }, [allStarsDelivered]) // allStarsDelivered 의존성 추가

  // 이벤트 리스너 추가 (useEffect 내부에 추가)
  useEffect(() => {
    const handleOpenStarGuide = () => {
      setShowStarGuide(true)
    }

    const handleCloseStarGuide = () => {
      setShowStarGuide(false)
    }

    window.addEventListener("openStarGuide", handleOpenStarGuide)
    window.addEventListener("closeStarGuide", handleCloseStarGuide)

    return () => {
      window.removeEventListener("openStarGuide", handleOpenStarGuide)
      window.removeEventListener("closeStarGuide", handleCloseStarGuide)
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

    // 대화창 배경 이미지 프리로드
    const dialogueBackgrounds = [
      "/image/prince_text.png",
      "/image/rose_text.png",
      "/image/bob_text.png",
      "/image/fox_text.png",
    ]

    dialogueBackgrounds.forEach((path) => {
      const img = new Image()
      img.src = path
    })

    // 모달 배경 이미지 프리로드
    const modalImg = new Image()
    modalImg.src =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/text_area-KSGnCarJU7ilD503MvDlydr44XyMrG.png"
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
        // 상호작용 가능한 NPC가 있는지 확인
        else if (interactableNPC && npcManagerRef.current) {
          // NPC와 상호작용
          npcManagerRef.current.interactWithNPC(interactableNPC)
          // 상호작용 후 상태 초기화
          setInteractableNPC(null)
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
  }, [interactableItem, interactableNPC, showDialogue])

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
      if (keysPressed["ArrowUp"]) {
        const testY = newY - playerSpeed

        // 충돌 감지 - 중앙 지점만 확인하여 성능 향상
        const canMove = collisionMapRef.current?.isWalkable(newX + playerSize / 2, testY + playerSize / 2)

        if (canMove) {
          newY = testY
        }

        newDirection = "up"
        isPlayerMoving = true
      } else if (keysPressed["ArrowDown"]) {
        const testY = newY + playerSpeed

        // 충돌 감지 - 중앙 지점만 확인
        const canMove = collisionMapRef.current?.isWalkable(newX + playerSize / 2, testY + playerSize / 2)

        if (canMove) {
          newY = testY
        }

        newDirection = "down"
        isPlayerMoving = true
      } else if (keysPressed["ArrowLeft"]) {
        const testX = newX - playerSpeed

        // 충돌 감지 - 중앙 지점만 확인
        const canMove = collisionMapRef.current?.isWalkable(testX + playerSize / 2, newY + playerSize / 2)

        if (canMove) {
          newX = testX
        }

        newDirection = "left"
        isPlayerMoving = true
      } else if (keysPressed["ArrowRight"]) {
        const testX = newX + playerSpeed

        // 충돌 감지 - 중앙 지점만 확인
        const canMove = collisionMapRef.current?.isWalkable(testX + playerSize / 2, newY + playerSize / 2)

        if (canMove) {
          newX = testX
        }

        newDirection = "right"
        isPlayerMoving = true
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

      // 상호작용 가능한 NPC 확인
      if (npcManagerRef.current) {
        const npc = npcManagerRef.current.getInteractableNPC(newX, newY)
        if (npc) {
          setInteractableNPC(npc.id)
        } else {
          setInteractableNPC(null)
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
            npcManagerRef.current.renderNPCs(ctx, bgX, bgY, newX, newY)
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

  // 게임 렌더링 부분 수정 - 모든 별이 전달되어도 배경과 아이템 표시
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
          backgroundColor: "transparent", // 항상 투명 배경 사용
        }}
      >
        {/* 배경 - 항상 표시 */}
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

        {/* 캔버스 오버레이 (NPC 및 아이템 렌더링용) - 항상 표시 */}
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
            left: `${playerScreenPosition.x - playerSize * 1.5}px`, // 항상 실제 위치 사용
            top: `${playerScreenPosition.y - playerSize * 3}px`, // 항상 실제 위치 사용
            backgroundImage: `url('${playerSprite}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            zIndex: 10,
            imageRendering: "pixelated", // 픽셀 아트 이미지를 선명하게 표시
          }}
        />

        {/* 상호작용 안내 메시지 - 항상 표시 가능 */}
        {(interactableItem || interactableNPC) && (
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
              bottom: dialoguePosition === "bottom" ? 0 : "auto",
              top: dialoguePosition === "center" ? "50%" : "auto",
              left: 0,
              width: "100%",
              transform: dialoguePosition === "center" ? "translateY(-50%)" : "none",
              zIndex: 30,
            }}
          >
            <DialogueBox
              text={dialogueText}
              onClose={() => {
                setShowDialogue(false)
              }}
              userName={userName || "모험가"}
              position={dialoguePosition}
              backgroundImage={dialogueBackground}
            />
          </div>
        )}

        {/* 모달 창 */}
        {showConcernModal && (
          <ConcernModal onSubmit={handleConcernSubmit} onClose={() => setShowConcernModal(false)} userName={userName} />
        )}
      </div>

      {/* 디버그 정보 - 항상 표시 가능 */}
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
      </div>
      {showStarGuide && <StarGuide onClose={() => setShowStarGuide(false)} />}
    </div>
  )
}
