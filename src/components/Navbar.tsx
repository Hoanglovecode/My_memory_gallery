import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-8"
    >
      {/* Center Star */}
      <div
        className="text-amber-400 drop-shadow-md cursor-pointer hover:scale-110 transition-transform duration-300"
        onClick={() => { window.location.hash = 'memories'; }}
        title="Enter Memories Gallery"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ fill: 'currentColor' }}>
          <path d="M12 1L14.59 8.41L22 11L14.59 13.59L12 21L9.41 13.59L2 11L9.41 8.41L12 1Z" />
        </svg>
      </div>
    </motion.nav>
  );
}
