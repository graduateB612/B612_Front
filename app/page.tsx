"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

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
  const totalSections = 3 // 총 섹션 수

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
            setRoseBlinkOpacity(1); // B612 타이핑이 끝날 때 장미 완전히 켜짐
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
    ];
    let step = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const blink = () => {
      setRoseBlinkOpacity(blinkPattern[step].opacity);
      setBlinkCount(step);
      step++;
      if (step >= blinkPattern.length) {
        setRoseBlinkOpacity(1);
        return;
      }
      timeoutId = setTimeout(blink, blinkPattern[step].delay);
    };
    blink();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (b612Text === b612Full) {
      setRoseBlinkOpacity(1);
    }
  }, [b612Text]);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    let isScrolling = false
    
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return
      
      isScrolling = true
      
      if (e.deltaY > 0 && currentSection < totalSections - 1) {
        // 아래로 스크롤
        setCurrentSection(prev => prev + 1)
      } else if (e.deltaY < 0 && currentSection > 0) {
        // 위로 스크롤
        setCurrentSection(prev => prev - 1)
      }
      
      // 스크롤 애니메이션이 끝난 후 다시 활성화
      setTimeout(() => {
        isScrolling = false
      }, 800) // 애니메이션 시간에 맞춰 조정
    }
    
    window.addEventListener('wheel', handleWheel)
    
    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [currentSection, totalSections])
  
  // 현재 섹션으로 스크롤
  useEffect(() => {
    const currentSectionElement = sectionsRef.current[currentSection]
    if (currentSectionElement) {
      currentSectionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
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

  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-auto" style={{
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth',
      overflowY: 'auto',
      height: '100vh',
      backgroundImage: 'url("/image/space-bg.png")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "repeat-y", // 배경 이미지 반복 설정
    }}>
      {/* Fixer 텍스트는 2번째 섹션에서만 표시됩니다 */}

      {/* 첫 번째 섹션: 기존 내용 */}
      <section 
        ref={(el) => addSectionRef(el, 0)}
        className="flex min-h-screen flex-col items-center justify-center snap-start"
      >
        <div
          className={`relative cursor-pointer transition-transform hover:scale-110 ${isNavigating ? 'opacity-70' : ''}`}
          onClick={handleClick}
          style={{ width: 400, height: 400 }}
        >
          <span className="absolute z-10 text-white text-6xl select-none" style={{left: '-140px', top: '80px'}}>{projectText}</span>
          <span className="absolute z-10 text-white text-6xl select-none" style={{right: '-180px', bottom: '80px'}}>{b612Text}</span>
          <Image
            src="/image/rose.png"
            alt="Rose"
            width={400}
            height={400}
            priority
            className="z-0"
            style={{
              opacity: roseBlinkOpacity,
              transition: roseBlinkOpacity === 1 && blinkCount >= 10 ? "opacity 0.15s" : "none"
            }}
          />
        </div>
        <p className="mt-4 text-2xl text-white min-h-[2.5rem] relative">
          <span className="invisible">{fullText}</span>
          <span className="absolute left-0 top-0">{typedText}</span>
        </p>
      </section>

      {/* 두 번째 섹션 */}
      <section 
        ref={(el) => addSectionRef(el, 1)}
        className="flex min-h-screen flex-col items-center justify-center snap-start relative"
        >
        {/* Fixer 텍스트 (2번째 섹션 좌측 상단) */}
        <div className="absolute top-8 left-8 z-50">
          <span className="text-white text-3xl font-bold">Fixer</span>
        </div>
        <div className="grid grid-cols-4 gap-24 max-w-7xl mx-auto">
          {/* 여우 캐릭터 */}
          <div className="flex flex-col items-center">
            <div
              className="relative cursor-pointer"
              style={{
                height: "525px", // 350px * 1.5
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ width: 300, height: 450, position: "relative" }}> {/* 200px * 1.5, 300px * 1.5 */}
                <Image
                  src="/image/select_fox.png"
                  alt="여우"
                  fill
                  className="object-contain"
                  style={{
                    filter: 'brightness(0)', // 실루엣 효과
                    objectPosition: "bottom",
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* 어린왕자 캐릭터 */}
          <div className="flex flex-col items-center">
            <div
              className="relative cursor-pointer"
              style={{
                height: "525px", // 350px * 1.5
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ width: 300, height: 450, position: "relative" }}> {/* 200px * 1.5, 300px * 1.5 */}
                <Image
                  src="/image/select_prince.png"
                  alt="어린왕자"
                  fill
                  className="object-contain"
                  style={{
                    filter: 'brightness(0)', // 실루엣 효과
                    objectPosition: "bottom",
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* 장미 캐릭터 */}
          <div className="flex flex-col items-center">
            <div
              className="relative cursor-pointer"
              style={{
                height: "525px", // 350px * 1.5
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ width: 240, height: 360, position: "relative" }}> {/* 160px * 1.5, 240px * 1.5 */}
                <Image
                  src="/image/select_rose.png"
                  alt="장미"
                  fill
                  className="object-contain"
                  style={{
                    filter: 'brightness(0)', // 실루엣 효과
                    objectPosition: "bottom",
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* 바오밥 캐릭터 */}
          <div className="flex flex-col items-center">
            <div
              className="relative cursor-pointer"
              style={{
                height: "525px", // 350px * 1.5
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ width: 300, height: 450, position: "relative" }}> {/* 200px * 1.5, 300px * 1.5 */}
                <Image
                  src="/image/select_bob.png"
                  alt="바오밥"
                  fill
                  className="object-contain"
                  style={{
                    filter: 'brightness(0)', // 실루엣 효과
                    objectPosition: "bottom",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 세 번째 섹션 */}
      <section 
        ref={(el) => addSectionRef(el, 2)}
        className="flex min-h-screen flex-col items-center justify-center snap-start"
      >
        {/* 섹션 3 내용은 요구사항에 없어 비워둠 */}
      </section>
    </div>
  )
}