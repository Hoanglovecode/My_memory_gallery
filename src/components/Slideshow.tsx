import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Photo, View } from '../types';

interface SlideshowProps {
  photos: Photo[];
  navigate: (view: View) => void;
}

export default function Slideshow({ photos, navigate }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Tự động chuyển ảnh liên tục (Auto-play) và tự động reset khi chuyển ảnh thủ công
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    let progressTimer: ReturnType<typeof setInterval>;
    
    if (photos.length > 0) {
      setProgress(0); // Reset thanh tiến trình về 0 mỗi khi đổi ảnh

      // Cập nhật thanh tiến trình chạy mượt (mỗi 100ms tăng 2% -> Đủ 100% trong 5 giây)
      progressTimer = setInterval(() => {
        setProgress(p => (p >= 100 ? 100 : p + 2)); 
      }, 100);

      // Chuyển sang ảnh tiếp theo sau 5 giây
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, 5000);
    }
    
    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [currentIndex, photos.length]);

  if (!photos.length) {
    return (
      <div className="text-center mt-20 text-2xl animate-fade-in">
        Chưa có ảnh nào trong Album.
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col justify-center items-center select-none">
      {/* Hiệu ứng chuyển cảnh (Crossfade) */}
      <div key={currentPhoto.id} className="absolute inset-0 animate-fade-in overflow-hidden">
        <img 
          src={currentPhoto.imageUrl} 
          alt={currentPhoto.title}
          className="w-full h-full object-contain md:object-cover animate-slow-zoom opacity-85"
        />
        {/* Lớp phủ gradient để đọc chữ rõ hơn */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
      </div>

      {/* Nút Quay lại (Prev) */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/75 hover:text-white bg-black/40 hover:bg-black/60 p-3.5 md:p-5 rounded-full backdrop-blur-xs transition-all hover:scale-110 cursor-pointer z-50 border border-white/10 shadow-lg flex items-center justify-center"
        title="Ảnh trước"
      >
        <ChevronLeft size={24} className="md:w-7 md:h-7" />
      </button>

      {/* Nút Tiếp tục (Next) */}
      <button 
        onClick={handleNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/75 hover:text-white bg-black/40 hover:bg-black/60 p-3.5 md:p-5 rounded-full backdrop-blur-xs transition-all hover:scale-110 cursor-pointer z-50 border border-white/10 shadow-lg flex items-center justify-center"
        title="Ảnh sau"
      >
        <ChevronRight size={24} className="md:w-7 md:h-7" />
      </button>

      {/* Thông tin ảnh */}
      <div className="absolute bottom-20 left-0 w-full p-8 text-white z-40 text-center md:text-left md:left-12 md:w-2/3">
        <h2 className="text-3xl md:text-5xl font-serif font-bold mb-3.5 drop-shadow-lg leading-tight">{currentPhoto.title}</h2>
        {currentPhoto.description && (
          <p className="text-xl md:text-2xl italic mb-3 text-gray-200 drop-shadow-md font-medium">"{currentPhoto.description}"</p>
        )}
        <p className="text-sm font-light text-theme-accent2 drop-shadow-md">Nơi tình yêu lưu giữ: {currentPhoto.eventDate} | Đăng bởi: {currentPhoto.username === 'hoangngoclan' ? 'Lan' : 'Hoàng'}</p>
      </div>

      {/* Thanh tiến trình báo hiệu thời gian chuyển ảnh */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-800/80 z-40">
        <div 
          className="h-full bg-theme-accent2 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Nút thoát */}
      <button 
        onClick={() => navigate('home')} 
        className="absolute top-8 right-8 text-white/80 hover:text-white z-50 bg-black/30 hover:bg-black/50 px-4 py-2.5 rounded-full backdrop-blur-xs transition-all hover:scale-105 cursor-pointer border border-white/10 flex items-center gap-1.5 font-medium text-sm shadow-md"
        title="Đóng Album"
      >
        <X size={16} />
        <span>Đóng</span>
      </button>
    </div>
  );
}
