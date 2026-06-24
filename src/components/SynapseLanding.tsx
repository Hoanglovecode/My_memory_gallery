import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate } from 'framer-motion';
import type { View } from '../types';

interface SynapseLandingProps {
  navigate: (view: View) => void;
}

// --- GLOBAL STYLES & FONT INJECTION ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
    @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

    :root {
      --font-space-mono: "Space Mono", monospace;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: var(--font-space-mono) !important;
    }

    html, body {
      background: #000;
      color: #fff;
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .watermark-font {
      font-family: "Anton SC", sans-serif !important;
    }

    /* Override Tailwind Font Classes */
    .font-sans, .font-serif, .font-mono {
      font-family: var(--font-space-mono) !important;
    }

    /* Lenis Smooth Scroll Utilities */
    html.lenis, html.lenis body { height: auto; }
    .lenis.lenis-smooth { scroll-behavior: auto !important; }
    .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
    .lenis.lenis-stopped { overflow: hidden; }
    .lenis.lenis-scrolling iframe { pointer-events: none; }
  `}</style>
);

// --- UTILITY COMPONENTS ---

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><';
const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

function ScrambleIn({ text, delay, triggered }: { text: string; delay: number; triggered: boolean }) {
  const [displayText, setDisplayText] = useState(() => text.replace(/./g, '\u00A0'));

  useEffect(() => {
    if (!triggered) {
      setDisplayText(text.replace(/./g, '\u00A0'));
      return;
    }

    let interval: number | undefined;
    const timeout = setTimeout(() => {
      let cursor = 0;
      interval = window.setInterval(() => {
        cursor += 0.5;
        let newText = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') {
            newText += ' ';
          } else if (i < Math.floor(cursor)) {
            newText += text[i];
          } else if (i < Math.floor(cursor) + 3) {
            newText += randomChar();
          } else {
            newText += '\u00A0';
          }
        }
        setDisplayText(newText);
        if (cursor > text.length + 3) {
          if (interval) clearInterval(interval);
          setDisplayText(text);
        }
      }, 25);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [triggered, delay, text]);

  return <span>{displayText}</span>;
}

function ScrambleText({ text, isHovered, className }: { text: string; isHovered: boolean; className?: string }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(text);
      return;
    }

    let cursor = 0;
    const interval = setInterval(() => {
      cursor += 0.25; // 4 frames per char reveal
      let newText = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          newText += ' ';
        } else if (i < Math.floor(cursor)) {
          newText += text[i];
        } else {
          newText += randomChar(); // Scrambles everything not yet revealed
        }
      }
      setDisplayText(newText);
      if (cursor > text.length) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isHovered, text]);

  return <span className={className}>{displayText}</span>;
}

function SynapseXLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} fill="currentColor">
      <path d="M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z" />
      <path d="M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z" transform="rotate(90)" />
      <path d="M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z" transform="rotate(180)" />
      <path d="M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z" transform="rotate(270)" />
    </svg>
  );
}

function SquashHamburger({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative w-[15px] h-[10px] md:w-[18px] md:h-[12px]">
      <motion.span
        className="absolute left-0 top-0 w-full bg-white origin-center"
        style={{ height: '1.2px' }}
        animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 4.4 : 0 }}
        transition={{ stiffness: 300, damping: 20 }}
      />
      <motion.span
        className="absolute left-0 top-[4.4px] w-full bg-white origin-center"
        style={{ height: '1.2px' }}
        animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0 : 1 }}
        transition={{ stiffness: 300, damping: 20 }}
      />
      <motion.span
        className="absolute left-0 bottom-0 w-full bg-white origin-center"
        style={{ height: '1.2px' }}
        animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -4.4 : 0 }}
        transition={{ stiffness: 300, damping: 20 }}
      />
    </div>
  );
}

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="text-[14px] sm:text-[16px] font-normal text-white/85 hover:text-white transition-colors cursor-pointer"
    >
      <ScrambleText text={label} isHovered={isHovered} />
    </button>
  );
}

// --- MAIN APPLICATION ---

export default function SynapseLanding({ navigate }: SynapseLandingProps) {
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);

  const section2Ref = useRef<HTMLDivElement>(null);
  
  // Section 2 Scroll Animation
  const { scrollYProgress } = useScroll({ target: section2Ref, offset: ["start end", "end start"] });
  const yTransform = useTransform(scrollYProgress, [0.3, 0.7], [60, -120]);
  const springY = useSpring(yTransform, { stiffness: 15, damping: 32, mass: 1.8 });
  const cinematicOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const cinematicTransform = useMotionTemplate`rotateX(24deg) translateY(${springY}px) translateZ(15px)`;

  // Setup device width detection & entrance delay
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const t = setTimeout(() => setEntranceComplete(true), 800);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t);
    };
  }, []);

  // Hero Video scrubbing logic
  useEffect(() => {
    if (heroVideoRef.current) heroVideoRef.current.pause();

    const handleMouseMove = (e: MouseEvent) => {
      const video = heroVideoRef.current;
      if (!video || isNaN(video.duration)) return;
      
      const sensitivity = 0.8;
      const deltaSeconds = (e.movementX / 100) * 0.5 * sensitivity;
      
      let newTime = targetTimeRef.current + deltaSeconds;
      newTime = Math.max(0, Math.min(video.duration, newTime));
      targetTimeRef.current = newTime;

      if (!isSeekingRef.current && Math.abs(video.currentTime - targetTimeRef.current) > 0.05) {
        isSeekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleHeroSeeked = () => {
    isSeekingRef.current = false;
    const video = heroVideoRef.current;
    if (video && Math.abs(video.currentTime - targetTimeRef.current) > 0.05) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  };

  const [downloadHovered, setDownloadHovered] = useState(false);

  return (
    <main className="relative w-full bg-black text-white selection:bg-white/20">
      <GlobalStyles />

      {/* NAVBAR */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: entranceComplete ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 w-full h-20 px-4 sm:px-8 flex items-center justify-between z-50 pointer-events-auto"
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Logo Pill */}
          <motion.div
            animate={{ 
              width: isMenuOpen && isMobile ? 0 : 'auto', 
              opacity: isMenuOpen && isMobile ? 0 : 1,
              marginRight: isMenuOpen && isMobile ? 0 : (isMobile ? '4px' : '8px')
            }}
            className="flex-shrink-0 overflow-hidden"
          >
            <motion.div 
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.22)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('fantasy')}
              className="h-9 sm:h-12 px-4 sm:px-5 bg-white/15 backdrop-blur-md rounded-[10px] sm:rounded-[14px] flex items-center gap-2 cursor-pointer transition-colors hidden md:flex"
            >
              <SynapseXLogo className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] text-white" />
              <span className="text-[13px] sm:text-[16px] font-medium tracking-tight text-white">Memories</span>
            </motion.div>
            {/* Mobile version (always visible unless menu open) */}
            <motion.div 
              onClick={() => navigate('fantasy')}
              className="h-9 px-4 bg-white/15 backdrop-blur-md rounded-[10px] flex md:hidden items-center gap-2 cursor-pointer transition-colors"
            >
              <SynapseXLogo className="w-[14px] h-[14px] text-white" />
              <span className="text-[13px] font-medium tracking-tight text-white">Memories</span>
            </motion.div>
          </motion.div>

          {/* Expandable Menu Pill */}
          <motion.div
            animate={{
              width: isMenuOpen ? (isMobile ? '100%' : 290) : (isMobile ? 36 : 48)
            }}
            className="h-9 sm:h-12 bg-white/15 backdrop-blur-md rounded-[10px] sm:rounded-[14px] flex items-center overflow-hidden flex-shrink-0"
            transition={{ stiffness: 350, damping: 28 }}
          >
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="w-[36px] h-[36px] sm:w-[48px] sm:h-[48px] flex-shrink-0 flex justify-center items-center rounded-[10px] sm:rounded-[14px] bg-transparent hover:bg-white/10 ml-0 sm:ml-1.5 transition-colors cursor-pointer"
            >
              <SquashHamburger isOpen={isMenuOpen} />
            </button>
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : 15 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-6 px-4 whitespace-nowrap"
            >
              <NavLink label="Giới Thiệu" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} />
              <NavLink label="Hành Trình" onClick={() => window.scrollTo({ top: window.innerHeight * 2, behavior: 'smooth' })} />
              <NavLink label="Vào Album" onClick={() => navigate('fantasy')} />
            </motion.div>
          </motion.div>
        </div>

        {/* Download Button / Enter Gallery */}
        <motion.button
          onMouseEnter={() => setDownloadHovered(true)}
          onMouseLeave={() => setDownloadHovered(false)}
          whileHover={{ scale: 1.03, backgroundColor: '#e2e2e6' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('fantasy')}
          className="h-9 px-3.5 sm:h-12 sm:px-6 bg-white rounded-full flex items-center gap-2 text-black flex-shrink-0 ml-4 cursor-pointer"
        >
          <i className="bi bi-heart-fill text-[14px] sm:text-[18px] text-rose-500" />
          <span className="text-[13px] sm:text-[16px] font-medium">
            <ScrambleText text="Khám Phá" isHovered={downloadHovered} />
          </span>
        </motion.button>
      </motion.nav>

      {/* SECTION 1: HERO */}
      <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 md:px-8">
        <video 
          ref={heroVideoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4" 
          className="absolute inset-0 w-full h-full object-cover z-0"
          muted 
          playsInline 
          preload="auto"
          onSeeked={handleHeroSeeked}
        />
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-5" 
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        />
        
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-[50px] z-0">
          <h2 
            className="watermark-font uppercase tracking-[-4px] leading-none text-[clamp(120px,30vw,521px)] font-bold text-transparent bg-clip-text"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)', opacity: 0.10 }}
          >
            OUR LOVE
          </h2>
        </div>

        {/* Content Spacer */}
        <div className="flex-1" />

        {/* Bottom Typography */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between w-full z-10 relative">
          <div className="flex flex-col gap-4">
            <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)]">
              <ScrambleIn text="Kỷ Niệm" delay={200} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="Yêu Thương" delay={500} triggered={entranceComplete} />
            </h1>
            <motion.p
              initial={{ y: 25, opacity: 0 }}
              animate={entranceComplete ? { y: 0, opacity: 1 } : { y: 25, opacity: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.215, 0.610, 0.355, 1.000] }}
              className="max-w-sm text-[13px] sm:text-[15px] text-white/60 leading-relaxed"
            >
              Nơi những khoảnh khắc vô giá của tình yêu được lưu giữ mãi mãi. Memories giúp chúng ta lưu trữ từng bức ảnh, thước phim và dòng thư tình ngọt ngào theo năm tháng.
            </motion.p>
          </div>
          <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)] text-left md:text-right">
            <ScrambleIn text="Một" delay={700} triggered={entranceComplete} />
            <br />
            <ScrambleIn text="Hành Trình" delay={1000} triggered={entranceComplete} />
          </h1>
        </div>
      </section>

      {/* SECTION 2: CINEMATIC TEXT */}
      <section ref={section2Ref} className="relative h-[100dvh] w-full overflow-hidden">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4" 
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />
        <div className="absolute inset-x-0 top-0 h-[180px] bg-gradient-to-b from-[#010103] to-transparent z-10" />
        
        <div className="relative z-20 h-full flex items-center justify-center" style={{ perspective: '400px' }}>
          <motion.p 
            style={{ transform: cinematicTransform, opacity: cinematicOpacity, transformStyle: 'preserve-3d' }}
            className="max-w-5xl font-sans font-normal text-[22px] sm:text-[30px] md:text-[36px] lg:text-[42px] text-white leading-[1.35] tracking-[-0.02em] select-none px-6 sm:px-12 text-center"
          >
            Một không gian kỷ niệm được dựng nên từ những câu chuyện và khoảnh khắc vô giá của chúng ta. Nơi thời gian như ngừng lại sau mỗi góc nhìn, nơi tiếng cười và những cái ôm ấm áp được tái hiện sống động nhất. Từng chặng đường chúng ta đã đi qua đều được ghi lại trọn vẹn, lọc đi những ồn ào của cuộc sống để giữ lại cảm xúc chân thật nhất.
          </motion.p>
        </div>
      </section>

      {/* SECTION 3: METRICS */}
      <section className="relative min-h-screen w-full py-32 px-6 flex flex-col items-center justify-center">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4" 
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />
        <div className="absolute inset-0 bg-black/30 z-0" /> {/* Subtle darkening */}

        <div className="relative z-10 w-full max-w-6xl">
          <motion.h4 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2 }}
            className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-20 text-center"
          >
            Hành Trình Yêu Thương
          </motion.h4>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 text-center"
          >
            {[
              { val: "1,000+", label: "Bức Ảnh Kỷ Niệm" },
              { val: "100%", label: "Tình Yêu Đong Đầy" },
              { val: "365+ Ngày", label: "Bên Nhau Hạnh Phúc" }
            ].map((metric, i) => (
              <motion.div 
                key={i}
                variants={{
                  hidden: { y: 30, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.8 } }
                }}
                className="flex flex-col items-center"
              >
                <div className="text-white text-[clamp(48px,10vw,96px)] font-light tracking-[-0.04em] leading-none">
                  {metric.val}
                </div>
                <div className="text-white/40 text-[13px] sm:text-[15px] mt-4 tracking-wide">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: TECHNOLOGY / ADAPTIVE */}
      <section className="relative h-[100dvh] w-full flex flex-col py-12 sm:py-16 px-8 sm:px-12 md:px-16 overflow-hidden">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4" 
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />
        
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-6 w-full">
          <motion.h2 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0 }}
            className="text-white font-light text-[clamp(36px,8vw,72px)] leading-[0.95] tracking-[-0.03em]"
          >
            Không Gian<br/>Yêu Thương
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0, delay: 0.2 }}
            className="text-white/50 text-[13px] sm:text-[15px] leading-relaxed max-w-xs md:text-right md:pt-2"
          >
            Trang web lưu trữ những thước phim và hình ảnh đáng nhớ trong cuộc sống của chúng ta. Nơi tình yêu và kỷ niệm được ghi dấu trọn vẹn.
          </motion.p>
        </div>

        <div className="flex-1" />

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
          className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 w-full"
        >
          {[
            { title: "Kho Ảnh Kỷ Niệm", desc: "Nơi lưu giữ từng khoảnh khắc ngọt ngào rạng rỡ của hai ta." },
            { title: "Thước Phim Sống Động", desc: "Tái hiện những hành trình cảm xúc và nụ cười ấm áp." },
            { title: "Bức Thư Tình Yêu", desc: "Lưu trữ lời nhắn gửi chân thành và ngọt ngào qua năm tháng." },
            { title: "Trò Chuyện AI", desc: "AI Love Bot luôn sẵn sàng trò chuyện cùng bạn về kỷ niệm." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: 0.7 } }
              }}
            >
              <h3 className="text-white text-[14px] sm:text-[16px] font-normal mb-2">{item.title}</h3>
              <p className="text-white/40 text-[12px] sm:text-[14px] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 5: ARCHITECTURE */}
      <section className="relative min-h-screen w-full bg-black flex flex-col items-center justify-center px-6 py-32">
        <div className="w-full max-w-3xl text-center">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.0 }}
          >
            <h4 className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-8">Kiến Trúc Album</h4>
            <h2 className="text-white font-light text-[clamp(28px,6vw,56px)] leading-[1.15] tracking-[-0.02em] mb-10">
              Ba phần. Trọn khoảnh khắc.
            </h2>
            <p className="text-white/45 text-[15px] sm:text-[17px] leading-relaxed max-w-xl mx-auto">
              Từ những hình ảnh đáng nhớ, thước phim sống động cho đến những lá thư tay tràn đầy tình cảm yêu thương.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={{ visible: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } } }}
            className="mt-20 flex flex-col items-center gap-4 w-full"
          >
            {[
              { id: "1", name: "Hình Ảnh Kỷ Niệm" },
              { id: "2", name: "Video Trải Nghiệm" },
              { id: "3", name: "Thư Tình Trao Gửi" }
            ].map(layer => (
              <motion.div 
                key={layer.id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 1.2 } }
                }}
                className="w-full max-w-md h-[72px] border border-white/10 rounded-lg flex items-center justify-between px-6 bg-white/[0.02]"
              >
                <span className="text-white/30 text-[12px] tracking-[0.15em] uppercase">Layer {layer.id}</span>
                <span className="text-white text-[16px] sm:text-[18px] font-light">{layer.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-black flex flex-col md:flex-row min-h-[400px] overflow-hidden">
        <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
          <video 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4" 
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover" 
          />
        </div>
        <div className="w-full md:w-1/2 p-10 sm:p-16 flex flex-col justify-between bg-[#030303]">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <SynapseXLogo className="w-[18px] h-[18px] text-white/70" />
              <span className="text-[15px] font-medium text-white/70 tracking-tight">Memories</span>
            </div>
            <p className="text-white/40 text-[14px] sm:text-[15px] leading-relaxed max-w-sm">
              Nơi lưu trữ những kỷ niệm đẹp đẽ của tình yêu, đồng hành cùng năm tháng dài lâu của đôi ta.
            </p>
          </div>
          <div className="text-white/25 text-[12px] mt-12">
            &copy; 2026 Memories Gallery. Được phát triển bởi Lê Văn Hoàng ❤️
          </div>
        </div>
      </footer>
    </main>
  );
}
