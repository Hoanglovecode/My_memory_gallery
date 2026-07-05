import { motion } from 'framer-motion';
import FallingPetals from './FallingPetals';
import type { View } from '../types';

interface HeroProps {
  navigate: (view: View) => void;
  totalPhotos: number;
  totalVideos: number;
}

export default function Hero({ navigate, totalPhotos, totalVideos }: HeroProps) {
  return (
    <section className="relative w-full min-h-screen lg:h-screen overflow-y-visible lg:overflow-hidden bg-[#FDFBF7]">
      {/* Background Sky */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E0F7FA] via-[#FCE4EC] to-[#FFF9C4]"></div>

        {/* Divine Center Light */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vh] bg-[#FFFFFF] rounded-full blur-[80px] opacity-80"></div>
        <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[40vh] bg-[#FFD1DC] rounded-full blur-[100px] opacity-40 mix-blend-multiply"></div>

        {/* Decorative Floral / Heavenly Clouds Border */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left Floral Bushes */}
          <svg className="absolute left-0 top-0 w-[400px] h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,0 L30,0 Q60,20 40,50 Q70,70 20,100 L0,100 Z" style={{ fill: '#E8F5E9', opacity: 0.8 }} />
            <path d="M0,0 L20,0 Q50,30 20,60 Q40,80 10,100 L0,100 Z" style={{ fill: '#F8BBD0', opacity: 0.9 }} />
            <circle cx="10" cy="20" r="15" style={{ fill: '#FFCCBC', filter: 'blur(8px)', opacity: 0.7 }} />
            <circle cx="20" cy="70" r="18" style={{ fill: '#FFF9C4', filter: 'blur(12px)', opacity: 0.8 }} />
            <circle cx="30" cy="45" r="10" style={{ fill: '#FCE4EC', opacity: 0.9 }} />
          </svg>

          {/* Right Floral Bushes */}
          <svg className="absolute right-0 top-0 w-[400px] h-full scale-x-[-1]" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,0 L35,0 Q65,25 30,55 Q60,80 25,100 L0,100 Z" style={{ fill: '#E0F2F1', opacity: 0.8 }} />
            <path d="M0,0 L15,0 Q45,35 15,65 Q50,85 10,100 L0,100 Z" style={{ fill: '#FFCDD2', opacity: 0.9 }} />
            <circle cx="15" cy="30" r="12" style={{ fill: '#FFE082', filter: 'blur(10px)', opacity: 0.8 }} />
            <circle cx="25" cy="80" r="20" style={{ fill: '#B2EBF2', filter: 'blur(15px)', opacity: 0.6 }} />
            <circle cx="20" cy="50" r="14" style={{ fill: '#F8BBD0', opacity: 0.9 }} />
          </svg>
        </div>

        <FallingPetals />
      </div>

      {/* Content Layout */}
      <div className="relative z-20 w-full min-h-screen lg:h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 sm:px-8 md:px-24 py-16 lg:py-0">

        {/* Left Typography */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="lg:w-[45%] text-center lg:text-left mb-8 lg:mb-0"
        >
          {/* Floating sway container for title */}
          <motion.div
            animate={{
              y: [0, -5, 0],
              rotate: [0, -0.5, 0.5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.h2
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  }
                }
              }}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] leading-[1.05] mb-4 md:mb-6 drop-shadow-sm select-none flex flex-row justify-center lg:justify-start flex-wrap animate-gradient-text font-bold"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {/* Letters of "MY" */}
              {["M", "Y"].map((letter, index) => (
                <motion.span
                  key={`my-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: -100 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 10 } }
                  }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}

              {/* Space */}
              <span className="inline-block w-[0.25em]">&nbsp;</span>

              {/* Letters of "ALBUM" (italic) */}
              {["A", "L", "B", "U", "M"].map((letter, index) => (
                <motion.span
                  key={`album-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: -100 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 10 } }
                  }}
                  className="inline-block italic"
                >
                  {letter}
                </motion.span>
              ))}
            </motion.h2>
          </motion.div>

          <motion.p
            animate={{
              y: [0, -3, 0],
              x: [0, 1, -1, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="text-2xl sm:text-3xl md:text-4xl max-w-md mx-auto lg:mx-0 font-semibold leading-relaxed select-none font-caveat animate-gradient-text"
          >
            "This project is designed for storing images and videos, with continuous improvements being made to enhance the product."
          </motion.p>
        </motion.div>

        {/* Right Glass Cards Layout */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="lg:w-[52%] flex flex-row flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3 md:gap-6"
        >
          {/* Card 1 — View Video */}
          <motion.div
            onClick={() => navigate('videos')}
            animate={{
              y: [0, -6, 0],
              rotate: [0, -3, 3, -3, 3, 0],
            }}
            transition={{
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }
            }}
            whileHover={{ scale: 1.06, y: -12 }}
            className="w-[95px] h-[135px] sm:w-[110px] sm:h-[155px] md:w-[160px] md:h-[220px] rounded-[1.2rem] sm:rounded-[1.5rem] md:rounded-[2rem] bg-white/40 border border-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(244,143,177,0.15)] flex flex-col items-center justify-center p-2.5 sm:p-3 md:p-4 cursor-pointer hover:bg-white/60 transition-colors duration-300 group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-12 md:h-12 rounded-full border border-[#E57373]/30 flex items-center justify-center mb-1.5 sm:mb-2 md:mb-4 group-hover:scale-110 transition-transform bg-white/50 text-[#E57373]">
              {/* Film/Video icon */}
              <svg width="12" height="12" className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="7" y1="2" x2="7" y2="22" />
                <line x1="17" y1="2" x2="17" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="2" y1="7" x2="7" y2="7" />
                <line x1="2" y1="17" x2="7" y2="17" />
                <line x1="17" y1="7" x2="22" y2="7" />
                <line x1="17" y1="17" x2="22" y2="17" />
              </svg>
            </div>
            <span className="font-cinzel text-[8px] sm:text-[9px] md:text-xs font-semibold uppercase tracking-wider md:tracking-widest text-center animate-gradient-text">View Video</span>
          </motion.div>

          {/* Card 2 — Total Memories (Highlight) */}
          <motion.div
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.04 }}
            className="w-[105px] h-[145px] sm:w-[120px] sm:h-[165px] md:w-[170px] md:h-[240px] rounded-[1.2rem] sm:rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-[#FFF9C4]/60 to-[#FCE4EC]/60 border border-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(244,143,177,0.2)] flex flex-col items-center justify-center p-2.5 sm:p-3 md:p-4 transition-transform duration-300"
          >
            <h3
              className="text-2xl sm:text-3xl md:text-5xl mb-0.5 sm:mb-1 md:mb-3 drop-shadow-sm font-semibold animate-gradient-text"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {totalPhotos + totalVideos}
            </h3>
            <span className="font-cinzel text-[8px] sm:text-[9px] md:text-[11px] font-bold uppercase tracking-wider md:tracking-widest text-center leading-normal md:leading-loose animate-gradient-text">
              Total<br />Memories
            </span>
          </motion.div>

          {/* Card 3 — View Images */}
          <motion.div
            onClick={() => navigate('slideshow')}
            animate={{
              y: [0, -6, 0],
              rotate: [0, 3, -3, 3, -3, 0],
            }}
            transition={{
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              },
              rotate: {
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
                delay: 0.5,
              }
            }}
            whileHover={{ scale: 1.06, y: -12 }}
            className="flex w-[95px] h-[135px] sm:w-[110px] sm:h-[155px] md:w-[160px] md:h-[220px] rounded-[1.2rem] sm:rounded-[1.5rem] md:rounded-[2rem] bg-white/40 border border-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(244,143,177,0.15)] flex-col items-center justify-center p-2.5 sm:p-3 md:p-4 cursor-pointer hover:bg-white/60 transition-colors duration-300 group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-12 md:h-12 rounded-full border border-[#81C784]/30 flex items-center justify-center mb-1.5 sm:mb-2 md:mb-4 group-hover:scale-110 transition-transform bg-white/50 text-[#81C784]">
              {/* Image/Photo icon */}
              <svg width="12" height="12" className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <span className="font-cinzel text-[8px] sm:text-[9px] md:text-xs font-semibold uppercase tracking-wider md:tracking-widest text-center animate-gradient-text">View Images</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
