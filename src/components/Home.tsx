import { Heart, Image as ImageIcon } from 'lucide-react';
import type { Photo, View } from '../types';

interface HomeProps {
  navigate: (view: View) => void;
  photos: Photo[];
}

export default function Home({ navigate, photos }: HomeProps) {
  // Tính toán góc xoay dựa trên số lượng ảnh
  const totalPhotos = photos.length || 1;
  const theta = 360 / totalPhotos;
  // Tính khoảng cách Z để các ảnh tạo thành một vòng tròn vừa vặn
  const radius = Math.round((250 / 2) / Math.tan(Math.PI / totalPhotos)) + 50;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-fade-in relative overflow-hidden">
      {/* Floating hearts background */}
      <Heart className="absolute top-20 left-10 text-theme-accent1 opacity-50 animate-float" size={40} />
      <Heart className="absolute bottom-20 right-10 text-theme-accent2 opacity-50 animate-float" size={60} style={{ animationDelay: '1s' }} />
      <Heart className="absolute top-1/2 left-1/4 text-theme-dark opacity-20 animate-float" size={30} style={{ animationDelay: '2s' }} />

      <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 text-theme-dark tracking-wider drop-shadow-xs">
        Our Memories
      </h1>
      <p className="text-xl md:text-2xl text-gray-600 mb-16 italic">
        "Every picture tells a story of us."
      </p>
      
      {/* 3D Rotating Carousel */}
      {photos.length > 0 ? (
        <div className="carousel-container mb-24 cursor-pointer" onClick={() => navigate('slideshow')}>
          <div className="carousel-spin">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="carousel-item"
                style={{ transform: `rotateY(${index * theta}deg) translateZ(${radius}px)` }}
              >
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title} 
                  className="w-full h-full object-cover"
                />
                {/* Overlay text */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <p className="font-bold text-lg drop-shadow-md">{photo.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-16 text-xl text-gray-500">Chưa có ảnh nào, hãy thêm trong phần Quản trị.</div>
      )}

      <button 
        onClick={() => navigate('slideshow')}
        className="px-10 py-4 bg-theme-accent2 hover:bg-theme-dark text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center gap-3 z-10 cursor-pointer"
      >
        <ImageIcon size={24} /> Trải Nghiệm Full Màn Hình
      </button>
    </div>
  );
}
