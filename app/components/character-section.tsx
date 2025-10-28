"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

// 캐릭터 정보 인터페이스 정의
interface CharacterInfo {
  id: string
  name: string
  engName: string // 영어 이름 추가
  image: string
  nameTag: string
  description: string[]
  starTypes: string[] // 별 이미지 경로 배열
  size: {
    width: number
    height: number
  }
  nameTagPosition?: {
    top: string
    right: string
  }
}

// 캐릭터 정보 데이터
const characters: CharacterInfo[] = [
  {
    id: "fox",
    name: "여우",
    engName: "FOX",
    image: "/image/select_fox.png",
    nameTag: "/image/fox-nametag.png",
    description: [
      "지구에서 지내는 해결단원. 천진난만하게만 보이는 행동과는 달리, 진실을 꿰뚫어 보는 능력을 지녔다.",
      "어린 왕자에게 마음으로 보는 것의 중요성을 알려줬으며, 그건 결국 '노을'의 이상 현상을 눈치채게 만들었다.",
      "",
      "자신의 개성을 잘 아는 소녀는 이번 여행에서,",
      " 어떤 진실을 보게 될지 열차에 올라탄 후 곰곰이 생각하고 있다."
    ],
    starTypes: ["/image/fox-star1.png", "/image/fox-star2.png", "/image/fox-star3.png"],
    size: {
      width: 400,
      height: 500,
    },
  },
  {
    id: "prince",
    name: "어린 왕자",
    engName: "PRINCE",
    image: "/image/select_prince.png",
    nameTag: "/image/prince-nametag.png",
    description: [
      "해결단 장미의 단장이자 소행성 B612의 주인.",
      "우주의 하루 끝을 알리는 정보 요약 시스템 '노을'을 바라보던 그는,",
      " 이내 자신의 소행성 B612 주변 행성들이 이상 현상을 겪고 있다는 것을 눈치챈다.",
      "",
      "각 행성의 주인들이 부정하게 변해 간다는 것.",
      "자신이 해야 할 일을 깨달은 어린 왕자는 단원을 소집 해 여행을 시작하게 된다."
    ],
    starTypes: ["/image/prince-star1.png", "/image/prince-star2.png", "/image/prince-star3.png"],
    size: {
      width: 420,
      height: 520,
    },
  },
  {
    id: "rose",
    name: "장미",
    engName: "ROSE",
    image: "/image/select_rose.png",
    nameTag: "/image/rose-nametag.png",
    description: [
      "과거, 어린 왕자에게 유일하게 상처를 준 인물.",
      "때문에 그 이후로 입을 가린 옷을 입으며, 말수도 굉장히 적은 편이다.",
      "사람들에게 가장 영향력이 강한 개성을 가진 만큼 걸맞는 위력을 가지고 있다.",
      "자신의 이름을 딴 '장미' 해결단을 못마땅하게 생각한다.",
      "",
      "타인을 잘 대하지 못하는 장미이지만, 일이 더 귀찮아 지기 전에 나서게 됐다."
    ],
    starTypes: ["/image/rose-star1.png", "/image/rose-star2.png", "/image/rose-star3.png"],
    size: {
      width: 200,
      height: 350,
    },
  },
  {
    id: "bob",
    name: "바오밥",
    engName: "BAOBAB",
    image: "/image/select_bob.png",
    nameTag: "/image/bob-nametag.png",
    description: [
      "해결단 '장미'의 부단장. 나무는 뿌리가 깊어 질 수록 견고해지지만",
      "어린 왕자의 B612를 망치게 될까 미안해 항상 씨앗을 화산에 버려둔다.",
      "어린 왕자에게 가장 먼저 '노을'의 이상 현상을 전해 들었고, 그의 결심에 망설임 없이 열차를 손보러 정거장으로 향했다.",
      "",
      "언제나 그렇듯 이번 운행도 멋진 여행일 것이란 걸 확신하기 때문에."
    ],
    starTypes: ["/image/bob-star1.png", "/image/bob-star2.png", "/image/bob-star3.png", "/image/bob-star4.png"],
    size: {
      width: 420,
      height: 600,
    },
  },
]

interface CharacterSectionProps {
  isActive?: boolean
}

export default function CharacterSection({ isActive = true }: CharacterSectionProps) {
  // 캐릭터 선택 상태 관리
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [animationInProgress, setAnimationInProgress] = useState(false)
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null)
  const [interactionEnabled, setInteractionEnabled] = useState(false)

  // 텍스트 애니메이션 상태
  const [visibleLines, setVisibleLines] = useState<number>(0)

  // 캐릭터별 배경 이미지 가져오기 함수
  const getCharacterBackground = (characterId: string) => {
    switch (characterId) {
      case "fox":
        return "/image/fox_background.png"
      case "prince":
        return "/image/prince_background.png"
      case "rose":
        return "/image/rose_background.png"
      case "bob":
        return "/image/bob_background.png"
      default:
        return null
    }
  }

  // 배경 이미지 상태
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [backgroundOpacity, setBackgroundOpacity] = useState(0)

  // isActive 상태에 따라 상호작용 활성화/비활성화
  useEffect(() => {
    setInteractionEnabled(isActive)
  }, [isActive])

  // 캐릭터 선택 시 스크롤 막기
  useEffect(() => {
    if (selectedCharacter) {
      // wheel 이벤트를 먼저 잡아서 막기 (page.tsx의 핸들러보다 먼저 실행)
      const preventWheelScroll = (e: WheelEvent) => {
        e.preventDefault()
        e.stopPropagation()
      }
      
      // 캡처 단계에서 이벤트를 잡아서 다른 핸들러보다 먼저 실행
      window.addEventListener('wheel', preventWheelScroll, { capture: true, passive: false })
      
      // 직접 인라인 스타일로 스크롤 막기 적용
      const htmlEl = document.documentElement
      const bodyEl = document.body
      
      htmlEl.style.overflow = 'hidden'
      htmlEl.style.position = 'fixed'
      htmlEl.style.width = '100%'
      htmlEl.style.height = '100%'
      htmlEl.style.top = '0'
      htmlEl.style.left = '0'
      
      bodyEl.style.overflow = 'hidden'
      bodyEl.style.position = 'fixed'
      bodyEl.style.width = '100%'
      bodyEl.style.height = '100%'
      bodyEl.style.top = '0'
      bodyEl.style.left = '0'
      bodyEl.style.margin = '0'
      bodyEl.style.padding = '0'
      
      return () => {
        window.removeEventListener('wheel', preventWheelScroll, { capture: true })
      }
    } else {
      // 스타일 초기화
      const htmlEl = document.documentElement
      const bodyEl = document.body
      
      htmlEl.style.overflow = ''
      htmlEl.style.position = ''
      htmlEl.style.width = ''
      htmlEl.style.height = ''
      htmlEl.style.top = ''
      htmlEl.style.left = ''
      
      bodyEl.style.overflow = ''
      bodyEl.style.position = ''
      bodyEl.style.width = ''
      bodyEl.style.height = ''
      bodyEl.style.top = ''
      bodyEl.style.left = ''
      bodyEl.style.margin = ''
      bodyEl.style.padding = ''
    }

    // 컴포넌트 언마운트 시 스타일 초기화
    return () => {
      const htmlEl = document.documentElement
      const bodyEl = document.body
      
      htmlEl.style.overflow = ''
      htmlEl.style.position = ''
      htmlEl.style.width = ''
      htmlEl.style.height = ''
      htmlEl.style.top = ''
      htmlEl.style.left = ''
      
      bodyEl.style.overflow = ''
      bodyEl.style.position = ''
      bodyEl.style.width = ''
      bodyEl.style.height = ''
      bodyEl.style.top = ''
      bodyEl.style.left = ''
      bodyEl.style.margin = ''
      bodyEl.style.padding = ''
    }
  }, [selectedCharacter])

  // 캐릭터 선택 처리 함수와 순차적 애니메이션
  const handleCharacterSelect = (characterId: string) => {
    if (!interactionEnabled || animationInProgress || selectedCharacter === characterId) return
    setAnimationInProgress(true)
    setHoveredCharacter(characterId)
    setSelectedCharacter(characterId)
    setVisibleLines(0) // 텍스트 라인 초기화
    
    // 배경 이미지 변경
    const newBackground = getCharacterBackground(characterId)
    if (newBackground) {
      setBackgroundImage(newBackground)
      setTimeout(() => {
        setBackgroundOpacity(1)
      }, 100)
    }
    
    // 텍스트 애니메이션 시작
    const selectedChar = characters.find(char => char.id === characterId)
    if (selectedChar) {
      selectedChar.description.forEach((_, index) => {
        setTimeout(() => {
          setVisibleLines(index + 1)
        }, (index + 1) * 400) // 각 라인마다 400ms 간격
      })
    }
    setTimeout(() => {
      setAnimationInProgress(false)
    }, 300)
  }

  // 선택된 캐릭터 정보 가져오기
  const getSelectedCharacterInfo = () => {
    return characters.find((char) => char.id === selectedCharacter)
  }

  // 배경 클릭으로 선택 취소 처리
  const handleBackgroundClick = () => {
    if (!interactionEnabled || !selectedCharacter || animationInProgress) return
    setAnimationInProgress(true)
    setVisibleLines(0) // 텍스트 라인 초기화
    
    // 배경 이미지 페이드 아웃
    setBackgroundOpacity(0)
    setTimeout(() => {
      setBackgroundImage(null)
      setSelectedCharacter(null)
      setAnimationInProgress(false)
      setHoveredCharacter(null)
    }, 500) // 페이드 아웃 시간에 맞춤
  }

  // 캐릭터별 이동 거리 계산 함수
  const getTransformValue = (characterId: string) => {
    if (!selectedCharacter) {
      return hoveredCharacter === characterId && !selectedCharacter ? "scale(1.05)" : "scale(1)"
    }

    if (selectedCharacter === characterId) {
      // 각 캐릭터별 이동 거리 계산
      switch (characterId) {
        case "fox": // 첫 번째 열
          return "translateX(0vw) scale(1.2)"
        case "prince": // 두 번째 열
          return "translateX(-20vw) scale(1.2)"
        case "rose": // 세 번째 열
          return "translateX(-40vw) scale(1.2)"
        case "bob": // 네 번째 열
          return "translateX(-60vw) scale(1.2)"
        default:
          return "translateX(0vw) scale(1.2)"
      }
    }

    return "scale(1)"
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center relative z-10">
      {/* 캐릭터별 배경 이미지 */}
      {backgroundImage && (
        <div
          className="fixed inset-0 w-screen h-screen transition-opacity duration-500 ease-in-out"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: backgroundOpacity,
            zIndex: -1,
            filter: "blur(3px)",
          }}
        />
      )}

      {/* Fixer 텍스트 (좌측 상단) */}
      <div className="absolute top-8  z-50">
        <span className="text-white text-3xl font-bold">Fixer</span>
      </div>

      {/* 캐릭터 선택 그리드 - 원래 간격과 너비로 롤백 */}
      <div className="grid grid-cols-4 gap-24 max-w-7xl mx-auto">
        {characters.map((character) => (
          <div
            key={character.id}
            className="flex flex-col items-center"
            style={{
              opacity: selectedCharacter && selectedCharacter !== character.id ? 0 : 1,
              transition: "opacity 0.5s ease-in-out",
            }}
          >
            <div
              style={{
                height: "600px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                marginBottom: "20px",
                position: "relative",
                transform: getTransformValue(character.id),
                transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                zIndex: selectedCharacter === character.id ? 20 : 10,
              }}
            >
              {hoveredCharacter === character.id && !selectedCharacter && (
                <div
                  className="absolute z-10 transition-opacity duration-700 ease-in-out opacity-0 animate-fadeIn"
                  style={{
                    top: character.nameTagPosition?.top || "10%",
                    right: character.nameTagPosition?.right || "-20px",
                  }}
                >
                  <Image
                    src={character.nameTag || "/placeholder.svg"}
                    alt={`${character.name} 이름표`}
                    width={150}
                    height={50}
                    className="object-contain"
                  />
                </div>
              )}
              <div style={{ width: character.size.width, height: character.size.height, position: "relative", transform: (character.id === "bob" || character.id === "rose") ? "translateX(20px)" : "none" }}>
                <Image
                  src={character.image || "/placeholder.svg"}
                  alt={character.name}
                  fill
                  className="object-contain cursor-pointer"
                  style={{
                    filter: hoveredCharacter === character.id ? "brightness(1)" : "brightness(0)", // 실루엣 효과
                    transition: "filter 0.7s ease-in-out, transform 0.3s ease-in-out",
                  }}
                  onMouseEnter={() => {
                    if (interactionEnabled && !selectedCharacter) setHoveredCharacter(character.id)
                  }}
                  onMouseLeave={() => {
                    if (interactionEnabled && !selectedCharacter) setHoveredCharacter(null)
                  }}
                  onClick={() => handleCharacterSelect(character.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 배경 클릭 처리를 위한 투명 오버레이 */}
      {selectedCharacter && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: animationInProgress ? "none" : "auto" }}
          onClick={handleBackgroundClick}
        />
      )}

      {/* 캐릭터 설명 (선택 시에만 표시) */}
      {selectedCharacter && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2"
          style={{
            pointerEvents: animationInProgress ? "none" : "auto",
            zIndex: 15,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 캐릭터 이름 */}
          <h2 className={`${selectedCharacter === 'bob' ? 'text-black' : 'text-white'} text-5xl mb-8 text-center`}>{getSelectedCharacterInfo()?.name}</h2>

          {/* 캐릭터 설명 - 한 줄씩 애니메이션 */}
          <div className="max-w-2xl mx-auto bg-black/50 p-5 rounded-lg">
            {getSelectedCharacterInfo()?.description.map((line, index) => (
              <p
                key={index}
                className={`'text-white text-lg leading-relaxed transition-all duration-500 text-center ${
                  index < visibleLines ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  marginBottom: line === "" ? "1em" : "0.5em",
                  minHeight: line === "" ? "1em" : "auto",
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 애니메이션 키프레임 스타일 */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-in-out forwards;
        }
        html.scroll-locked,
        body.scroll-locked {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
          top: 0 !important;
          left: 0 !important;
        }
        html.scroll-locked {
          scroll-behavior: auto !important;
        }
        body.scroll-locked {
          margin: 0 !important;
          padding: 0 !important;
        }
        body {
          overflow-x: hidden !important;
        }
        html {
          overflow-x: hidden !important;
        }
      `}</style>
    </section>
  )
}
