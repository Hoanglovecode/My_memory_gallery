import { useMemo } from 'react';

export default function FallingPetals() {
  const petals = useMemo(() => {
    const colors = ['#FFD1DC', '#FFB7B2', '#E2F0CB', '#FFF3B0'];
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 10 + 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 15,
      duration: Math.random() * 8 + 10,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-[40%_60%_50%_50%] animate-petal opacity-70"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.2}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            filter: 'drop-shadow(0 2px 4px rgba(255,183,178,0.4))',
          }}
        />
      ))}
    </div>
  );
}
