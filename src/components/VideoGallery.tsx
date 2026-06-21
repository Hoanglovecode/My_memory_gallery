import { useState } from 'react';
import { Play, Calendar, Film, X } from 'lucide-react';
import type { Video } from '../types';

interface VideoGalleryProps {
  videos: Video[];
  onPlayVideo: () => void;
  onCloseVideo: () => void;
}

export default function VideoGallery({ videos, onPlayVideo, onCloseVideo }: VideoGalleryProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const handleClose = () => {
    setActiveVideo(null);
    onCloseVideo();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in relative">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-theme-dark mb-4 flex items-center justify-center gap-3">
          <Film className="text-theme-accent2 animate-pulse" size={40} />
          Video Kỷ Niệm
        </h1>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer flex flex-col"
              onClick={() => {
                setActiveVideo(video);
                onPlayVideo();
              }}
            >
              {/* Video Thumbnail (Auto preview from first frame) */}
              <div className="h-56 relative bg-black flex items-center justify-center overflow-hidden">
                <video 
                  src={video.videoUrl} 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                  preload="metadata"
                  muted
                  playsInline
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="text-theme-dark fill-current translate-x-0.5" size={28} />
                  </div>
                </div>

                {/* Date and Owner Tags */}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <div className="bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <Calendar size={12} />
                    {video.eventDate}
                  </div>
                  <div className="bg-[#E6C280]/90 backdrop-blur-xs text-theme-dark px-3 py-1 rounded-full text-xs font-bold">
                    Bởi: {video.username === 'bangaituonglai' ? 'Bạn gái tương lai' : 'Hoàng'}
                  </div>
                </div>
              </div>

              {/* Video Details */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1 group-hover:text-theme-dark transition-colors">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 italic flex-1">
                  {video.description || "Không có mô tả."}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <Film className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">Chưa có video kỷ niệm nào được tải lên.</p>
          <p className="text-gray-400 text-sm mt-1">Hãy đăng nhập trang Quản trị để thêm các thước phim của bạn!</p>
        </div>
      )}

      {/* Fullscreen Video Player Modal */}
      {activeVideo && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          {/* Close button */}
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all hover:scale-110 cursor-pointer"
            title="Đóng video"
          >
            <X size={24} />
          </button>

          {/* Modal Container */}
          <div className="w-full max-w-lg md:max-w-4xl flex flex-col bg-[#111] rounded-3xl overflow-hidden shadow-2xl animate-scale-up border border-white/10 max-h-[90vh]">
            {/* Video Player */}
            <div className="relative bg-black flex items-center justify-center flex-1 min-h-0" style={{ maxHeight: '70vh' }}>
              <video 
                src={activeVideo.videoUrl} 
                className="max-w-full max-h-[70vh] w-auto h-auto object-contain block mx-auto"
                controls
                autoPlay
                playsInline
              />
            </div>

            {/* Video Info Section */}
            <div className="p-6 bg-zinc-900 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                <h2 className="text-2xl font-bold font-serif text-theme-accent1">{activeVideo.title}</h2>
                <div className="flex gap-2">
                  <div className="text-sm text-zinc-400 flex items-center gap-1.5 bg-zinc-800 px-3 py-1 rounded-full w-fit">
                    <Calendar size={14} />
                    {activeVideo.eventDate}
                  </div>
                  <div className="text-sm text-theme-dark font-bold bg-[#E6C280] px-3 py-1 rounded-full w-fit flex items-center">
                    Đăng bởi: {activeVideo.username === 'bangaituonglai' ? 'Bạn gái tương lai' : 'Hoàng'}
                  </div>
                </div>
              </div>
              <p className="text-zinc-300 italic text-sm md:text-base whitespace-pre-wrap">
                {activeVideo.description}
              </p>

              {/* Close Button at the bottom of the card for easy exit */}
              <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <X size={16} /> Thoát / Đóng video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
