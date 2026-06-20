export default function FantasyFrame() {
  // Dramatic rocky cliff silhouette — jagged ledges and outcroppings (viewBox 0 0 220 1000)
  const cliffPath =
    'M 0 0 L 200 0 C 210 35, 180 70, 198 120 C 218 170, 155 210, 188 270 L 182 295 C 212 340, 142 375, 178 430 C 205 480, 132 520, 168 580 L 162 610 C 195 655, 128 690, 165 750 C 192 800, 140 840, 168 895 C 185 940, 152 975, 162 1000 L 0 1000 Z';

  // Inner cliff face — narrower, slightly lighter for depth
  const cliffInnerPath =
    'M 0 60 L 150 80 C 168 130, 118 170, 148 230 C 172 280, 105 320, 142 390 C 165 440, 98 480, 135 550 C 158 610, 100 650, 132 720 C 152 780, 108 820, 130 890 C 148 940, 118 970, 128 1000 L 0 1000 Z';

  // Top corner branch/vine shapes (viewBox 0 0 300 200)
  const branchPath =
    'M 0 0 L 260 0 C 240 22, 195 18, 155 32 C 185 48, 225 44, 250 38 C 215 62, 165 56, 125 72 C 150 86, 185 82, 205 76 C 168 98, 115 92, 78 108 C 92 122, 115 128, 98 148 C 68 132, 42 108, 0 88 Z';

  // Glowing magic dots scattered on cliff face
  const glowDots = [
    { top: '14%', left: '52%', size: 5, color: '#C99CFF', delay: 0 },
    { top: '29%', left: '38%', size: 4, color: '#D8B8FF', delay: 0.7 },
    { top: '46%', left: '58%', size: 6, color: '#9A7DFF', delay: 1.4 },
    { top: '63%', left: '42%', size: 4, color: '#FFE7B3', delay: 0.3 },
    { top: '78%', left: '54%', size: 5, color: '#C99CFF', delay: 2.0 },
    { top: '91%', left: '36%', size: 3, color: '#D8B8FF', delay: 1.1 },
  ];

  const renderCliff = (side: 'left' | 'right') => (
    <div
      className={`absolute ${side}-0 top-0 bottom-0 w-[140px] md:w-[220px] hidden sm:block`}
      style={side === 'right' ? { transform: 'scaleX(-1)' } : undefined}
    >
      {/* Main cliff silhouette — darkest layer */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 220 1000"
        preserveAspectRatio="none"
      >
        <path d={cliffPath} style={{ fill: '#0F0820' }} />
      </svg>

      {/* Inner cliff face — slightly lighter for depth */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 220 1000"
        preserveAspectRatio="none"
        style={{ opacity: 0.6 }}
      >
        <path d={cliffInnerPath} style={{ fill: '#1a0f30' }} />
      </svg>

      {/* Depth gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, #0F0820 0%, rgba(15,8,32,0.85) 50%, transparent 100%)',
        }}
      />

      {/* Inner edge magical glow */}
      <div
        className="absolute top-0 bottom-0 right-0 w-[60px]"
        style={{
          background:
            'linear-gradient(to left, rgba(154,125,255,0.07), rgba(154,125,255,0.02) 50%, transparent)',
        }}
      />

      {/* Glowing magic dots */}
      {glowDots.map((dot, idx) => (
        <div
          key={`${side}-dot-${idx}`}
          className="absolute rounded-full animate-pulse"
          style={{
            top: dot.top,
            left: dot.left,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            backgroundColor: dot.color,
            opacity: 0.7,
            filter: 'blur(1px)',
            boxShadow: `0 0 ${dot.size * 2}px ${dot.size}px ${dot.color}80`,
            animationDelay: `${dot.delay + (side === 'right' ? 0.15 : 0)}s`,
            animationDuration: '3s',
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Left Cliff */}
      {renderCliff('left')}

      {/* Right Cliff (mirrored) */}
      {renderCliff('right')}

      {/* Top-left corner branches */}
      <div
        className="absolute left-0 top-0 w-[180px] md:w-[300px] h-[120px] md:h-[200px]"
        style={{ opacity: 0.7 }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 300 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={branchPath} style={{ fill: '#1a0f30' }} />
        </svg>
      </div>

      {/* Top-right corner branches (mirrored) */}
      <div
        className="absolute right-0 top-0 w-[180px] md:w-[300px] h-[120px] md:h-[200px]"
        style={{ opacity: 0.7, transform: 'scaleX(-1)' }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 300 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={branchPath} style={{ fill: '#1a0f30' }} />
        </svg>
      </div>

      {/* Subtle vignette overlay for deeper edge framing */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(15,8,32,0.4) 80%, rgba(15,8,32,0.7) 100%)',
        }}
      />
    </div>
  );
}
