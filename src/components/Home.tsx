import { useState } from 'react';
import { Image as ImageIcon, X, Heart, Sparkles } from 'lucide-react';
import type { Photo, View } from '../types';
import { optimizeImageUrl } from '../config';

interface HomeProps {
  navigate: (view: View) => void;
  photos: Photo[];
}

export default function Home({ navigate, photos }: HomeProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Phân chia ảnh cho 2 vòng xoay nếu có nhiều hơn 3 ảnh
  const carousel1Photos = photos.length >= 4 
    ? photos.filter((_, idx) => idx % 2 === 0) 
    : photos;
  const carousel2Photos = photos.length >= 4 
    ? photos.filter((_, idx) => idx % 2 !== 0) 
    : photos;

  // Hàm tính toán bán kính Z cho từng Carousel
  const getRadius = (total: number) => {
    return Math.max(120, Math.round((180 / 2) / Math.tan(Math.PI / (total || 1))) + 20);
  };

  const radius1 = getRadius(carousel1Photos.length);
  const theta1 = 360 / (carousel1Photos.length || 1);

  const radius2 = getRadius(carousel2Photos.length);
  const theta2 = 360 / (carousel2Photos.length || 1);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center animate-fade-in relative overflow-x-hidden">
      <h1 className="text-5xl md:text-7xl font-serif font-bold mb-16 text-theme-dark tracking-wider drop-shadow-md">
        Ảnh Kỷ Niệm
      </h1>

      {photos.length > 0 ? (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-32 lg:gap-52 w-full max-w-7xl mb-28 px-4">
          
          {/* Carousel 1 - Chiều kim đồng hồ */}
          <div className="flex flex-col items-center w-full lg:w-1/2">
            <div className="mb-12 flex justify-center hover:scale-110 transition-transform duration-300">
              <div className="w-14 h-14 rounded-full bg-white/60 border border-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(244,143,177,0.15)] flex items-center justify-center">
                <Heart className="w-7 h-7 text-[#E57373] animate-pulse fill-[#E57373]/40" />
              </div>
            </div>
            <div className="carousel-container-compact" onClick={() => navigate('slideshow')}>
              <div className="carousel-spin-cw group">
                {carousel1Photos.map((photo, index) => (
                  <div
                    key={`c1-${photo.id}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn sự kiện click lan ra container cha
                      setSelectedPhoto(photo);
                    }}
                    className="carousel-item-compact border-4 border-[#E6C280]/80 shadow-[0_8px_20px_rgba(167,114,125,0.25)] group-hover:opacity-40 group-hover:blur-[2px] hover:!opacity-100 hover:!blur-none hover:scale-115 hover:z-50 hover:border-[#E6C280] hover:shadow-[0_20px_45px_rgba(167,114,125,0.6)] transition-all duration-500 cursor-pointer"
                    style={{
                      transform: `rotateY(${index * theta1}deg) translateZ(${radius1}px)`
                    }}
                  >
                    <img
                      src={optimizeImageUrl(photo.imageUrl)}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 text-white">
                      <p className="font-bold text-sm drop-shadow-md tracking-wide truncate">{photo.title}</p>
                      <p className="text-[10px] text-white/80 italic mt-0.5">Đăng bởi: {photo.username === 'bangaituonglai' ? 'Bạn gái tương lai' : 'Hoàng'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Carousel 2 - Ngược chiều kim đồng hồ */}
          <div className="flex flex-col items-center w-full lg:w-1/2 mt-16 lg:mt-0">
            <div className="mb-12 flex justify-center hover:scale-110 transition-transform duration-300">
              <div className="w-14 h-14 rounded-full bg-white/60 border border-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(244,143,177,0.15)] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[#E6C280] animate-pulse" />
              </div>
            </div>
            <div className="carousel-container-compact" onClick={() => navigate('slideshow')}>
              <div className="carousel-spin-ccw group">
                {carousel2Photos.map((photo, index) => (
                  <div
                    key={`c2-${photo.id}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn sự kiện click lan ra container cha
                      setSelectedPhoto(photo);
                    }}
                    className="carousel-item-compact border-4 border-[#E6C280]/80 shadow-[0_8px_20px_rgba(167,114,125,0.25)] group-hover:opacity-40 group-hover:blur-[2px] hover:!opacity-100 hover:!blur-none hover:scale-115 hover:z-50 hover:border-[#E6C280] hover:shadow-[0_20px_45px_rgba(167,114,125,0.6)] transition-all duration-500 cursor-pointer"
                    style={{
                      transform: `rotateY(${index * theta2}deg) translateZ(${radius2}px)`
                    }}
                  >
                    <img
                      src={optimizeImageUrl(photo.imageUrl)}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 text-white">
                      <p className="font-bold text-sm drop-shadow-md tracking-wide truncate">{photo.title}</p>
                      <p className="text-[10px] text-white/80 italic mt-0.5">Đăng bởi: {photo.username === 'bangaituonglai' ? 'Bạn gái tương lai' : 'Hoàng'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="mb-16 text-xl text-gray-500">Chưa có ảnh nào, hãy thêm trong phần Quản trị.</div>
      )}

      {/* Nút bấm trải nghiệm Full màn hình */}
      <button
        onClick={() => navigate('slideshow')}
        className="px-12 py-4.5 bg-gradient-to-r from-[#F2BED1] via-[#E6C280] to-[#F2BED1] bg-[length:200%_auto] hover:bg-right text-white rounded-full font-bold text-lg shadow-[0_10px_30px_rgba(242,190,209,0.5)] hover:shadow-[0_15px_35px_rgba(230,194,128,0.6)] transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 flex items-center gap-3.5 z-10 cursor-pointer"
      >
        <ImageIcon size={22} className="animate-pulse" /> Trải Nghiệm Full Màn Hình
      </button>

      {/* Photo Detail Overlay Modal in 9:19.5 Aspect Ratio */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden max-w-[360px] w-full max-h-[95vh] flex flex-col p-4 animate-scale-up relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 z-10 bg-black/55 hover:bg-black/75 text-white p-2 rounded-full transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Image Container with 9:19.5 ratio */}
            <div 
              className="w-full overflow-hidden bg-zinc-950 rounded-2xl shadow-inner border border-black/10 flex items-center justify-center"
              style={{ 
                aspectRatio: '9 / 19.5',
                maxHeight: '60vh',
              }}
            >
              <img 
                src={optimizeImageUrl(selectedPhoto.imageUrl)} 
                alt={selectedPhoto.title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Details */}
            <div className="pt-4 pb-2 text-left">
              <div className="flex flex-wrap gap-2 mb-1.5 items-center">
                <span className="text-[10px] bg-theme-accent2 text-white px-2.5 py-0.5 rounded-full font-serif italic inline-block">
                  {selectedPhoto.eventDate || 'Hôm nay'}
                </span>
                <span className="text-[10px] bg-[#E6C280] text-theme-dark font-semibold px-2.5 py-0.5 rounded-full inline-block">
                  Đăng bởi: {selectedPhoto.username === 'bangaituonglai' ? 'Bạn gái tương lai' : 'Hoàng'}
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-theme-dark line-clamp-1">
                {selectedPhoto.title}
              </h3>
              {selectedPhoto.description && (
                <p className="text-xs text-theme-dark/80 mt-2 whitespace-pre-line leading-relaxed italic font-medium line-clamp-3">
                  "{selectedPhoto.description}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
