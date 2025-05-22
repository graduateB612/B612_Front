"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image"

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import ShootingStar from "./components/shooting-star"
import TrainSection from "./components/train-section"
import PlanetSection from "./components/planet-section"

// 캐릭터 정보 인터페이스 정의
interface CharacterInfo {
  id: string
  name: string
  image: string
  nameTag: string
  description: string
  starTypes: string[] // 별 이미지 경로 배열
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
  },
  {
    id: "prince",
    name: "어린 왕자",
    image: "/image/select_prince.png",
    nameTag: "/image/prince-nametag.png",
    description:
      "먼 행성에서 온 어린 왕자는 끝없는 호기심과 순수한 마음을 가졌습니다.\n그는 자신의 작은 행성 B612를 떠나 여러 세계를 여행하며 진정한 우정과 사랑의 의미를 찾고 있습니다.",
    starTypes: ["/image/prince-star1.png", "/image/prince-star2.png", "/image/prince-star3.png"],
  },
  {
    id: "rose",
    name: "장미",
    image: "/image/select_rose.png",
    nameTag: "/image/rose-nametag.png",
    description:
      "어린 왕자의 행성에 피어난 특별한 장미는 아름다움과 자존심을 지닌 존재입니다.\n연약해 보이지만 강한 의지를 가진 그녀는 우주의 비밀을 간직하고 있으며,\n어린 왕자의 마음속에 특별한 자리를 차지하고 있습니다.",
    starTypes: ["/image/rose-star1.png", "/image/rose-star2.png", "/image/rose-star3.png"],
  },
  {
    id: "bob",
    name: "바오밥",
    image: "/image/select_bob.png",
    nameTag: "/image/bob-nametag.png", // 바오밥 이름표 이미지
    description:
      "거대한 바오밥 나무는 작은 행성에서 강력한 존재감을 드러냅니다.\n세계를 품을 만큼 거대하게 자라는 이 나무는 지식과 지혜의 상징이지만,\n조심하지 않으면 행성 전체를 위험에 빠뜨릴 수도 있습니다.",
    starTypes: ["/image/bob-star1.png", "/image/bob-star2.png", "/image/bob-star3.png", "/image/bob-star4.png"],
  },
]

export default function Home() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [typedText, setTypedText] = useState("")
  const fullText = 'Fixer team - "rose"'
  const [projectText, setProjectText] = useState("")
  const [b612Text, setB612Text] = useState("")
  const projectFull = "Project"
  const b612Full = "B 6 1 2"
  const [roseBlinkOpacity, setRoseBlinkOpacity] = useState(0)
  const [blinkCount, setBlinkCount] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const totalSections = 5 // 총 섹션 수

  // 캐릭터 선택 상태 관리
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [animationInProgress, setAnimationInProgress] = useState(false)
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null)

  // 정보 애니메이션 상태
  const [showName, setShowName] = useState(false)
  const [showStarTypes, setShowStarTypes] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [startAnimation, setStartAnimation] = useState(false)

  // 애니메이션 키프레임 추가
  useEffect(() => {
    // 애니메이션 키프레임 스타일 생성
    const styleSheet = document.createElement("style")
    styleSheet.textContent = `
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
    `
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  useEffect(() => {
    if (b612Text === b612Full) {
      setRoseBlinkOpacity(1)
    }
  }, [b612Text])

  // 섹션 참조 설정
  const addSectionRef = (el: HTMLElement | null, index: number) => {
    if (el) sectionsRef.current[index] = el
  }

  useEffect(() => {
    setTypedText("")
    setProjectText("")
    setB612Text("")
    let current = 0
    // Project 타이핑
    const projectInterval = setInterval(() => {
      setProjectText(projectFull.slice(0, current + 1))
      current++
      if (current === projectFull.length) {
        clearInterval(projectInterval)
        // B612 타이핑
        let bCurrent = 0
        const bInterval = setInterval(() => {
          setB612Text(b612Full.slice(0, bCurrent + 1))
          bCurrent++
          if (bCurrent === b612Full.length) {
            clearInterval(bInterval)
            setRoseBlinkOpacity(1) // B612 타이핑이 끝날 때 장미 완전히 켜짐
            // Fixer team - "rose" 타이핑
            let tCurrent = 0
            const tInterval = setInterval(() => {
              setTypedText(fullText.slice(0, tCurrent + 1))
              tCurrent++
              if (tCurrent === fullText.length) clearInterval(tInterval)
            }, 60)
          }
        }, 120)
      }
    }, 80)
    return () => {
      clearInterval(projectInterval)
    }
  }, [])

  useEffect(() => {
    // 장미 깜빡임 + 점점 밝아지는 효과 (불 켜지듯)
    const blinkPattern = [
      { opacity: 0.1, delay: 400 },
      { opacity: 1, delay: 250 },
      { opacity: 0.1, delay: 180 },
      { opacity: 1, delay: 120 },
      { opacity: 0.1, delay: 100 },
      { opacity: 1, delay: 80 },
      { opacity: 0.3, delay: 80 },
      { opacity: 1, delay: 60 },
      { opacity: 0.6, delay: 60 },
      { opacity: 1, delay: 40 },
      { opacity: 1, delay: 40 },
    ]
    let step = 0
    let timeoutId: ReturnType<typeof setTimeout>
    const blink = () => {
      setRoseBlinkOpacity(blinkPattern[step].opacity)
      setBlinkCount(step)
      step++
      if (step >= blinkPattern.length) {
        setRoseBlinkOpacity(1)
        return
      }
      timeoutId = setTimeout(blink, blinkPattern[step].delay)
    }
    blink()
    return () => clearTimeout(timeoutId)
  }, [])

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    let isScrolling = false

    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return

      isScrolling = true

      if (e.deltaY > 0 && currentSection < totalSections - 1) {
        // 아래로 스크롤
        setCurrentSection((prev) => prev + 1)
      } else if (e.deltaY < 0 && currentSection > 0) {
        // 위로 스크롤
        setCurrentSection((prev) => prev - 1)
      }

      // 스크롤 애니메이션이 끝난 후 다시 활성화
      setTimeout(() => {
        isScrolling = false
      }, 800) // 애니메이션 시간에 맞춰 조정
    }

    window.addEventListener("wheel", handleWheel)

    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, [currentSection, totalSections])

  // 현재 섹션으로 스크롤
  useEffect(() => {
    const currentSectionElement = sectionsRef.current[currentSection]
    if (currentSectionElement) {
      currentSectionElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [currentSection])

  const handleClick = () => {
    if (isNavigating) return // 중복 클릭 방지

    setIsNavigating(true)
    // 약간의 지연 후 라우팅 (애니메이션 정리 시간 확보)
    setTimeout(() => {
      router.push("/chat")
    }, 100)
  }

  // 캐릭터 선택 처리 함수와 순차적 애니메이션 - 수정된 부분
  const handleCharacterSelect = (characterId: string) => {
    if (animationInProgress || selectedCharacter === characterId) return

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

  // 배경 클릭으로 선택 취소 처리 - 수정된 부분
  const handleBackgroundClick = () => {
    if (selectedCharacter && !animationInProgress) {
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
    <div
      className="snap-y snap-mandatory h-screen overflow-y-auto relative"
      style={{
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
        overflowY: "auto",
        height: "100vh",
        backgroundImage: 'url("/image/space-bg.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat-y", // 배경 이미지 반복 설정
      }}
    >
      {/* 별똥별 효과 컴포넌트 추가 (배경 바로 위에 위치) */}
      <ShootingStar />

      {/* 첫 번째 섹션: 기존 내용 */}
      <section
        ref={(el) => addSectionRef(el, 0)}
        className="flex min-h-screen flex-col items-center justify-center snap-start z-10 relative"
      >
        <div
          className={`relative cursor-pointer transition-transform hover:scale-110 ${isNavigating ? "opacity-70" : ""}`}
          onClick={handleClick}
          style={{ width: 400, height: 400 }}
        >
          <span className="absolute z-10 text-white text-6xl select-none" style={{ left: "-140px", top: "80px" }}>
            {projectText}
          </span>
          <span className="absolute z-10 text-white text-6xl select-none" style={{ right: "-180px", bottom: "80px" }}>
            {b612Text}
          </span>
          <Image
            src="/image/rose.png"
            alt="Rose"
            width={400}
            height={400}
            priority
            className="z-0"
            style={{
              opacity: roseBlinkOpacity,
              transition: roseBlinkOpacity === 1 && blinkCount >= 10 ? "opacity 0.15s" : "none",
            }}
          />
        </div>
        <p className="mt-4 text-2xl text-white min-h-[2.5rem] relative">
          <span className="invisible">{fullText}</span>
          <span className="absolute left-0 top-0">{typedText}</span>
        </p>
      </section>

      {/* 두 번째 섹션: 캐릭터 선택 */}
      <section
        ref={(el) => addSectionRef(el, 1)}
        className="flex min-h-screen flex-col items-center justify-center snap-start relative z-10"
      >
        {/* Fixer 텍스트 (2번째 섹션 좌측 상단) */}
        <div className="absolute top-8 left-8 z-50">
          <span className="text-white text-3xl font-bold">Fixer</span>
        </div>

        {/* 캐릭터 선택 그리드 */}
        <div className="grid grid-cols-4 gap-24 max-w-7xl mx-auto">
          {/* 여우 캐릭터 */}
          <div
            className="flex flex-col items-center"
            style={{
              opacity: selectedCharacter && selectedCharacter !== "fox" ? 0 : 1,
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
                position: "relative", // 항상 relative 유지
                transform: getTransformValue("fox"),
                transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                zIndex: selectedCharacter === "fox" ? 20 : 10,
              }}
            >
              {hoveredCharacter === "fox" && !selectedCharacter && (
                <div className="absolute top-4 right-0 transform translate-x-1/2 z-10 transition-opacity duration-700 ease-in-out opacity-0 animate-fadeIn">
                  <Image
                    src="/image/fox-nametag.png"
                    alt="여우 이름표"
                    width={150}
                    height={50}
                    className="object-contain"
                  />
                </div>
              )}
              <div style={{ width: 300, height: 450, position: "relative" }}>
                <Image
                  src="/image/select_fox.png"
                  alt="여우"
                  fill
                  className="object-contain cursor-pointer"
                  style={{
                    filter: hoveredCharacter === "fox" ? "brightness(1)" : "brightness(0)", // 실루엣 효과
                    objectPosition: "bottom",
                    transition: "filter 0.7s ease-in-out, transform 0.3s ease-in-out",
                  }}
                  onMouseEnter={() => {
                    if (!selectedCharacter) setHoveredCharacter("fox")
                  }}
                  onMouseLeave={() => {
                    if (!selectedCharacter) setHoveredCharacter(null)
                  }}
                  onClick={() => handleCharacterSelect("fox")}
                />
              </div>
            </div>
          </div>

          {/* 어린왕자 캐릭터 */}
          <div
            className="flex flex-col items-center"
            style={{
              opacity: selectedCharacter && selectedCharacter !== "prince" ? 0 : 1,
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
                position: "relative", // 항상 relative 유지
                transform: getTransformValue("prince"),
                transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                zIndex: selectedCharacter === "prince" ? 20 : 10,
              }}
            >
              {hoveredCharacter === "prince" && !selectedCharacter && (
                <div className="absolute top-4 right-0 transform translate-x-1/2 z-10 transition-opacity duration-700 ease-in-out opacity-0 animate-fadeIn">
                  <Image
                    src="/image/prince-nametag.png"
                    alt="어린 왕자 이름표"
                    width={150}
                    height={50}
                    className="object-contain"
                  />
                </div>
              )}
              <div style={{ width: 300, height: 450, position: "relative" }}>
                <Image
                  src="/image/select_prince.png"
                  alt="어린왕자"
                  fill
                  className="object-contain cursor-pointer"
                  style={{
                    filter: hoveredCharacter === "prince" ? "brightness(1)" : "brightness(0)", // 실루엣 효과
                    objectPosition: "bottom",
                    transition: "filter 0.7s ease-in-out, transform 0.3s ease-in-out",
                  }}
                  onMouseEnter={() => {
                    if (!selectedCharacter) setHoveredCharacter("prince")
                  }}
                  onMouseLeave={() => {
                    if (!selectedCharacter) setHoveredCharacter(null)
                  }}
                  onClick={() => handleCharacterSelect("prince")}
                />
              </div>
            </div>
          </div>

          {/* 장미 캐릭터 */}
          <div
            className="flex flex-col items-center"
            style={{
              opacity: selectedCharacter && selectedCharacter !== "rose" ? 0 : 1,
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
                position: "relative", // 항상 relative 유지
                transform: getTransformValue("rose"),
                transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                zIndex: selectedCharacter === "rose" ? 20 : 10,
              }}
            >
              {hoveredCharacter === "rose" && !selectedCharacter && (
                <div className="absolute top-4 right-0 transform translate-x-1/2 z-10 transition-opacity duration-700 ease-in-out opacity-0 animate-fadeIn">
                  <Image
                    src="/image/rose-nametag.png"
                    alt="장미 이름표"
                    width={150}
                    height={50}
                    className="object-contain"
                  />
                </div>
              )}
              <div style={{ width: 240, height: 360, position: "relative" }}>
                <Image
                  src="/image/select_rose.png"
                  alt="장미"
                  fill
                  className="object-contain cursor-pointer"
                  style={{
                    filter: hoveredCharacter === "rose" ? "brightness(1)" : "brightness(0)", // 실루엣 효과
                    objectPosition: "bottom",
                    transition: "filter 0.7s ease-in-out, transform 0.3s ease-in-out",
                  }}
                  onMouseEnter={() => {
                    if (!selectedCharacter) setHoveredCharacter("rose")
                  }}
                  onMouseLeave={() => {
                    if (!selectedCharacter) setHoveredCharacter(null)
                  }}
                  onClick={() => handleCharacterSelect("rose")}
                />
              </div>
            </div>
          </div>

          {/* 바오밥 캐릭터 */}
          <div
            className="flex flex-col items-center"
            style={{
              opacity: selectedCharacter && selectedCharacter !== "bob" ? 0 : 1,
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
                transform: getTransformValue("bob"),
                transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                zIndex: selectedCharacter === "bob" ? 20 : 10,
              }}
            >
              {hoveredCharacter === "bob" && !selectedCharacter && (
                <div className="absolute top-4 right-0 transform translate-x-1/2 z-10 transition-opacity duration-700 ease-in-out opacity-0 animate-fadeIn">
                  <Image
                    src="/image/bob-nametag.png"
                    alt="바오밥 이름표"
                    width={150}
                    height={50}
                    className="object-contain"
                  />
                </div>
              )}
              <div style={{ width: 300, height: 450, position: "relative" }}>
                <Image
                  src="/image/select_bob.png"
                  alt="바오밥"
                  fill
                  className="object-contain cursor-pointer"
                  style={{
                    filter: hoveredCharacter === "bob" ? "brightness(1)" : "brightness(0)", // 실루엣 효과
                    objectPosition: "bottom",
                    transition: "filter 0.7s ease-in-out, transform 0.3s ease-in-out",
                  }}
                  onMouseEnter={() => {
                    if (!selectedCharacter) setHoveredCharacter("bob")
                  }}
                  onMouseLeave={() => {
                    if (!selectedCharacter) setHoveredCharacter(null)
                  }}
                  onClick={() => handleCharacterSelect("bob")}
                />
              </div>
            </div>
          </div>
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
      </section>
      {/* 세 번째 섹션 - 행성 섹션 */}
      <section
        ref={(el) => addSectionRef(el, 3)}
        className="flex min-h-screen flex-col items-center justify-center snap-start z-10 relative"
      >
        <PlanetSection isActive={currentSection === 3} />
      </section>

      {/* 네 번째 섹션 */}
      <section
        ref={(el) => addSectionRef(el, 2)}
        className="flex min-h-screen flex-col items-center justify-center snap-start z-10 relative"
      >
        {/* 섹션 4 내용은 요구사항에 없어 비워둠 */}
      </section>

      

      {/* 다섯 번째 섹션 - 열차 페이지 */}
      <section
        ref={(el) => addSectionRef(el, 4)}
        className="flex min-h-screen flex-col items-center justify-center snap-start z-10 relative"
      >
        <TrainSection isActive={currentSection === 4} />
      </section>
    </div>
  )
}
