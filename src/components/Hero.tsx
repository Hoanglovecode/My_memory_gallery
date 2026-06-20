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
    <section className="relative w-full h-screen overflow-hidden bg-[#FDFBF7]">
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
      <div className="relative z-20 w-full h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-8 md:px-24">

        {/* Left Typography */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="lg:w-[45%] text-center lg:text-left mb-12 lg:mb-0"
        >
          <h2
            className="text-5xl md:text-7xl lg:text-[6rem] leading-[1.05] text-[#4A2545] mb-6 drop-shadow-sm"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            MY <span className="italic text-[#E57373]">ALBUM</span>
          </h2>
          <p
            className="text-xl md:text-2xl text-[#5D4037] max-w-md mx-auto lg:mx-0 font-medium leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            "This project is designed for storing images and videos, with continuous improvements being made to enhance the product."
          </p>
        </motion.div>

        {/* Right Glass Cards Layout */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="lg:w-[50%] flex flex-col md:flex-row items-center justify-center lg:justify-end gap-6"
        >
          {/* Card 1 — View Video */}
          <div
            onClick={() => navigate('videos')}
            className="w-[160px] h-[220px] rounded-[2rem] bg-white/40 border border-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(244,143,177,0.15)] flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-white/60 transition-all duration-300 group hover:-translate-y-2"
          >
            <div className="w-12 h-12 rounded-full border border-[#E57373]/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-white/50 text-[#E57373]">
              {/* Film/Video icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
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
            <span className="font-cinzel text-xs text-[#4A2545] font-semibold uppercase tracking-widest text-center">View Video</span>
          </div>

          {/* Card 2 — Total Memories (Highlight) */}
          <div className="w-[170px] h-[240px] rounded-[2rem] bg-gradient-to-br from-[#FFF9C4]/60 to-[#FCE4EC]/60 border border-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(244,143,177,0.2)] flex flex-col items-center justify-center p-4 hover:scale-105 transition-transform duration-300">
            <h3
              className="text-5xl text-[#E57373] mb-3 drop-shadow-sm font-semibold"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {totalPhotos + totalVideos}
            </h3>
            <span className="font-cinzel text-[11px] text-[#4A2545] font-bold uppercase tracking-widest text-center leading-loose">
              Total<br />Memories
            </span>
          </div>

          {/* Card 3 — View Pictures (Hidden on small) */}
          <div
            onClick={() => navigate('slideshow')}
            className="hidden md:flex w-[160px] h-[220px] rounded-[2rem] bg-white/40 border border-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(244,143,177,0.15)] flex-col items-center justify-center p-4 cursor-pointer hover:bg-white/60 transition-all duration-300 group hover:-translate-y-2"
          >
            <div className="w-12 h-12 rounded-full border border-[#81C784]/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-white/50 text-[#81C784]">
              {/* Image/Photo icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <span className="font-cinzel text-xs text-[#4A2545] font-semibold uppercase tracking-widest text-center">View Images</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
