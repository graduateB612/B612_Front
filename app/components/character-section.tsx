"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

// 캐릭터 정보 인터페이스 정의
interface CharacterInfo {
  id: string
  name: string
  image: string
  nameTag: string
  description: string
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
    image: "/image/select_fox.png",
    nameTag: "/image/fox-nametag.png",
    description:
      "지혜로운 여우는 별빛 사이를 자유롭게 누비며 길을 잃은 여행자들을 안내합니다. 오랜 세월 동안 우주의 비밀을 간직해 온 그는 어린 왕자의 오랜 친구이자 조언자입니다.",
    starTypes: ["/image/fox-star1.png", "/image/fox-star2.png", "/image/fox-star3.png"],
    size: {
      width: 400,
      height: 500,
    },
  },
  {
    id: "prince",
    name: "어린 왕자",
    image: "/image/select_prince.png",
    nameTag: "/image/prince-nametag.png",
    description:
      "먼 행성에서 온 어린 왕자는 끝없는 호기심과 순수한 마음을 가졌습니다.\n그는 자신의 작은 행성 B612를 떠나 여러 세계를 여행하며 진정한 우정과 사랑의 의미를 찾고 있습니다.",
    starTypes: ["/image/prince-star1.png", "/image/prince-star2.png", "/image/prince-star3.png"],
    size: {
      width: 420,
      height: 520,
    },
  },
  {
    id: "rose",
    name: "장미",
    image: "/image/select_rose.png",
    nameTag: "/image/rose-nametag.png",
    description:
      "어린 왕자의 행성에 피어난 특별한 장미는 아름다움과 자존심을 지닌 존재입니다.\n연약해 보이지만 강한 의지를 가진 그녀는 우주의 비밀을 간직하고 있으며,\n어린 왕자의 마음속에 특별한 자리를 차지하고 있습니다.",
    starTypes: ["/image/rose-star1.png", "/image/rose-star2.png", "/image/rose-star3.png"],
    size: {
      width: 200,
      height: 350,
    },
  },
  {
    id: "bob",
    name: "바오밥",
    image: "/image/select_bob.png",
    nameTag: "/image/bob-nametag.png",
    description:
      "거대한 바오밥 나무는 작은 행성에서 강력한 존재감을 드러냅니다.\n세계를 품을 만큼 거대하게 자라는 이 나무는 지식과 지혜의 상징이지만,\n조심하지 않으면 행성 전체를 위험에 빠뜨릴 수도 있습니다.",
    starTypes: ["/image/bob-star1.png", "/image/bob-star2.png", "/image/bob-star3.png", "/image/bob-star4.png"],
    size: {
      width: 500,
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

  // 정보 애니메이션 상태
  const [showName, setShowName] = useState(false)
  const [showStarTypes, setShowStarTypes] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [startAnimation, setStartAnimation] = useState(false)

  // isActive 상태에 따라 상호작용 활성화/비활성화
  useEffect(() => {
    setInteractionEnabled(isActive)
  }, [isActive])

  // 캐릭터 선택 처리 함수와 순차적 애니메이션
  const handleCharacterSelect = (characterId: string) => {
    if (!interactionEnabled || animationInProgress || selectedCharacter === characterId) return

    setAnimationInProgress(true)

    // Keep hover state
    setHoveredCharacter(characterId)

    // Set character selection
    setSelectedCharacter(characterId)

    // 애니메이션 시작 (약간의 지연 후)
    setTimeout(() => {
      setStartAnimation(true)

      // 애니메이션 완료 후 정보 표시
      setTimeout(() => {
        setShowName(true)
        setTimeout(() => {
          setShowStarTypes(true)
          setTimeout(() => {
            setShowDescription(true)
            setAnimationInProgress(false)
          }, 300)
        }, 300)
      }, 800) // 애니메이션 시간
    }, 50)
  }

  // 선택된 캐릭터 정보 가져오기
  const getSelectedCharacterInfo = () => {
    return characters.find((char) => char.id === selectedCharacter)
  }

  // 배경 클릭으로 선택 취소 처리
  const handleBackgroundClick = () => {
    if (!interactionEnabled || !selectedCharacter || animationInProgress) return

    setAnimationInProgress(true)

    // Hide elements in reverse order
    setShowDescription(false)

    setTimeout(() => {
      setShowStarTypes(false)

      setTimeout(() => {
        setShowName(false)

        setTimeout(() => {
          setStartAnimation(false)

          // 원래 위치로 돌아가는 애니메이션을 위한 지연
          setTimeout(() => {
            setSelectedCharacter(null)
            setAnimationInProgress(false)
            setHoveredCharacter(null)
          }, 300)
        }, 200)
      }, 200)
    }, 200)
  }

  // 캐릭터별 이동 거리 계산 함수
  const getTransformValue = (characterId: string) => {
    if (!selectedCharacter || !startAnimation) {
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
                height: "525px",
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
              <div style={{ width: character.size.width, height: character.size.height, position: "relative" }}>
                <Image
                  src={character.image || "/placeholder.svg"}
                  alt={character.name}
                  fill
                  className="object-contain cursor-pointer"
                  style={{
                    filter: hoveredCharacter === character.id ? "brightness(1)" : "brightness(0)", // 실루엣 효과
                    objectPosition: "bottom",
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

      {/* 캐릭터 정보 (선택 시에만 표시) */}
      {selectedCharacter && (
        <div
          className="absolute top-1/2 w-1/2 pl-16 pr-16"
          style={{
            opacity: showName || showStarTypes || showDescription ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
            pointerEvents: animationInProgress ? "none" : "auto",
            left: "35%", // 화면의 35% 위치에서 시작
            transform: "translateY(-50%)", // 수직 중앙 정렬 유지
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 캐릭터 이름 */}
          <div
            className="transition-opacity duration-500"
            style={{
              opacity: showName ? 1 : 0,
            }}
          >
            <h2 className="text-white text-5xl mb-8">{getSelectedCharacterInfo()?.name}</h2>
          </div>

          {/* 별 종류 */}
          <div
            className="mb-12 transition-opacity duration-500"
            style={{
              opacity: showStarTypes ? 1 : 0,
            }}
          >
            <div className="flex space-x-6">
              {getSelectedCharacterInfo()?.starTypes.map((starImagePath, index) => (
                <div key={index}>
                  <Image
                    src={starImagePath || "/placeholder.svg"}
                    alt={`${getSelectedCharacterInfo()?.name} 별 ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 캐릭터 설명 - 가로 크기 줄임 */}
          <div
            className="transition-opacity duration-500 max-w-2xl"
            style={{
              opacity: showDescription ? 1 : 0,
            }}
          >
            <div className="bg-gray-900 bg-opacity-70 p-6 rounded-md">
              <p className="text-white text-lg leading-relaxed whitespace-pre-line">
                {getSelectedCharacterInfo()?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 배경 클릭 처리를 위한 투명 오버레이 */}
      {selectedCharacter && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: animationInProgress ? "none" : "auto" }}
          onClick={handleBackgroundClick}
        />
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
      `}</style>
    </section>
  )
}
