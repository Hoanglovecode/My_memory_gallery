import { useMemo } from 'react';

export default function AnimatedParticles() {
  const particles = useMemo(() => {
    const colors = ['#D8B8FF', '#C99CFF', '#9A7DFF', '#FFE7B3'];
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: `${Math.random() * 5}s`,
      duration: `${5 + Math.random() * 5}s`,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-float"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            boxShadow: `0 0 ${p.size * 2}px ${p.size}px ${p.color}, 0 0 ${p.size * 4}px ${p.size * 2}px ${p.color}50`,
          }}
        />
      ))}
    </div>
  );
}
