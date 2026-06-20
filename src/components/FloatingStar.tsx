export default function FloatingStar() {
  return (
    <div className="animate-float flex items-center justify-center w-[32px] h-[32px]">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-pulse-star"
        style={{
          filter:
            'drop-shadow(0 0 6px rgba(255,231,179,0.95)) drop-shadow(0 0 16px rgba(255,231,179,0.7)) drop-shadow(0 0 32px rgba(255,231,179,0.35))',
        }}
      >
        <defs>
          <linearGradient id="star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE7B3" />
            <stop offset="100%" stopColor="#FFF5D9" />
          </linearGradient>
        </defs>
        <path
          d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z"
          style={{ fill: 'url(#star-grad)' }}
        />
      </svg>
    </div>
  );
}
