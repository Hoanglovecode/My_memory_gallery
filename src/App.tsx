import { useState, useEffect, useRef } from 'react';
import { Heart, Image as ImageIcon, Mail, Lock, LogOut, Music, Pause, Film } from 'lucide-react';
import type { Photo, Letter, View, Video } from './types';
import Home from './components/Home';
import Slideshow from './components/Slideshow';
import LetterView from './components/LetterView';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import VideoGallery from './components/VideoGallery';
import { setItem, getItem, STORE_PHOTOS, STORE_VIDEOS } from './services/db';

// --- MOCK DATA ---
const initialPhotos: Photo[] = [
  { id: 1, title: 'Lần đầu gặp gỡ', description: 'Ngày ánh mắt ta chạm nhau...', eventDate: '14-02-2024', imageUrl: 'https://images.unsplash.com/photo-1518199268815-95a206b4a532?q=80&w=2068&auto=format&fit=crop' },
  { id: 2, title: 'Chuyến đi Đà Lạt', description: 'Cùng nhau đón bình minh trên đồi chè', eventDate: '20-05-2024', imageUrl: 'https://images.unsplash.com/photo-1520699049698-acd2fce18736?q=80&w=2070&auto=format&fit=crop' },
  { id: 3, title: 'Kỷ niệm 1 năm', description: 'Bữa tối lãng mạn bên ánh nến', eventDate: '14-02-2025', imageUrl: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=2071&auto=format&fit=crop' },
  { id: 4, title: 'Bình yên', description: 'Chỉ cần có nhau là đủ', eventDate: '08-03-2025', imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2000&auto=format&fit=crop' }
];

const initialLetter: Letter = {
  title: 'Dear My Love,',
  content: 'Cảm ơn em đã xuất hiện trong cuộc đời anh. Mỗi khoảnh khắc bên em đều là một món quà vô giá. Dù tương lai có ra sao, anh vẫn muốn nắm tay em đi qua mọi giông bão. Yêu em vô cùng! ❤️'
};

const initialVideos: Video[] = [
  { id: 1, title: 'Kỷ niệm hoàng hôn Đà Lạt', description: 'Chiều hoàng hôn rực rỡ, ta nắm tay nhau ngắm mây trôi.', eventDate: '21-05-2024', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-a-lake-with-clouds-43184-large.mp4' },
  { id: 2, title: 'Ngày cùng dạo phố', description: 'Những bước chân nhỏ, tiếng cười giòn tan dưới nắng mai.', eventDate: '12-10-2024', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-couple-walking-in-a-forest-42862-large.mp4' }
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // App State
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [letter, setLetter] = useState<Letter>(initialLetter);
  const [isLoading, setIsLoading] = useState(true);

  // Load from IndexedDB & LocalStorage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const savedPhotos = await getItem(STORE_PHOTOS, 'photos_key');
        if (savedPhotos) setPhotos(savedPhotos);

        const savedVideos = await getItem(STORE_VIDEOS, 'videos_key');
        if (savedVideos) setVideos(savedVideos);

        const savedLetter = localStorage.getItem('memory_gallery_letter');
        if (savedLetter) setLetter(JSON.parse(savedLetter));
      } catch (err) {
        console.error("Failed to load data from IndexedDB:", err);
      } finally {
        // Delay slightly for smooth transition
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    }
    loadData();
  }, []);

  // Sync to IndexedDB / localStorage
  useEffect(() => {
    if (isLoading) return;
    setItem(STORE_PHOTOS, 'photos_key', photos).catch(err => console.error(err));
  }, [photos, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    setItem(STORE_VIDEOS, 'videos_key', videos).catch(err => console.error(err));
  }, [videos, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    localStorage.setItem('memory_gallery_letter', JSON.stringify(letter));
  }, [letter, isLoading]);

  // Music toggle
  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (isPlayingMusic) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Auto-play blocked:", e));
    }
    setIsPlayingMusic(!isPlayingMusic);
  };

  const navigate = (view: View) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-theme-main flex flex-col items-center justify-center z-[9999]">
        <Heart className="text-theme-accent2 fill-current animate-pulse mb-4 text-[#F2BED1]" size={80} />
        <p className="text-xl font-serif italic text-theme-dark animate-bounce">Đang tải những kỷ niệm ngọt ngào...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-main text-theme-dark font-sans selection:bg-theme-accent2 selection:text-white">
      {/* Background Music */}
      <audio ref={audioRef} loop>
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
      </audio>

      {/* Floating Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-4 flex justify-between items-center bg-theme-main/80 backdrop-blur-md shadow-sm border-b border-theme-accent1/30">
        <div 
          className="text-2xl font-bold italic cursor-pointer flex items-center gap-2 select-none"
          onClick={() => navigate('home')}
        >
          <Heart className="text-theme-accent2 fill-current animate-pulse" />
          Memories
        </div>
        <div className="flex gap-4 md:gap-6 text-sm md:text-base font-medium">
          <button 
            onClick={() => navigate('slideshow')} 
            className="hover:text-theme-accent2 transition-colors flex items-center gap-1 hidden md:flex cursor-pointer"
          >
            <ImageIcon size={18}/> Bật Slideshow
          </button>
          <button 
            onClick={() => navigate('videos')} 
            className="hover:text-theme-accent2 transition-colors flex items-center gap-1 hidden md:flex cursor-pointer"
          >
            <Film size={18}/> Video kỷ niệm
          </button>
          <button 
            onClick={() => navigate('letter')} 
            className="hover:text-theme-accent2 transition-colors flex items-center gap-1 hidden md:flex cursor-pointer"
          >
            <Mail size={18}/> Thư tình
          </button>
          
          {/* Mobile Nav Icons */}
          <button 
            onClick={() => navigate('slideshow')} 
            className="md:hidden hover:text-theme-accent2 cursor-pointer"
            title="Slideshow"
          >
            <ImageIcon size={20}/>
          </button>
          <button 
            onClick={() => navigate('videos')} 
            className="md:hidden hover:text-theme-accent2 cursor-pointer"
            title="Video kỷ niệm"
          >
            <Film size={20}/>
          </button>
          <button 
            onClick={() => navigate('letter')} 
            className="md:hidden hover:text-theme-accent2 cursor-pointer"
            title="Thư tình"
          >
            <Mail size={20}/>
          </button>

          {isAdmin ? (
            <button 
              onClick={() => { setIsAdmin(false); navigate('home'); }} 
              className="text-rose-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={18}/>
            </button>
          ) : (
            <button 
              onClick={() => navigate('login')} 
              className="hover:text-theme-accent2 flex items-center gap-1 cursor-pointer"
              title="Quản trị"
            >
              <Lock size={18}/>
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 pb-24 min-h-screen">
        {currentView === 'home' && <Home navigate={navigate} photos={photos} />}
        {currentView === 'slideshow' && <Slideshow photos={photos} navigate={navigate} />}
        {currentView === 'videos' && <VideoGallery videos={videos} />}
        {currentView === 'letter' && <LetterView letter={letter} />}
        {currentView === 'login' && <Login setIsAdmin={setIsAdmin} navigate={navigate} />}
        {currentView === 'admin' && isAdmin && (
          <AdminDashboard 
            photos={photos} 
            setPhotos={setPhotos}
            letter={letter} 
            setLetter={setLetter}
            videos={videos}
            setVideos={setVideos}
          />
        )}
      </main>

      {/* Floating Music Controller */}
      <button 
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-theme-accent2 text-white shadow-lg hover:scale-110 transition-transform z-50 flex items-center gap-2 cursor-pointer"
        title={isPlayingMusic ? "Tạm dừng nhạc" : "Phát nhạc"}
      >
        {isPlayingMusic ? <Pause size={24} /> : <Music size={24} />}
      </button>
    </div>
  );
}
