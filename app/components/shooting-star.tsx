// components/ShootingStar.tsx
import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  tailLength: number;
  opacity: number;
  active: boolean;
  angle: number;
  color: string;
}

export default function ShootingStar() {
  const [stars, setStars] = useState<Star[]>([]);
  
  useEffect(() => {
    // 별똥별 생성 함수
    const createStar = (): Star => {
      // 시작 위치를 화면 상단에서 랜덤하게 설정
      const x = Math.random() * window.innerWidth;
      const y = -50;
      
      // 각도를 약 45도로 고정 (오른쪽 아래 방향으로 일관되게 떨어짐)
      const angle = Math.PI / 4 + (Math.random() * 0.1 - 0.05); // 약간의 변동만 허용
      
      // 별똥별 색상 - 다양한 색상 추가 (옅은 버전)
      const colors = [
        'white', // 기존 흰색
        'rgba(255, 255, 180, 0.8)', // 옅은 노랑
        'rgba(180, 180, 255, 0.8)', // 옅은 파랑
        'rgba(255, 180, 180, 0.8)'  // 옅은 빨강
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // 별똥별 크기, 속도, 꼬리 길이 설정
      const size = 1; // 1px 크기로 고정 (가는 선처럼 보이도록)
      const speed = Math.random() * 8 + 30; // 30-38 사이의 속도 (극도로 빠르게)
      const tailLength = Math.floor(Math.random() * 20) + 80; // 80-100 사이의 꼬리 길이 (훨씬 더 길게)
      
      return {
        id: Date.now() + Math.random(),
        x,
        y,
        size,
        speed,
        tailLength,
        opacity: 0.95, // 더 선명한 불투명도
        active: true,
        angle,
        color,
      };
    };
    
    // 별똥별 업데이트 및 이동 함수
    const updateStars = () => {
      setStars(prevStars => {
        return prevStars.map(star => {
          // 각도에 따라 대각선으로 이동 (더 큰 스텝으로 이동)
          const newX = star.x + Math.cos(star.angle) * star.speed;
          const newY = star.y + Math.sin(star.angle) * star.speed;
          
          // 화면 밖으로 나가면 비활성화
          if (newX > window.innerWidth + 50 || newY > window.innerHeight + 50) {
            return { ...star, active: false };
          }
          
          return { ...star, x: newX, y: newY };
        }).filter(star => star.active); // 비활성화된 별똥별 제거
      });
    };
    
    // 새 별똥별 추가
    const addNewStar = () => {
      // 확률에 따라 별똥별 생성 (더 낮은 확률로 변경)
      if (Math.random() < 0.01) { // 1% 확률 (매우 가끔씩만 나타나도록)
        setStars(prevStars => [...prevStars, createStar()]);
      }
    };
    
    // 애니메이션 프레임 설정 (더 느린 업데이트로 한 번에 더 많이 이동)
    const animationId = setInterval(() => {
      updateStars();
      addNewStar();
    }, 50); // 초당 20프레임 정도로 감소
    
    // 초기 별똥별 생성
    const initialStars = Array.from({ length: 2 }, () => createStar());
    setStars(initialStars);
    
    // 컴포넌트 언마운트 시 애니메이션 정리
    return () => {
      clearInterval(animationId);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {stars.map((star) => (
        <div key={star.id} style={{ position: 'absolute', left: 0, top: 0 }}>
          {/* 별똥별 꼬리 (선 형태로 구성) */}
          {Array.from({ length: star.tailLength }).map((_, i) => {
            // 픽셀아트 스타일과 맞춰서 간격 조정 (모든 픽셀 표시하여 선이 끊어지지 않도록)
            // 앞부분은 촘촘하게, 뒷부분은 간격 있게
            if (i > 30 && i % 2 !== 0) {
              return null;
            }
            
            const tailX = star.x - Math.cos(star.angle) * i;
            const tailY = star.y - Math.sin(star.angle) * i;
            
            // 꼬리가 별과 멀어질수록 불투명도 감소 (좀 더 선형적으로)
            const distance = i / star.tailLength;
            const tailOpacity = star.opacity * (1 - distance);
            
            return (
              <div
                key={`tail-${i}`}
                style={{
                  position: 'absolute',
                  left: `${tailX}px`,
                  top: `${tailY}px`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  backgroundColor: star.color,
                  opacity: tailOpacity,
                }}
              />
            );
          })}
          
          {/* 별똥별 본체 - 원래 크기로 되돌림 */}
          <div
            style={{
              position: 'absolute',
              left: `${star.x}px`,
              top: `${star.y}px`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              opacity: star.opacity,
            }}
          />
        </div>
      ))}
    </div>
  );
}