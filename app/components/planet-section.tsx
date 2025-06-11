"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

// 행성 인터페이스 정의
interface Planet {
  id: number
  name: string
  englishName: string
  image: string
  description: string
  width: number
  height: number
  centerScale: number // 중앙에 있을 때의 스케일
  sideScale: number // 양쪽에 있을 때의 스케일
}

// 컴포넌트 프롭스 인터페이스
interface PlanetSectionProps {
  isActive?: boolean
}

export default function PlanetSection({ isActive = true }: PlanetSectionProps) {
  // 현재 선택된 행성 인덱스
  const [currentPlanet, setCurrentPlanet] = useState(0)

  // 이전 행성 인덱스 (애니메이션 처리용)
  const [previousPlanet, setPreviousPlanet] = useState(0)

  // 애니메이션 진행 상태 (0~1)
  const [animationProgress, setAnimationProgress] = useState(1)

  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)

  // 애니메이션 상태
  const [isAnimating, setIsAnimating] = useState(false)

  // 타이핑 효과 상태
  const [displayedName, setDisplayedName] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // 설명 슬라이드 효과 상태
  const [displayedSentences, setDisplayedSentences] = useState<string[]>([])

  // 행성 이미지 모자이크 효과 상태
  const [showPlanetImage, setShowPlanetImage] = useState(false)
  const [mosaicTiles, setMosaicTiles] = useState<boolean[]>([])

  // 애니메이션 타이머 참조
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const descriptionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const mosaicTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 컨테이너 참조
  const containerRef = useRef<HTMLDivElement>(null)

  // 행성 데이터 - 이미지 크기 및 스케일 추가
  const planets: Planet[] = [
    {
      id: 1,
      name: "YAL - DIROOS",
      englishName: "Aqua Planet",
      image: "/image/planets/planet_1.png",
      description:
        "얄-디루스 행성에 오신 것을 환영합니다. 행성의 절반 이상이 물로 이루어져있으며, 수중 가옥부터 수면 위 작은 도시들이 구성되어 있습니다. 북쪽에 위치한 빙하 지대는 얄-디루스 주민들의 단단한 신념을 상징합니다. 독설가의 행성인 얄-디루스 행성은 인생의 옳은 길을 안내해주는 길잡이 행성입니다. 당신의 삶에서 가장 중요한 것이 무엇인지 잊었을 떄, 한 번 쯤 하늘을 바라보며 정답을 찾아 낼 수 있겠지요.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
    {
      id: 2,
      name: "ERURION",
      englishName: "Terracotta Planet",
      image: "/image/planets/planet_2.png",
      description:
        "에르리온 행성에 오신 것을 환영합니다. 꽃과, 화산의 조화라는 엉터리스러운 특징을 가지고 있습니다.지구의 주기로 1년 365일 내내 꽃이 피어있어 꽃잎으로 덮여 있습니다. 행성 주민들은 비교적 꽃이 피지 않은땅 위에서 생활하며, 꽃밭을 '행복의 근원' 이라는 이름 아래에 신성시 하고 있습니다.행성의 주인인 지질학자는 변화하는 것에 대한 혐오감을 가지고 있으나, 꽃이 그를 행복하게 하는 데에는 변명의 여지가 없습니다.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
    {
      id: 3,
      name: "LUTIA",
      englishName: "Lavender Planet",
      image: "/image/planets/planet_3.png",
      description:
        "루티아 행성에 오신 것을 환영합니다. 루티아 행성은 늦은 밤까지 꺼지지않는 야광 불빛이 유명합니다.도시는 술과 축제로 항상 시끌벅적하며 잡스러운 생각을 술, 그리고 맛있는 음식으로 치유합니다.당신의 과거 또는 미래가 스스로를 곤란하게 만들 때, 의외로 특별하지 않은 무언가가 해답이 될 수도 있습니다.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
    {
      id: 4,
      name: "VELL - RORNA",
      englishName: "Gaia Planet",
      image: "/image/planets/planet_4.png",
      description:
        "벨로르나 행성에 오신 것을 환영합니다. 벨로르나 행성은 '자유' 라는 단어를 우주에서 가장 잘 표현하는 행성입니다.그들 자신만의 깨달음과 목표를 위해 우주를 유랑하고, 질서를 넘나듭니다.이러한 여행에서 발견되는 것은 긍정적일 수도, 부정적일 수도 있지만 스스로가 책임지는 '경험'을 만들어냅니다. 우리는 무엇이 우릴 붙잡아놓고 있을까요?.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
    {
      id: 5,
      name: "LUMIRE",
      englishName: "Emerald Planet",
      image: "/image/planets/planet_6.png",
      description:
        "루미르 행성에 오신 것을 환영합니다. 루미르 행성은 단 한 명의 행성 주민만이 살고있습니다. 단지 가로등을 켜고 끄는 소리만이 들리지만, 어린 왕자의 마음을 빼앗았던 행성이죠. 자신에게 닥친 외로움과 부정적인 것들이 상황을 안 좋게 만들 순 있어도, 결코 자신을 좀 먹지는 못합니다. 당신은 지금처럼 계속해서 우리의 빛을 잃지 말길 바랍니다.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
    {
      id: 6,
      name: "URANOS",
      englishName: "Cloud Planet",
      image: "/image/planets/planet_5.png",
      description:
        "우라노스 행성에 오신 것을 환영합니다. 스스로를 '왕'이라고 칭하는 자가 지내고 있습니다. 그는 사랑받고, 존경받으며, 큰 행성을 관리하지만 어딘가 외로움이 숨겨져 있습니다. 겉이 아름답고 단단하다면 그 이면에는 추하고 연약한 것이 존재하기 마련이죠.",
      width: 256,
      height: 256,
      centerScale: 1.8,
      sideScale: 0.8,
    },
    {
      id: 7,
      name: "SOLARSNUAR",
      englishName: "Solar Planet",
      image: "/image/planets/planet_7.png",
      description:
        "솔라스나르 행성에 오신 것을 환영합니다. 뜨겁고, 용암이 흘러내리는 모습처럼 이 곳 주민들도 정열적이고 활발한 모습을 가지고 있습니다. 불같은 성격은 그들을 쉽게 좌절감이나 무력감에 빠지지 않도록 도와줍니다. 두 개의 위성을 가지고 있으며 이 곳에서는 주기적으로 행성의 표면 온도를 식혀주는 중요한 설비가 존재합니다. 우리들의 침착함이라는 감정처럼요.",
      width: 64,
      height: 64,
      centerScale: 3.5, // 작은 행성이므로 더 크게 스케일링
      sideScale: 1.2,
    },
    {
      id: 8,
      name: "KARMIRE",
      englishName: "Desert Planet",
      image: "/image/planets/planet_8.png",
      description:
        "카르미르 행성에 오신 것을 환영합니다. 카르미르는 우주에서 가장 번성한 행성입니다. 여러 개의 우주 정거장과, 우주적 자원을 이용한 산업 단지가 분포 해 있습니다. 번영한 남쪽과는 다르게 북쪽은 황폐화된 지대로 뚜렷하게 구분되어 있습니다. 점점 본인들의 여유공간이 없어지고 있다는 것을 알고있을까요?.",
      width: 128,
      height: 128,
      centerScale: 2.5,
      sideScale: 0.9,
    },
  ]

  // 행성 이동 함수 - 순환 구조로 수정
  const goToPlanet = (index: number) => {
    if (isAnimating) return

    // 인덱스가 범위를 벗어나면 순환하도록 처리
    let targetIndex = index
    if (targetIndex < 0) {
      targetIndex = planets.length - 1
    } else if (targetIndex >= planets.length) {
      targetIndex = 0
    }

    if (targetIndex === currentPlanet) return

    // 애니메이션 시작
    setIsAnimating(true)
    setPreviousPlanet(currentPlanet)
    setCurrentPlanet(targetIndex)
    setAnimationProgress(0)

    // 애니메이션 진행
    const animationDuration = 1200 // 1.2초
    const startTime = Date.now()

    // 이전 타이머 정리
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current)
    }

    // 애니메이션 타이머 설정
    animationTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      setAnimationProgress(progress)

      if (progress >= 1) {
        // 애니메이션 완료
        setIsAnimating(false)
        if (animationTimerRef.current) {
          clearInterval(animationTimerRef.current)
          animationTimerRef.current = null
        }
      }
    }, 16) // 약 60fps
  }

  // 타이핑 효과 시작 함수
  const startTypingEffect = (text: string) => {
    // 이전 타이머 정리
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    // 타이핑 효과 초기화
    setDisplayedName("")
    setIsTyping(true)

    let currentIndex = 0

    // 타이핑 효과를 위한 함수
    const typeCharacter = () => {
      if (currentIndex < text.length) {
        setDisplayedName(text.substring(0, currentIndex + 1))
        currentIndex++
        typingTimerRef.current = setTimeout(typeCharacter, 80) // 80ms 간격
      } else {
        setIsTyping(false)
        typingTimerRef.current = null
      }
    }

    // 타이핑 시작
    typeCharacter()
  }

  // 설명 슬라이드 효과 시작 함수
  const startDescriptionSlideEffect = (description: string) => {
    // 이전 타이머 정리
    if (descriptionTimerRef.current) {
      clearTimeout(descriptionTimerRef.current)
    }

    // 설명을 문장 단위로 분할 (마침표, 물음표, 느낌표 기준)
    const sentences = description.split(/(?<=[.?!])\s+/).filter(sentence => sentence.trim() !== "")
    
    // 초기화
    setDisplayedSentences([])

    let currentIndex = 0

    // 문장별 슬라이드 효과 함수
    const showNextSentence = () => {
      if (currentIndex < sentences.length) {
        setDisplayedSentences(prev => [...prev, sentences[currentIndex]])
        currentIndex++
        descriptionTimerRef.current = setTimeout(showNextSentence, 400) // 400ms 간격으로 문장 표시
      } else {
        descriptionTimerRef.current = null
      }
    }

    // 타이핑 효과가 끝난 후 설명 슬라이드 시작 (약간의 지연)
    setTimeout(() => {
      showNextSentence()
    }, 500) // 타이핑 효과 후 0.5초 지연
  }

  // 모자이크 페이드 효과 시작 함수
  const startMosaicFadeEffect = () => {
    // 이전 타이머 정리
    if (mosaicTimerRef.current) {
      clearTimeout(mosaicTimerRef.current)
    }

    // 15x10 = 150개의 타일로 구성 (더 세밀한 모자이크 효과)
    const totalTiles = 150
    const tiles = new Array(totalTiles).fill(false)
    
    // 초기화
    setShowPlanetImage(false)
    setMosaicTiles(tiles)

    // 약간의 지연 후 모자이크 효과 시작
    setTimeout(() => {
      setShowPlanetImage(true)
      
      // 타일들을 랜덤 순서로 나타나게 하기
      const indices = Array.from({ length: totalTiles }, (_, i) => i)
      // Fisher-Yates 셔플 알고리즘으로 랜덤 순서 생성
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]]
      }

      let currentTileIndex = 0
      let lastTime = 0
      const targetInterval = 8 // 8ms 목표 간격

      // 타일별 나타나는 효과 (requestAnimationFrame 사용)
      const showNextTile = (currentTime: number) => {
        if (currentTime - lastTime >= targetInterval) {
          if (currentTileIndex < totalTiles) {
            const tileIndex = indices[currentTileIndex]
            setMosaicTiles(prev => {
              const newTiles = [...prev]
              newTiles[tileIndex] = true
              return newTiles
            })
            currentTileIndex++
            lastTime = currentTime
          }
        }
        
        if (currentTileIndex < totalTiles) {
          requestAnimationFrame(showNextTile)
        }
      }

      requestAnimationFrame(showNextTile)
    }, 500) // 설명 슬라이드 효과 후 0.5초 지연
  }

  // 현재 행성이 변경될 때마다 타이핑 효과와 설명 슬라이드 효과, 모자이크 효과 시작
  useEffect(() => {
    const planetName = planets[currentPlanet]?.name || ""
    const planetDescription = planets[currentPlanet]?.description || ""
    
    startTypingEffect(planetName)
    startDescriptionSlideEffect(planetDescription)
    startMosaicFadeEffect()
  }, [currentPlanet])

  // 섹션이 활성화될 때도 효과들 시작 (처음 스크롤해서 들어올 때)
  useEffect(() => {
    if (isActive) {
      const planetName = planets[currentPlanet]?.name || ""
      const planetDescription = planets[currentPlanet]?.description || ""
      
      startTypingEffect(planetName)
      startDescriptionSlideEffect(planetDescription)
      startMosaicFadeEffect()
    }
  }, [isActive])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current)
      }
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      if (descriptionTimerRef.current) {
        clearTimeout(descriptionTimerRef.current)
      }
      if (mosaicTimerRef.current) {
        clearTimeout(mosaicTimerRef.current)
      }
    }
  }, [])

  // 다음 행성으로 이동 - 순환 구조로 수정
  const nextPlanet = () => {
    goToPlanet(currentPlanet + 1)
  }

  // 이전 행성으로 이동 - 순환 구조로 수정
  const prevPlanet = () => {
    goToPlanet(currentPlanet - 1)
  }

  // 마우스/터치 이벤트 핸들러
  const handleDragStart = (clientX: number) => {
    if (isAnimating) return
    setIsDragging(true)
    setStartX(clientX)
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging || isAnimating) return

    const deltaX = clientX - startX
    setTranslateX(deltaX)
  }

  const handleDragEnd = () => {
    if (!isDragging || isAnimating) return

    setIsDragging(false)

    // 드래그 거리에 따라 다음/이전 행성으로 이동 - 순환 구조로 수정
    if (Math.abs(translateX) > 100) {
      if (translateX > 0) {
        prevPlanet()
      } else if (translateX < 0) {
        nextPlanet()
      }
    }

    setTranslateX(0)
  }

  // 마우스 이벤트
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragMove(e.clientX)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragEnd()
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    if (isDragging) {
      handleDragEnd()
    }
  }

  // 터치 이벤트
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragMove(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault() // 기본 드래그 동작 방지
    handleDragEnd()
  }

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return

      if (e.key === "ArrowRight") {
        nextPlanet()
      } else if (e.key === "ArrowLeft") {
        prevPlanet()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isActive, currentPlanet])

  // 행성의 애니메이션 스타일 결정 함수
  const getPlanetAnimationStyle = (distance: number) => {
    if (distance === 0) {
      // 중앙 행성 - 원래 애니메이션
      return "float 6s ease-in-out infinite"
    } else if (
      distance === -1 ||
      distance === 1 ||
      distance === planets.length - 1 ||
      distance === -(planets.length - 1)
    ) {
      // 양쪽 행성 - 작은 애니메이션
      return "float-small 8s ease-in-out infinite"
    }
    return "none"
  }

  // 행성 크기 조정 함수 (우라노스 행성 특별 처리)
  const getPlanetContainerStyle = (planet: Planet, distance: number) => {
    // 기본 스타일
    const baseStyle = {
      width: planet.width,
      height: planet.height,
      position: "relative" as const,
    }

    // 우라노스 행성(id: 6)인 경우 특별 처리
    if (planet.id === 6) {
      if (distance === 0) {
        // 중앙에 있을 때 크기 조정
        return {
          ...baseStyle,
          width: 550, // 더 큰 컨테이너
          height: 550, // 더 큰 컨테이너
        }
      } else if (
        distance === -1 ||
        distance === 1 ||
        distance === planets.length - 1 ||
        distance === -(planets.length - 1)
      ) {
        // 양쪽에 있을 때 크기 조정
        return {
          ...baseStyle,
          width: 400, // 측면에서도 큰 컨테이너
          height: 400, // 측면에서도 큰 컨테이너
        }
      }
    }

    return baseStyle
  }

  // 행성 이미지 스타일 조정 함수
  const getPlanetImageStyle = (planet: Planet, distance: number) => {
    // 기본 스타일
    const baseStyle = {
      imageRendering: "pixelated" as const,
      animation: getPlanetAnimationStyle(distance),
      objectFit: "contain" as const,
      userSelect: "none" as const, // 이미지 선택 방지
      pointerEvents: "none" as const, // 이미지에 대한 포인터 이벤트 방지
      WebkitUserSelect: "none" as const, // Safari용
      WebkitTouchCallout: "none" as const, // iOS Safari용
      MozUserSelect: "none" as const, // Firefox용
    }

    // 우라노스 행성(id: 6)인 경우 특별 처리
    if (planet.id === 6) {
      return {
        ...baseStyle,
        objectFit: "contain" as const, // 이미지가 잘리지 않도록 contain 사용
        padding: "20%", // 패딩 증가
      }
    }

    return baseStyle
  }

  // 행성 스케일 계산 함수 (애니메이션 진행에 따라 보간)
  const getPlanetScale = (planet: Planet, index: number) => {
    // 현재 행성과의 거리 계산 (순환 구조)
    const rawDistance = index - currentPlanet
    const distance =
      Math.abs(rawDistance) <= planets.length / 2
        ? rawDistance
        : rawDistance > 0
          ? rawDistance - planets.length
          : rawDistance + planets.length

    // 이전 행성과의 거리 계산 (순환 구조)
    const rawPrevDistance = index - previousPlanet
    const prevDistance =
      Math.abs(rawPrevDistance) <= planets.length / 2
        ? rawPrevDistance
        : rawPrevDistance > 0
          ? rawPrevDistance - planets.length
          : rawPrevDistance + planets.length

    // 현재 위치에서의 스케일 계산
    const getCurrentScale = (dist: number) => {
      if (dist === 0) {
        // 중앙 행성
        return planet.centerScale
      } else if (dist === -1 || dist === 1 || dist === planets.length - 1 || dist === -(planets.length - 1)) {
        // 양쪽 행성
        if (planet.id === 7) {
          return 0.6 // 솔라리스 행성은 더 작게
        } else if (planet.id === 6) {
          return 0.8 // 우라노스 행성은 측면에서 작게
        } else {
          return 0.9 // 일반 행성
        }
      } else {
        // 나머지 행성
        return 0.4
      }
    }

    // 이전 스케일과 현재 스케일 계산
    const prevScale = getCurrentScale(prevDistance)
    const targetScale = getCurrentScale(distance)

    // 애니메이션 중이면 스케일 보간, 아니면 타겟 스케일 바로 적용
    if (isAnimating) {
      // 우라노스 행성의 경우 특별 처리
      if (planet.id === 6) {
        // 이징 함수 적용 (cubic-bezier)
        const easeProgress = cubicBezier(0.4, 0, 0.2, 1, animationProgress)
        return prevScale + (targetScale - prevScale) * easeProgress
      }

      // 일반 행성은 선형 보간
      return prevScale + (targetScale - prevScale) * animationProgress
    }

    return targetScale
  }

  // 행성 위치 계산 함수 (애니메이션 진행에 따라 보간)
  const getPlanetPosition = (planet: Planet, index: number) => {
    // 현재 행성과의 거리 계산 (순환 구조)
    const rawDistance = index - currentPlanet
    const distance =
      Math.abs(rawDistance) <= planets.length / 2
        ? rawDistance
        : rawDistance > 0
          ? rawDistance - planets.length
          : rawDistance + planets.length

    // 이전 행성과의 거리 계산 (순환 구조)
    const rawPrevDistance = index - previousPlanet
    const prevDistance =
      Math.abs(rawPrevDistance) <= planets.length / 2
        ? rawPrevDistance
        : rawPrevDistance > 0
          ? rawPrevDistance - planets.length
          : rawPrevDistance + planets.length

    // 현재 위치에서의 X 위치 계산
    const getCurrentX = (dist: number) => {
      if (dist === 0) {
        // 중앙 행성
        return 0
      } else if (dist === -1 || dist === planets.length - 1) {
        // 이전 행성 (왼쪽)
        return planet.id === 6 ? -650 : -550
      } else if (dist === 1 || dist === -(planets.length - 1)) {
        // 다음 행성 (오른쪽)
        return planet.id === 6 ? 650 : 550
      } else {
        // 나머지 행성
        return dist * 1000
      }
    }

    // 이전 위치와 현재 위치 계산
    const prevX = getCurrentX(prevDistance)
    const targetX = getCurrentX(distance)

    // 애니메이션 중이면 위치 보간, 아니면 타겟 위치 바로 적용
    if (isAnimating) {
      // 우라노스 행성의 경우 특별 처리
      if (planet.id === 6) {
        // 이징 함수 적용 (cubic-bezier)
        const easeProgress = cubicBezier(0.4, 0, 0.2, 1, animationProgress)
        return prevX + (targetX - prevX) * easeProgress
      }

      // 일반 행성은 선형 보간
      return prevX + (targetX - prevX) * animationProgress
    }

    return targetX
  }

  // 행성 불투명도 계산 함수 (애니메이션 진행에 따라 보간)
  const getPlanetOpacity = (planet: Planet, index: number) => {
    // 현재 행성과의 거리 계산 (순환 구조)
    const rawDistance = index - currentPlanet
    const distance =
      Math.abs(rawDistance) <= planets.length / 2
        ? rawDistance
        : rawDistance > 0
          ? rawDistance - planets.length
          : rawDistance + planets.length

    // 이전 행성과의 거리 계산 (순환 구조)
    const rawPrevDistance = index - previousPlanet
    const prevDistance =
      Math.abs(rawPrevDistance) <= planets.length / 2
        ? rawPrevDistance
        : rawPrevDistance > 0
          ? rawPrevDistance - planets.length
          : rawPrevDistance + planets.length

    // 현재 위치에서의 불투명도 계산
    const getCurrentOpacity = (dist: number) => {
      if (dist === 0) {
        // 중앙 행성
        return 1
      } else if (dist === -1 || dist === 1 || dist === planets.length - 1 || dist === -(planets.length - 1)) {
        // 양쪽 행성
        return 0.6
      } else {
        // 나머지 행성
        return 0
      }
    }

    // 이전 불투명도와 현재 불투명도 계산
    const prevOpacity = getCurrentOpacity(prevDistance)
    const targetOpacity = getCurrentOpacity(distance)

    // 애니메이션 중이면 불투명도 보간, 아니면 타겟 불투명도 바로 적용
    if (isAnimating) {
      return prevOpacity + (targetOpacity - prevOpacity) * animationProgress
    }

    return targetOpacity
  }

  // 행성 z-index 계산 함수
  const getPlanetZIndex = (planet: Planet, index: number) => {
    // 현재 행성과의 거리 계산 (순환 구조)
    const rawDistance = index - currentPlanet
    const distance =
      Math.abs(rawDistance) <= planets.length / 2
        ? rawDistance
        : rawDistance > 0
          ? rawDistance - planets.length
          : rawDistance + planets.length

    if (distance === 0) {
      // 중앙 행성
      return 10
    } else if (
      distance === -1 ||
      distance === 1 ||
      distance === planets.length - 1 ||
      distance === -(planets.length - 1)
    ) {
      // 양쪽 행성
      return 5
    } else {
      // 나머지 행성
      return 1
    }
  }

  // 큐빅 베지어 이징 함수 (애니메이션 부드럽게)
  const cubicBezier = (x1: number, y1: number, x2: number, y2: number, t: number) => {
    // 베지어 곡선 계산 (3차)
    const cx = 3 * x1
    const bx = 3 * (x2 - x1) - cx
    const ax = 1 - cx - bx
    const cy = 3 * y1
    const by = 3 * (y2 - y1) - cy
    const ay = 1 - cy - by

    // t에 대한 x 값 계산
    const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t

    // x에 대한 t 값 계산 (뉴턴 라프슨 방법)
    const solveCurveX = (x: number, epsilon = 1e-6) => {
      // t0와 t1은 사용되지 않으므로 제거
      let t2 = x

      // 초기 추측값
      let x2 = sampleCurveX(t2)

      // 뉴턴 라프슨 반복
      for (let i = 0; i < 8; i++) {
        const d2 = (ax * 3 * t2 + bx * 2) * t2 + cx // 미분값
        if (Math.abs(d2) < epsilon) break

        t2 = t2 - (x2 - x) / d2
        x2 = sampleCurveX(t2)
      }

      return t2
    }

    // t에 대한 y 값 계산
    const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t

    // x에 대한 y 값 계산
    return sampleCurveY(solveCurveX(t))
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* 우상단 페이지 카운터 */}
      <div className="absolute top-8 right-8 z-20 flex items-center space-x-2 pointer-events-none">
        <span className="text-white font-pf-stardust text-7xl font-bold pixelated">
          {String(currentPlanet + 1).padStart(2, "0")}
        </span>
        <span className="text-white font-pf-stardust text-7xl">/</span>
        <span className="text-white font-pf-stardust text-7xl font-bold pixelated">
          {String(planets.length).padStart(2, "0")}
        </span>
      </div>

      {/* 행성 이름 (왼쪽 중상단) - 타이핑 효과 적용 */}
      <div className="absolute left-16 top-1/3 z-20 pointer-events-none">
        <h1 
          className="text-6xl font-bold font-pf-stardust leading-tight"
          style={{ 
            color: currentPlanet === 0 ? '#6BE2EF' : 
                   currentPlanet === 1 ? '#E5B597' : 
                   currentPlanet === 2 ? '#F1B9E2' :
                   currentPlanet === 4 ? '#B2D8F8' :
                   currentPlanet === 5 ? '#ABE3B4' :
                   currentPlanet === 6 ? '#ECB462' :
                   currentPlanet === 7 ? '#E6CFB0' : 'white' 
          }}
        >
          {displayedName}
          {isTyping && <span className="animate-pulse">|</span>}
        </h1>
      </div>

      {/* 행성 설명 (왼쪽 중간) - 슬라이드 효과 적용 */}
      <div className="absolute left-16 top-1/2 transform -translate-y-8 z-20 max-w-3xl pointer-events-none">
        <div className="text-white text-lg font-pf-stardust leading-relaxed">
          {displayedSentences.map((sentence, index) => (
            <div
              key={index}
              className="overflow-hidden"
              style={{
                animation: `slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s both`,
              }}
            >
              <p className="transform translate-y-full animate-slideInUp">
                {sentence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 행성 이미지 영역 (우측) - 모자이크 페이드 효과 */}
      {showPlanetImage && (
        <div className="absolute right-20 bottom-11 transform z-20 pointer-events-none">
          <div 
            className="relative"
            style={{ width: "450px", height: "350px" }}
          >
            {/* 모자이크 타일들 */}
            <div 
              className="absolute inset-0"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(15, 1fr)",
                gridTemplateRows: "repeat(10, 1fr)",
              }}
            >
              {mosaicTiles.map((isVisible, index) => {
                const row = Math.floor(index / 15)
                const col = index % 15
                const tileWidth = 450 / 15
                const tileHeight = 350 / 10
                
                return (
                  <div
                    key={index}
                    className="overflow-hidden"
                    style={{
                      width: `${tileWidth}px`,
                      height: `${tileHeight}px`,
                      opacity: isVisible ? 1 : 0,
                      transition: "opacity 0.2s ease-in-out",
                    }}
                  >
                    <div
                      style={{
                        width: "450px",
                        height: "350px",
                        backgroundImage: `url(/image/Planet_image_${currentPlanet + 1}.png)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        transform: `translate(-${col * tileWidth}px, -${row * tileHeight}px)`,
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 행성 정보 (좌하단) */}
      <div 
        className="absolute bottom-8 left-28 z-20 font-mono text-sm space-y-1 pointer-events-none"
        style={{ 
          color: currentPlanet === 0 ? '#78BDD2' : 
                 currentPlanet === 1 ? '#BB967B' : 
                 currentPlanet === 2 ? '#CC82BE' :
                 currentPlanet === 4 ? '#5289C6' :
                 currentPlanet === 5 ? '#6FAD76' :
                 currentPlanet === 6 ? '#C68510' :
                 currentPlanet === 7 ? '#C3B07F' : 'white' 
        }}
      >
        <div>PLANET . . . . . . . . . . {planets[currentPlanet].name}</div>
        <div>COLONIZATION . . . . . {currentPlanet === 0 ? 'ARBORIS CIVILIZATION' : 
                                       currentPlanet === 1 ? 'ARBORIS CIVILIZATION' :
                                       currentPlanet === 2 ? 'ARBORIS CIVILIZATION' :
                                       currentPlanet === 3 ? 'WANDERING CIVILIZATION' :
                                       currentPlanet === 4 ? 'Non CIVILIZATION' :
                                       currentPlanet === 5 ? 'ARBORIS CIVILIZATION' :
                                       currentPlanet === 6 ? 'ARBORIS CIVILIZATION' :
                                       'BUSINESS CIVILIZATION'}</div>
        <div>ORBITAL DISTANCE . . . . {currentPlanet === 0 ? '0.025 AU' :
                                        currentPlanet === 1 ? '0.046 AU' :
                                        currentPlanet === 2 ? '0.07 AU' :
                                        currentPlanet === 3 ? '0.05 AU' :
                                        currentPlanet === 4 ? '0.015 AU' :
                                        currentPlanet === 5 ? '0.1 AU' :
                                        currentPlanet === 6 ? '0.04 AU' :
                                        '0.017 AU'}</div>
        <div>MASS . . . . . . . . . . . . . . . . . . . . . {currentPlanet === 0 ? '1.05KG X 10^2' :
                                           currentPlanet === 1 ? '2.07KG X 10^2' :
                                           currentPlanet === 2 ? '3.3KG X 10^2' :
                                           currentPlanet === 3 ? '0.7KG X 10^2' :
                                           currentPlanet === 4 ? '0.64KG X 10^2' :
                                           currentPlanet === 5 ? '4.21KG X 10^2' :
                                           currentPlanet === 6 ? '2.77KG X 10^2' :
                                           '3.44KG X 10^2'}</div>
        <div>DIAMETER . . . . . . . . . . . . . . . . . . . . . . {currentPlanet === 0 ? '12,742 KM' :
                                              currentPlanet === 1 ? '16,811 KM' :
                                              currentPlanet === 2 ? '10.841 KM' :
                                              currentPlanet === 3 ? '9.672 KM' :
                                              currentPlanet === 4 ? '9,655 KM' :
                                              currentPlanet === 5 ? '22.551 KM' :
                                              currentPlanet === 6 ? '14.581 KM' :
                                              '10.158 KM'}</div>
        <div>GRAVITY . . . . . . . . . . . . . . . . . . . . . . . . . {currentPlanet === 0 ? '1. 11 G' :
                                                 currentPlanet === 1 ? '1. 02 G' :
                                                 currentPlanet === 2 ? '1.6 G' :
                                                 currentPlanet === 3 ? '0.4 G' :
                                                 currentPlanet === 4 ? '0.9 G' :
                                                 currentPlanet === 5 ? '2.13G' :
                                                 currentPlanet === 6 ? '0.2 G' :
                                                 '0.19 G'}</div>
        <div>ATMOSPHERIC DENSITY . . . . . . . . . . . . . . . . {currentPlanet === 0 ? '10.9 M/S^2' :
                                          currentPlanet === 1 ? '12.1 M/S^2' :
                                          currentPlanet === 2 ? '12.1 M/S^2' :
                                          currentPlanet === 3 ? '7.7 M/S^2' :
                                          currentPlanet === 4 ? '5.11 M/S^2' :
                                          currentPlanet === 5 ? '14.4 M/S^2' :
                                          currentPlanet === 6 ? '1.5 M/S^2' :
                                          '10.9 M/S^2'}</div>
        <div>ORBITAL PERIOD . . . . . . . . . . . . {currentPlanet === 0 ? '4.91 EARTH DAYS' :
                                           currentPlanet === 1 ? '7.3 EARTH DAYS' :
                                           currentPlanet === 2 ? '6 EARTH DAYS' :
                                           currentPlanet === 3 ? '5 EARTH DAYS' :
                                           currentPlanet === 4 ? '7 EARTH DAYS' :
                                           currentPlanet === 5 ? '6 EARTH DAYS' :
                                           currentPlanet === 6 ? '9 EARTH DAYS' :
                                           '8.45 EARTH DAYS'}</div>
        <div>ENERGY FLUX . . . . . . . . . . . . . . . . . {currentPlanet === 0 ? '0.02 W/M^2' :
                                              currentPlanet === 1 ? '0.3 W/M^2' :
                                              currentPlanet === 2 ? '1 W/M^2' :
                                              currentPlanet === 3 ? '0.2 W/M^2' :
                                              currentPlanet === 4 ? '0.002 W/M^2' :
                                              currentPlanet === 5 ? '0.8 W/M^2' :
                                              currentPlanet === 6 ? '5.0 W/M^2' :
                                              '0.61 W/M^2'}</div>
        <div>DAY LENGTH . . . . . . . . . . . . . {currentPlanet === 0 ? '23.6 H' :
                                               currentPlanet === 1 ? '11.5 H' :
                                               currentPlanet === 2 ? '14.3 H' :
                                               currentPlanet === 3 ? '26.7 H' :
                                               currentPlanet === 4 ? '25 H' :
                                               currentPlanet === 5 ? '7.4 H' :
                                               currentPlanet === 6 ? '4 H' :
                                               '21.16 H'}</div>
      </div>

      {/* 행성 갤러리 */}
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl h-[90vh] flex items-center justify-center select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          touchAction: "none",
        }}
      >
        {/* 행성들 */}
        <div className="relative w-full h-full flex items-center justify-center z-25">
          {planets.map((planet, index) => {
            // 행성이 화면 밖으로 너무 멀리 벗어나면 렌더링하지 않음
            const rawDistance = index - currentPlanet
            const distance =
              Math.abs(rawDistance) <= planets.length / 2
                ? rawDistance
                : rawDistance > 0
                  ? rawDistance - planets.length
                  : rawDistance + planets.length

            if (Math.abs(distance) > 3 && Math.abs(distance) < planets.length - 3) return null

            // 행성 위치, 스케일, 불투명도 계산
            const positionX = getPlanetPosition(planet, index)
            const scale = getPlanetScale(planet, index)
            const opacity = getPlanetOpacity(planet, index)
            const zIndex = getPlanetZIndex(planet, index)

            // 드래그 중일 때 추가 이동 거리
            const dragOffset = isDragging ? translateX * 0.5 : 0

            return (
              <div
                key={planet.id}
                className="absolute cursor-pointer select-none"
                style={{
                  transform: `translateX(${positionX + dragOffset}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition: isAnimating
                    ? "none"
                    : "transform 1200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1)",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                }}
                onClick={(e) => {
                  e.preventDefault()
                  goToPlanet(index)
                }}
                onDragStart={(e) => e.preventDefault()} // 드래그 시작 방지
              >
                <div className="relative select-none" style={getPlanetContainerStyle(planet, distance)}>
                  <Image
                    src={planet.image || "/placeholder.svg"}
                    alt={planet.name}
                    fill
                    className="pixelated object-contain select-none"
                    style={getPlanetImageStyle(planet, distance)}
                    priority={distance === 0} // 중앙 행성은 우선 로딩
                    draggable={false} // 이미지 드래그 방지
                    onDragStart={(e) => e.preventDefault()} // 이미지 드래그 시작 방지
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 페이지 인디케이터 */}
      <div className="flex space-x-4 mt-8 z-20 px-8 mb-4 w-full justify-center">
        {planets.map((planet, index) => (
          <button
            key={planet.id}
            className={`w-4 h-4 rounded-full transition-all ${
              index === currentPlanet ? "bg-blue-400 scale-125" : "bg-blue-200 opacity-50"
            }`}
            onClick={() => goToPlanet(index)}
            aria-label={`Go to planet ${planet.name}`}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(2deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        
        @keyframes float-small {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(1deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }

        @keyframes slideUp {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideInUp {
          animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        
        /* 전역 선택 방지 스타일 */
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* 이미지 드래그 방지 */
        img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }
      `}</style>
    </div>
  )
}
