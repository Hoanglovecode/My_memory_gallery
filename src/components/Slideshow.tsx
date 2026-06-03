import { useState, useEffect } from 'react';
import type { Photo, View } from '../types';

interface SlideshowProps {
  photos: Photo[];
  navigate: (view: View) => void;
}

export default function Slideshow({ photos, navigate }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Tự động chuyển ảnh liên tục (Auto-play, không có nút điều khiển)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    let progressTimer: ReturnType<typeof setInterval>;
    
    if (photos.length > 0) {
      // Thanh tiến trình chạy mượt
      progressTimer = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 2)); 
      }, 100); // Mỗi 100ms tăng 2% -> Tổng 5 giây

      // Chuyển ảnh sau mỗi 5 giây
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
        setProgress(0);
      }, 5000);
    }
    
    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [photos.length]);

  if (!photos.length) {
    return (
      <div className="text-center mt-20 text-2xl animate-fade-in">
        Chưa có ảnh nào trong Album.
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col justify-center items-center">
      {/* Hiệu ứng chuyển cảnh chéo (Crossfade) bằng cách mount/unmount qua key */}
      <div key={currentPhoto.id} className="absolute inset-0 animate-fade-in overflow-hidden">
        <img 
          src={currentPhoto.imageUrl} 
          alt={currentPhoto.title}
          className="w-full h-full object-contain md:object-cover animate-slow-zoom opacity-85"
        />
        {/* Lớp phủ gradient để đọc chữ rõ hơn */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      </div>

      {/* Thông tin ảnh */}
      <div className="absolute bottom-20 left-0 w-full p-8 text-white z-50 text-center md:text-left md:left-10 md:w-2/3">
        <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg">{currentPhoto.title}</h2>
        <p className="text-2xl md:text-3xl italic mb-3 text-gray-200 drop-shadow-md">{currentPhoto.description}</p>
        <p className="text-lg font-light text-theme-accent2 drop-shadow-md">Nơi tình yêu lưu giữ: {currentPhoto.eventDate}</p>
      </div>

      {/* Thanh tiến trình báo hiệu thời gian chuyển ảnh */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-800 z-50">
        <div 
          className="h-full bg-theme-accent2 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Nút thoát */}
      <button 
        onClick={() => navigate('home')} 
        className="absolute top-8 right-8 text-white hover:text-theme-accent2 z-50 bg-white/10 p-3 rounded-full backdrop-blur-md transition-all hover:scale-110 cursor-pointer"
      >
        Đóng Album
      </button>
    </div>
  );
}
