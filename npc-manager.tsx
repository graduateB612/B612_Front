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
  private redArrowImage: HTMLImageElement | null = null // 빨간 화살표 이미지 추가
  private isDebugMode = false // 디버그 모드 플래그
  private collectedStars: Set<StarType> = new Set() // 수집한 별 목록
  private deliveredStars: Set<StarType> = new Set() // 전달한 별 목록
  private currentGameState: GameStateResponse | null = null // 현재 게임 상태
  private allStarsDeliveredFlag = false // 모든 별이 전달되었는지 여부
  private foxDialogueInProgress = false // 여우 대화 진행 중 여부
  private foxDialogueQueue: { text: string; background: string }[] = [] // 여우 대화 큐
  private animationOffset = 0 // 화살표 애니메이션용 오프셋
  private lastAnimationTime = 0 // 마지막 애니메이션 시간

  constructor() {
    // NPC 초기화
    this.initializeNPCs()
    // 상호작용 표시 이미지 로드
    this.loadInteractionIndicator()
    // 빨간 화살표 이미지 로드
    this.loadRedArrowImage()
    // 게임 상태 로드
    this.loadGameState()

    // URL 파라미터에서 디버그 모드 확인 (예: ?debug=true)
    this.isDebugMode =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "true"

    // 대화 완료 이벤트 리스너 등록
    if (typeof window !== "undefined") {
      window.addEventListener("dialogueClosed", this.handleDialogueClosed.bind(this))
      window.addEventListener("foxDialogueFinished", this.handleFoxDialogueFinished.bind(this))
    }
  }

  // 여우 대화 완전히 종료 이벤트 핸들러 (모든 대화가 끝난 후)
  private handleFoxDialogueFinished(): void {
    this.safeLog("여우 대화 완전히 종료 이벤트 감지")

    // 여우 대화 진행 중 상태 해제
    this.foxDialogueInProgress = false

    // 여우 대화가 완료되었음을 표시하는 이벤트 발생
    window.dispatchEvent(new CustomEvent("foxDialogueCompleted"))

    // 모든 별이 전달되었는지 확인하고 이벤트 발생
    if (
      this.deliveredStars.has(StarType.PRIDE) &&
      this.deliveredStars.has(StarType.ENVY) &&
      this.deliveredStars.has(StarType.LONELY) &&
      this.deliveredStars.has(StarType.SAD) &&
      !this.allStarsDeliveredFlag
    ) {
      this.safeLog("여우 대화 완료 후 모든 별 전달 완료 이벤트 발생")
      // 지연 없이 즉시 이벤트 발생
      this.triggerAllStarsDeliveredEvent()
    }
  }

  // 대화 완료 이벤트 핸들러 (개별 대화 종료 시)
  private handleDialogueClosed(): void {
    // 여우 대화 진행 중이 아니면 무시
    if (!this.foxDialogueInProgress) {
      return
    }

    this.safeLog("여우 대화 중 대화창 닫힘 이벤트 감지")

    // 여우 대화 큐가 비어있으면 모든 대화가 끝난 것
    if (this.foxDialogueQueue.length === 0) {
      this.safeLog("여우 대화 큐가 비어있음, 대화 완료 처리")
      // 여우 대화 완전히 종료 이벤트 발생 - 즉시 발생
      window.dispatchEvent(new CustomEvent("foxDialogueFinished"))
    }
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
        } catch {
          
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

    // 모든 별이 전달되었는지 확인 (여우 대화 중이 아닐 때만)
    if (
      this.deliveredStars.has(StarType.PRIDE) &&
      this.deliveredStars.has(StarType.ENVY) &&
      this.deliveredStars.has(StarType.LONELY) &&
      this.deliveredStars.has(StarType.SAD) &&
      !this.foxDialogueInProgress
    ) {
      // 모든 별이 전달되었으면 이벤트 발생
      this.safeLog("모든 별이 전달되었습니다!")

      // 이미 REQUEST_INPUT 단계 이상이면 이벤트를 발생시키지 않음
      if (currentStage !== GameStage.REQUEST_INPUT && !this.isLaterStage(currentStage, GameStage.REQUEST_INPUT)) {
        // 여우 대화가 진행 중이 아닐 때만 이벤트 발생
        if (!this.foxDialogueInProgress) {
          this.triggerAllStarsDeliveredEvent()
        }
      } else {
        // REQUEST_INPUT 단계 이상이면 모든 별이 전달된 상태로 설정
        this.allStarsDeliveredFlag = true
      }
    }
  }

  // 모든 별이 전달된 경우 이벤트 발생
  private async triggerAllStarsDeliveredEvent(): Promise<void> {
    try {
      // 이미 이벤트가 발생했으면 중복 발생 방지
      if (this.allStarsDeliveredFlag) {
        return
      }

      // 여우 대화가 진행 중이면 이벤트 발생 중지
      if (this.foxDialogueInProgress) {
        return
      }

      // 로컬 스토리지에서 userId 가져오기
      const userId = localStorage.getItem("userId")
      if (!userId) {
        return
      }

      // API 호출 대신 로컬 상태만 업데이트

      // 현재 게임 상태 가져오기
      const currentGameStateStr = localStorage.getItem("gameState")
      let currentGameState = null

      if (currentGameStateStr) {
        try {
          currentGameState = JSON.parse(currentGameStateStr)
        } catch {
          
        }
      }

      // 로컬 게임 상태 업데이트
      const updatedGameState = {
        userId,
        currentStage: GameStage.REQUEST_INPUT,
        dialogues: currentGameState?.dialogues || [],
      }

      // 로컬 스토리지에 게임 상태 저장
      localStorage.setItem("gameState", JSON.stringify(updatedGameState))
      this.currentGameState = updatedGameState

      // 모든 별이 전달된 상태로 설정
      this.allStarsDeliveredFlag = true

      // 게임 상태 업데이트 이벤트 발생
      window.dispatchEvent(new CustomEvent("gameStateUpdated"))

      // 모든 별 전달 완료 이벤트 발생
      const allStarsDeliveredEvent = new CustomEvent("allStarsDelivered", {
        detail: {
          gameState: updatedGameState,
          message:
            "이제 얼추 정리가 된 것 같군요. 다시 한 번 '장미'의 단장으로서 감사드립니다.\n그렇다면 이제 OOO님의 의뢰를 받아볼까요?",
        },
      })
      window.dispatchEvent(allStarsDeliveredEvent)
    } catch {
      
    }
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
        interactionDistance: 250,
        acceptsStarType: StarType.ENVY,
      },
      {
        id: "bob",
        x: 350, // 하단 빨간색 영역 (이미지 좌측 하단 부분)
        y: 2450,
        width: npcSize,
        height: npcSize,
        imagePath: "/image/npc_bob.png",
        interactionDistance: 250,
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

  private loadRedArrowImage(): void {
    // 빨간 화살표 이미지 로드
    const img = new Image()
    img.onload = () => {
      this.redArrowImage = img
    }
    img.src = "/image/arrow-red.png"
  }

  // 안전한 로그 출력 함수 - 디버그 모드에서만 출력
  private safeLog(...args: unknown[]): void {
    if (this.isDebugMode) {
      // 디버그 모드에서만 로그 (실제 출력은 비활성화)
      void args
    }
  }

  // NPC 이미지 프리로드
  public preloadImages(): Promise<void> {
    this.safeLog("NPC 이미지 프리로드 시작...")

    // 빨간 화살표 이미지 프리로드
    const redArrowImg = new Image()
    redArrowImg.src = "/image/arrow-red.png"
    this.imageCache["/image/arrow-red.png"] = redArrowImg

    const promises = this.npcs.map((npc) => {
      return new Promise<void>((resolve) => {
        const img = new Image()

        img.onload = () => {
          this.safeLog(`NPC 이미지 로드 성공: ${npc.imagePath}`)
          this.imageCache[npc.imagePath] = img
          resolve()
        }

        img.onerror = () => {
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
      .catch(() => {
        
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
    // 모든 별이 전달되었는지 확인 - 대화 완료 후 사라지도록 수정
    if (this.allStarsDeliveredFlag) {
      return
    }

    // 애니메이션 오프셋 업데이트 (위아래 움직임)
    const now = Date.now()
    if (now - this.lastAnimationTime > 50) {
      this.animationOffset = Math.sin(now / 300) * 10 // -10 ~ 10 픽셀 범위로 움직임
      this.lastAnimationTime = now
    }

    // 모든 NPC 렌더링 (별 전달 여부와 관계없이)
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
        // 플레이어가 멀리 있지만 별을 수집했고 전달하지 않은 경우 빨간 화살표 표시
        else if (
          !this.isPlayerNearNPC(playerX, playerY, npc) &&
          npc.acceptsStarType &&
          this.collectedStars.has(npc.acceptsStarType) &&
          !this.deliveredStars.has(npc.acceptsStarType) &&
          this.redArrowImage
        ) {
          // 빨간 화살표 렌더링 (NPC 위에 애니메이션과 함께 표시)
          ctx.drawImage(
            this.redArrowImage,
            npc.x + offsetX + npc.width / 2 - 25, // NPC 중앙 위에 위치
            npc.y + offsetY - 70 + this.animationOffset, // NPC 위에 위치 + 애니메이션
            50, // 화살표 크기 (40 * 1.25 = 50)
            50,
          )
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
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      ctx.fillText("대화", x + 25, y + 18)

      // 사각형 배경
      ctx.strokeStyle = "white"
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, 50, 25)
    }
  }

  // 플레이어가 NPC 근처에 있는지 확인
  public isPlayerNearNPC(playerX: number, playerY: number, npc: NPC): boolean {
    const distance = Math.sqrt(Math.pow(playerX - npc.x, 2) + Math.pow(playerY - npc.y, 2))
    return distance <= npc.interactionDistance
  }

  // 플레이어가 상호작용 가능한 NPC가 있는지 확인
  public getInteractableNPC(playerX: number, playerY: number): NPC | null {
    // 모든 별이 전달되었으면 상호작용 가능한 NPC가 없음
    if (this.allStarsDeliveredFlag) {
      return null
    }

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

  // 여우 NPC 대화 처리를 위한 특별 함수
  public handleFoxDialogue(dialogues: { npcName?: string; dialogueText?: string }[]): { text: string; background: string }[] {

    // 대화 데이터가 없으면 기본 대화 반환
    if (!dialogues || dialogues.length === 0) {
      return [
        {
          text: "어린왕자: 바로 '여우'입니다.",
          background: "/image/prince_text.png",
        },
        {
          text: "여우: 와! 내 별이다! 정말정말 고마워! 오늘 오기로 한 의뢰인이 당신이구나? 어떤 의뢰인진 모르겠지만 이 별은 당신을 위해 사용할게.",
          background: "/image/fox_text.png",
        },
      ]
    }

    // 대화 데이터에서 여우와 어린왕자 대화 찾기
    const foxDialogues = dialogues.filter((d) => d.npcName === "여우" || d.npcName === "fox" || d.npcName === "Fox")

    const princeDialogues = dialogues.filter(
      (d) => d.npcName === "어린왕자" || d.npcName === "prince" || d.npcName === "Prince",
    )

    

    // 대화 큐 생성
    const dialogueQueue: { text: string; background: string }[] = []

    // 어린왕자 대화 먼저 추가 (바로 '여우'입니다.)
    if (princeDialogues.length > 0) {
      const princeDialogue = princeDialogues[0]
      if (princeDialogue.dialogueText && princeDialogue.dialogueText.trim() !== "") {
        dialogueQueue.push({
          text: princeDialogue.dialogueText,
          background: "/image/prince_text.png",
        })
      } else {
        // 어린왕자 대화가 없거나 비어있으면 기본 대화 추가
        dialogueQueue.push({
          text: "바로 '여우'입니다.",
          background: "/image/prince_text.png",
        })
      }
    } else {
      // 어린왕자 대화가 없으면 기본 대화 추가
      dialogueQueue.push({
        text: "바로 '여우'입니다.",
        background: "/image/prince_text.png",
      })
    }

    // 여우 대화 추가
    if (foxDialogues.length > 0) {
      foxDialogues.forEach((dialogue) => {
        if (dialogue.dialogueText && dialogue.dialogueText.trim() !== "") {
          dialogueQueue.push({
            text: dialogue.dialogueText,
            background: "/image/fox_text.png",
          })
        }
      })
    } else {
      // 여우 대화가 없으면 기본 대화 추가
      dialogueQueue.push({
        text: "와! 내 별이다! 정말정말 고마워! 오늘 오기로 한 의뢰인이 당신이구나? 어떤 의뢰인진 모르겠지만 이 별은 당신을 위해 사용할게.",
        background: "/image/fox_text.png",
      })
    }

    // 대화 큐가 비어있으면 기본 대화 추가
    if (dialogueQueue.length === 0) {
      dialogueQueue.push({
        text: "어린왕자: 바로 '여우'입니다.",
        background: "/image/prince_text.png",
      })
      dialogueQueue.push({
        text: "여우: 와! 내 별이다! 정말정말 고마워! 오늘 오기로 한 의뢰인이 당신이구나? 어떤 의뢰인진 모르겠지만 이 별은 당신을 위해 사용할게.",
        background: "/image/fox_text.png",
      })
    }

    

    // 여우 대화 큐 저장
    this.foxDialogueQueue = [...dialogueQueue]

    return dialogueQueue
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
        return
      }

      // 이미 수집한 별이 있고, 아직 전달하지 않은 경우에만 처리
      if (this.collectedStars.has(npc.acceptsStarType) && !this.deliveredStars.has(npc.acceptsStarType)) {
        

        // 여우 NPC인 경우 대화 진행 중 상태로 설정
        if (npc.id === "fox" && npc.acceptsStarType === StarType.SAD) {
          this.foxDialogueInProgress = true
          this.safeLog("여우 대화 진행 중 상태로 설정")
        }

        const response = await deliverStar(userId, npc.acceptsStarType)

        // 응답 데이터 상세 로깅
        if (response.dialogues && response.dialogues.length > 0) {
          // 대화 데이터 존재 여부만 확인 (사용 안 함)
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
