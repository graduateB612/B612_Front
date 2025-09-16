"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { createUser, startGame } from "@/lib/api-config"

// 대화 배열을 컴포넌트 외부로 이동
const DIALOGS = [
  "어라? 안녕하세요.\n오늘 방문 해 주시기로 한 의뢰인 분.. 맞으시죠?",
  "죄송해요. 지금 저희가 아주아주 작은 문제가 생겨서..\n괜찮으시다면 여기 성함을 작성한 뒤, 잠시만 기다려 주세요."
]

const CHARACTER_DIALOGS = ["무슨 일이냐구요? \n 아 그건.."]

const STORY_TEXTS = [
  "당신은 해결단 '장미'에 일어난 문제에 대해 듣습니다.",
  "바로 그들이 관리하는 '감정의 별'이 그만 흩어져버린 것이죠.\n흩어져 있는 별은 모두 정화가 필요한 '부정적 감정의 별'",
  "이 감정의 별은 평범한 사람들 눈에 보이지 않지만,\n당신의 눈에는 별들의 위치가 훤히 보이고 있습니다.",
  "당신은 어딘지 모르게 허술한 그들을 도와 감정의 별 회수를 도와주고자 합니다.\n'장미'와 함께 하시겠습니까?"
]

export default function Page() {
  const [currentText, setCurrentText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [dialogStep, setDialogStep] = useState(0)
  const [name, setName] = useState("")
  const [showNameInput, setShowNameInput] = useState(false)
  const [showChoices, setShowChoices] = useState(false)
  const [characterDialogStep, setCharacterDialogStep] = useState(0)
  const [showStorySection, setShowStorySection] = useState(false)
  const [storyTextIndex, setStoryTextIndex] = useState(0)
  const [starsAnimating, setStarsAnimating] = useState(false)
  const [visibleStarsCount, setVisibleStarsCount] = useState(0)
  const [starsAnimationComplete, setStarsAnimationComplete] = useState(false)
  const [storyText, setStoryText] = useState("")
  const [storyTyping, setStoryTyping] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const storyTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mainTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 타이핑 효과 - 타이머 관리 추가
  useEffect(() => {
    if (!isTyping) return;

    let currentMessage = "";
    
    // 현재 표시할 메시지 결정
    if (characterDialogStep > 0) {
      currentMessage = CHARACTER_DIALOGS[characterDialogStep - 1];
    } else if (dialogStep >= DIALOGS.length && name) {
      currentMessage = `감사합니다 ${name}님!`;
    } else if (dialogStep < DIALOGS.length) {
      currentMessage = DIALOGS[dialogStep];
    }
    
    if (!currentMessage) {
      setIsTyping(false);
      return;
    }
    
    // 이전 타이머 정리
    if (mainTypingTimeoutRef.current) {
      clearTimeout(mainTypingTimeoutRef.current);
    }
    
    // 초기화
    setCurrentText("");
    let index = 0;
    
    const typeNextChar = () => {
      if (index < currentMessage.length) {
        setCurrentText(currentMessage.substring(0, index + 1));
        index++;
        mainTypingTimeoutRef.current = setTimeout(typeNextChar, 50);
      } else {
        setIsTyping(false);
        mainTypingTimeoutRef.current = null;
      }
    };
    
    // 타이핑 시작
    mainTypingTimeoutRef.current = setTimeout(typeNextChar, 50);
    
    return () => {
      if (mainTypingTimeoutRef.current) {
        clearTimeout(mainTypingTimeoutRef.current);
      }
    };
    
  }, [isTyping, dialogStep, name, characterDialogStep]);

  // 컴포넌트 마운트 시 첫 번째 대화 시작
  useEffect(() => {
    setIsTyping(true);
  }, [])

  // 스토리 섹션 시작 시 초기화 - app/page.tsx와 동일
  useEffect(() => {
    if (showStorySection) {
      setStoryTextIndex(0)
      setStoryText("")
      setStoryTyping(true)
    }
  }, [showStorySection])

  // 스토리 타이핑 효과
  useEffect(() => {
    if (showStorySection && storyTextIndex < STORY_TEXTS.length) {
      setStoryText("")
      setStoryTyping(true)
      
      const text = STORY_TEXTS[storyTextIndex]
      let charIndex = 0
      
      const typeNextChar = () => {
        if (charIndex < text.length) {
          setStoryText(text.slice(0, charIndex + 1))
          charIndex++
          storyTypingTimeoutRef.current = setTimeout(typeNextChar, 50)
        } else {
          setStoryTyping(false)
        }
      }
      
      storyTypingTimeoutRef.current = setTimeout(typeNextChar, 50)
      
      return () => {
        if (storyTypingTimeoutRef.current) {
          clearTimeout(storyTypingTimeoutRef.current)
        }
      }
    }
  }, [storyTextIndex, showStorySection])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (storyTypingTimeoutRef.current) {
        clearTimeout(storyTypingTimeoutRef.current);
      }
      if (mainTypingTimeoutRef.current) {
        clearTimeout(mainTypingTimeoutRef.current);
      }
    };
  }, [])

  const handleClick = () => {
    if (showChoices || showNameInput) {
      return
    }

    if (isTyping) {
      // 타이핑 중단 처리
      if (mainTypingTimeoutRef.current) {
        clearTimeout(mainTypingTimeoutRef.current);
        mainTypingTimeoutRef.current = null;
      }
      
      setIsTyping(false)
      let currentMessage = "";
      
      if (characterDialogStep > 0) {
        currentMessage = CHARACTER_DIALOGS[characterDialogStep - 1];
      } else if (dialogStep >= DIALOGS.length && name) {
        currentMessage = `감사합니다 ${name}님!`;
      } else {
        currentMessage = DIALOGS[dialogStep];
      }
      
      setCurrentText(currentMessage)
    } else {
      if (characterDialogStep > 0) {
        if (characterDialogStep < CHARACTER_DIALOGS.length) {
          setCharacterDialogStep(prev => prev + 1)
          setIsTyping(true)
        } else {
          setShowStorySection(true)
        }
      } else if (dialogStep >= DIALOGS.length && name) {
        setShowChoices(true)
      } else if (dialogStep < DIALOGS.length - 1) {
        setDialogStep(prev => prev + 1)
        setIsTyping(true)
      } else {
        setShowNameInput(true)
      }
    }
  }

  const handleChoice = (choice: "help" | "noHelp") => {
    setShowChoices(false)

    if (choice === "help") {
      setCharacterDialogStep(1)
      setIsTyping(true)
    } else {
      // 메인 페이지의 마지막 섹션으로 이동
      localStorage.setItem("targetSection", "5")
      window.location.href = "/"
    }
  }

  const handleSubmitName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      setIsLoading(true)
      setApiError(null)

      try {
        localStorage.removeItem("userId")
        localStorage.removeItem("gameState")

        const userData = await createUser(name.trim())
        setUserId(userData.id)
        localStorage.setItem("userId", userData.id)
        localStorage.setItem("userName", name.trim())

        setShowNameInput(false)
        setDialogStep(DIALOGS.length)
        setIsTyping(true)

      } catch (error) {
        setApiError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // 줄바꿈 처리 함수 - 이전 코드 구조 참고
  const formatTextWithCursor = (text: string, showTypingCursor: boolean) => {
    if (!text) return null

    const formattedText = text.split('\n').map((line, index, array) => (
      <span key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </span>
    ))

    return (
      <span>
        {formattedText}
        {showTypingCursor && <span className="inline-block w-0.5 h-8 bg-white ml-1 animate-pulse"></span>}
        {!showTypingCursor && !isTyping && (
          <span 
            className="ml-8 transition-opacity duration-200 opacity-100"
            style={{
              animation: 'blink 2s infinite'
            }}
          >
            ▼
          </span>
        )}
      </span>
    )
  }

  // 스토리텔링 섹션
  if (showStorySection) {



    const handleStoryClick = () => {
      // 타이핑 중이면 전체 텍스트 즉시 표시
      if (storyTyping) {
        if (storyTypingTimeoutRef.current) {
          clearTimeout(storyTypingTimeoutRef.current)
        }
        setStoryText(STORY_TEXTS[storyTextIndex])
        setStoryTyping(false)
        return
      }

      // 타이핑이 완료된 상태에서의 클릭 처리
      if (storyTextIndex === 0) {
        // 첫 번째 텍스트 → 두 번째 텍스트 (별 애니메이션 포함)
        setStoryTextIndex(prev => prev + 1);
      } else if (storyTextIndex === 1) {
        // 별 애니메이션 시작
        if (!starsAnimating && !starsAnimationComplete) {
          setStarsAnimating(true);
          setVisibleStarsCount(0);
          
          // 별들을 0.2초 간격으로 겹쳐서 시작
          for (let i = 0; i < 7; i++) {
            setTimeout(() => {
              setVisibleStarsCount(prev => prev + 1);
            }, i * 200); // 0.2초(200ms) 간격
          }
          
          // 마지막 별이 시작된 후 2초 대기하고 사라지기 시작
          // 마지막 별 시작: 6 * 200ms = 1200ms
          // 별이 올라오는 시간: 800ms (transitionDuration)
          // 대기 시간: 2000ms
          setTimeout(() => {
            // 별들을 0.2초 간격으로 겹쳐서 사라지게 하기
            for (let i = 0; i < 7; i++) {
              setTimeout(() => {
                setVisibleStarsCount(prev => prev - 1);
              }, i * 200); // 0.2초(200ms) 간격으로 사라짐
            }
            
            // 마지막 별이 사라지기 시작한 후 애니메이션 완료 처리
            // 마지막 별 사라지기 시작: 6 * 200ms = 1200ms
            // 별이 내려가는 시간: 800ms
            setTimeout(() => {
              setStarsAnimating(false);
              setStarsAnimationComplete(true);
            }, 1200 + 800); // 마지막 별 사라지기 시작 + 애니메이션 시간
          }, 1200 + 800 + 2000); // 마지막 별 시작 + 애니메이션 시간 + 대기 시간
        } else if (starsAnimationComplete) {
          // 별 애니메이션 완료 후 사용자가 클릭하면 다음 단계로
          setStarsAnimationComplete(false);
          setStoryTextIndex(2);
        }
      } else if (storyTextIndex === 2) {
        // 세 번째 텍스트 완료 후 다음 단계로
        setStoryTextIndex(3);
      } else if (storyTextIndex === 3) {
        // 마지막 단계 - 게임 시작
        if (userId && !isRedirecting) {
          setIsRedirecting(true);
          startGame(userId)
            .then(gameState => {
              localStorage.setItem("gameState", JSON.stringify(gameState));
              window.location.href = "/play";
            })
            .catch(() => {
              window.location.href = "/play";
            });
        }
      }
    };

    return (
      <main className="flex min-h-screen bg-black text-white relative overflow-hidden" onClick={handleStoryClick}>
        <div className="container mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center text-2xl cursor-pointer relative z-10">
            {/* 현재 단계에 맞는 텍스트 표시 */}
            {storyTextIndex < STORY_TEXTS.length && (
              <div className="mb-8 whitespace-pre-line">
                {storyText}
                {storyTyping && <span className="inline-block w-0.5 h-8 bg-white ml-1 animate-pulse"></span>}
                {!storyTyping && storyText && (
                  <span 
                    className="ml-8 transition-opacity duration-200 opacity-100"
                    style={{
                      animation: 'blink 2s infinite'
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
            )}
            

          </div>
        </div>

        {/* 별 애니메이션 */}
        {(starsAnimating) && (
          <div className="absolute inset-0 pointer-events-none">
            {[1, 2, 3, 4, 5, 6, 7].map((starNum, index) => (
              <div
                key={starNum}
                className={`absolute transition-all duration-1000 ease-out`}
                style={{
                  left: `${35 + index * 5}%`,
                  bottom: visibleStarsCount > index ? '35%' : '-20%',
                  transform: 'translateX(-50%)',
                  opacity: visibleStarsCount > index ? 1 : 0,
                  transitionDuration: '800ms'
                }}
              >
                <Image
                  src={`/image/stars/star_${starNum}.png`}
                  alt={`Star ${starNum}`}
                  width={60}
                  height={60}
                  className="drop-shadow-lg"
                />
              </div>
            ))}
          </div>
        )}


      </main>
    );
  }

  return (
    <main 
      className="relative min-h-screen w-full overflow-hidden bg-black select-none"
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        KhtmlUserSelect: 'none'
      } as React.CSSProperties}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* prince_text.png 배경 이미지 */}
      <div className="relative w-full min-h-screen flex items-center justify-center select-none" style={{ userSelect: 'none' }}>
        <Image
          src="/image/prince_text.png"
          alt="Prince background"
          width={1920}
          height={1080}
          className="w-4/5 h-auto max-w-4xl select-none"
          style={{ 
            maxWidth: '80%', 
            height: 'auto',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
          priority
          draggable={false}
        />
        
        {/* 대화 텍스트 오버레이 */}
        <div className="absolute inset-0 flex flex-col justify-center items-center px-8 select-none" style={{ userSelect: 'none' }}>
          <div className="text-white max-w-5xl text-left ml-96 w-full select-none" style={{ userSelect: 'none' }}>
            <div 
              className="text-3xl cursor-pointer leading-loose select-none"
              onClick={!showChoices && !showNameInput ? handleClick : undefined}
              style={{ 
                lineHeight: '1.8',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
              onDragStart={(e) => e.preventDefault()}
            >
              {formatTextWithCursor(currentText, isTyping)}
            </div>
          </div>

          {/* 선택지 영역 - prince_text.png 우하단에 위치 */}
          {showChoices && (
            <div className="absolute bottom-40 right-56 text-white text-2xl select-none" style={{ userSelect: 'none' }}>
              <span className="mx-3 select-none" style={{ userSelect: 'none' }}>▶</span>
              <span 
                onClick={() => handleChoice("help")}
                className="cursor-pointer hover:opacity-80 transition select-none"
                style={{ userSelect: 'none' }}
                onDragStart={(e) => e.preventDefault()}
              >
                무슨 일 인지 묻는다.
              </span>
              <span className="mx-3 select-none" style={{ userSelect: 'none' }}></span>
              <span className="mx-3 select-none" style={{ userSelect: 'none' }}>▶</span>
              <span 
                onClick={() => handleChoice("noHelp")}
                className="cursor-pointer hover:opacity-80 transition select-none"
                style={{ userSelect: 'none' }}
                onDragStart={(e) => e.preventDefault()}
              >
                기다린다.
              </span>
            </div>
          )}
        </div>

        {/* 이름 입력 영역 - prince_text.png 하단에 위치 */}
        {showNameInput && (
          <div className="absolute bottom-40 left-2/3 transform -translate-x-1/2 w-full max-w-4xl px-8">
            <form onSubmit={handleSubmitName} className="flex flex-col items-center">
              <div className="flex items-center w-full">
                <span className="text-white text-3xl mr-3">▶</span>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  className="w-full px-6 py-4 border-none outline-none text-black text-xl"
                  style={{ borderRadius: '0' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              {apiError && <div className="text-red-500 mt-2 text-sm bg-white px-2 py-1 rounded">{apiError}</div>}
            </form>
          </div>
        )}
      </div>
    </main>
  )
}

