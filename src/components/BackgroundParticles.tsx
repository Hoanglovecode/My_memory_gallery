import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  symbol: string;
}

const symbols = {
  heart: ['❤️', '💖', '💝', '💕', '💗', '💓', '💞', '💟']
};

export default function BackgroundParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = [];
    const symbolList = symbols.heart;
    for (let i = 0; i < 80; i++) {
      const symbol = symbolList[Math.floor(Math.random() * symbolList.length)];
      items.push({
        id: i,
        x: Math.random() * 100, // percentage from left
        size: Math.random() * 32 + 8, // 8px to 40px
        delay: Math.random() * 10, // delay up to 10s to spread them nicely
        duration: Math.random() * 6 + 6, // float duration 6s to 12s for a gentler, premium feel
        drift: Math.random() * 120 - 60, // horizontal drift -60px to 60px
        rotate: Math.random() * 360 - 180, // rotation -180deg to 180deg
        symbol
      });
    }
    setParticles(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute bottom-[-50px] text-center select-none animate-drift opacity-0"
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            filter: 'drop-shadow(0 2px 5px rgba(242,190,209,0.3))',
            // Set custom properties for CSS
            ['--drift-x' as any]: `${p.drift}px`,
            ['--drift-rotate' as any]: `${p.rotate}deg`,
            ['--drift-duration' as any]: `${p.duration}s`,
            ['--drift-delay' as any]: `${p.delay}s`
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
