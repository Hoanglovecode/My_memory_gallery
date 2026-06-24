import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface NavbarProps {
  onBack?: () => void;
}

export default function Navbar({ onBack }: NavbarProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-8 max-w-7xl mx-auto pointer-events-none"
    >
      {/* Left Back Arrow with Text */}
      {onBack ? (
        <button
          onClick={onBack}
          className="flex-shrink-0 px-5 py-3 sm:px-7 sm:py-4 rounded-full hover:bg-black/5 text-[#A7727D] hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer pointer-events-auto flex items-center gap-2.5 bg-white/50 backdrop-blur-md border border-white/70 shadow-lg font-extrabold text-base sm:text-lg font-serif"
          title="Quay lại Trang chủ"
        >
          <ArrowLeft size={24} className="stroke-[3]" />
          <span>Back</span>
        </button>
      ) : (
        <div className="w-[110px] sm:w-[150px]" />
      )}

      {/* Center Star */}
      <div
        className="text-amber-400 drop-shadow-md cursor-pointer hover:scale-110 transition-transform duration-300 pointer-events-auto flex-shrink-0"
        onClick={() => { window.location.hash = 'memories'; }}
        title="Enter Memories Gallery"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ fill: 'currentColor' }}>
          <path d="M12 1L14.59 8.41L22 11L14.59 13.59L12 21L9.41 13.59L2 11L9.41 8.41L12 1Z" />
        </svg>
      </div>

      <div className="w-[110px] sm:w-[150px] flex-shrink-0" />
    </motion.nav>
  );
}
