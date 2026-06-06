import { useState, useEffect, useRef } from 'react';
import { Heart, Image as ImageIcon, Mail, Lock, LogOut, Music, Pause, Film } from 'lucide-react';
import type { Photo, Letter, View, Video } from './types';
import Home from './components/Home';
import Slideshow from './components/Slideshow';
import LetterView from './components/LetterView';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import VideoGallery from './components/VideoGallery';
import { API_BASE_URL } from './config';
import BackgroundParticles from './components/BackgroundParticles';
import ChatbotWidget from './components/ChatbotWidget';


export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // App State
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [musicUrl, setMusicUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [musicTitle, setMusicTitle] = useState('SoundHelix-Song-1');
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [creatorFacebook, setCreatorFacebook] = useState('https://www.facebook.com/van.hoang.774744/');
  const [creatorLinkedin, setCreatorLinkedin] = useState('https://www.linkedin.com/in/hoangalgoict/');
  const [creatorYoutube, setCreatorYoutube] = useState('https://www.youtube.com/@Algoict_Official');
  const [creatorGithub, setCreatorGithub] = useState('https://github.com/Hoanglovecode');
  const [chatbotName, setChatbotName] = useState('AI Love Bot');
  const [chatbotWelcomeMessage, setChatbotWelcomeMessage] = useState('Chào em! Anh là trợ lý tình yêu của hai bạn. Hôm nay em muốn trò chuyện gì nào? 💕');
  const [chatbotSystemPrompt, setChatbotSystemPrompt] = useState('');
  const [chatbotApiKey, setChatbotApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load from Backend API on mount
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch photos
        const photosRes = await fetch(`${API_BASE_URL}/photos`);
        if (photosRes.ok) {
          const photosData = await photosRes.json();
          // Backend returns _id instead of id, so we map it
          const mappedPhotos = photosData.map((p: any) => ({
            id: p._id,
            title: p.title,
            description: p.description,
            eventDate: p.eventDate,
            imageUrl: p.imageUrl,
            username: p.username,
            user: p.user
          }));
          setPhotos(mappedPhotos);
        }

        // 2. Fetch videos
        const videosRes = await fetch(`${API_BASE_URL}/videos`);
        if (videosRes.ok) {
          const videosData = await videosRes.json();
          const mappedVideos = videosData.map((v: any) => ({
            id: v._id,
            title: v.title,
            description: v.description,
            eventDate: v.eventDate,
            videoUrl: v.videoUrl,
            username: v.username,
            user: v.user
          }));
          setVideos(mappedVideos);
        }

        // 3. Fetch letters
        const lettersRes = await fetch(`${API_BASE_URL}/letters`);
        if (lettersRes.ok) {
          const lettersData = await lettersRes.json();
          setLetters(lettersData);
        }

        // 3.5. Fetch music and chatbot settings
        const settingsRes = await fetch(`${API_BASE_URL}/settings`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.musicUrl) setMusicUrl(settingsData.musicUrl);
          if (settingsData.musicTitle) setMusicTitle(settingsData.musicTitle);
          if (settingsData.chatbotEnabled !== undefined) setChatbotEnabled(settingsData.chatbotEnabled);
          if (settingsData.chatbotName) setChatbotName(settingsData.chatbotName);
          if (settingsData.chatbotWelcomeMessage) setChatbotWelcomeMessage(settingsData.chatbotWelcomeMessage);
          if (settingsData.chatbotSystemPrompt) setChatbotSystemPrompt(settingsData.chatbotSystemPrompt);
          if (settingsData.chatbotApiKey) setChatbotApiKey(settingsData.chatbotApiKey);
          if (settingsData.creatorFacebook) setCreatorFacebook(settingsData.creatorFacebook);
          if (settingsData.creatorLinkedin) setCreatorLinkedin(settingsData.creatorLinkedin);
          if (settingsData.creatorYoutube) setCreatorYoutube(settingsData.creatorYoutube);
          if (settingsData.creatorGithub) setCreatorGithub(settingsData.creatorGithub);
        }

        // 4. Check auth status
        const token = localStorage.getItem('admin_token');
        if (token) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Failed to load data from Backend:", err);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    }
    loadData();
  }, []);

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

  // Autoplay background music with user interaction fallback (due to browser autoplay policies)
  useEffect(() => {
    if (isLoading) return; // Wait until loading screen ends

    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlayingMusic(true);
            removeInteractionListeners();
          })
          .catch(err => {
            console.log("Autoplay blocked by browser policy. Waiting for user interaction to play music.", err);
          });
      }
    };

    const handleFirstInteraction = () => {
      playAudio();
    };

    const removeInteractionListeners = () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    // Attempt to load and play
    if (audioRef.current) {
      audioRef.current.load();
      playAudio();
    }

    // Set fallback listeners for autoplay block
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      removeInteractionListeners();
    };
  }, [isLoading, musicUrl]);

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
    <div className="min-h-screen animated-gradient text-theme-dark font-sans selection:bg-theme-accent2 selection:text-white relative">
      {/* Background Particles */}
      <BackgroundParticles />

      {/* Background Music */}
      <audio ref={audioRef} loop src={musicUrl} />

      {/* Floating Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50 px-6 py-4 flex justify-between items-center bg-white/30 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(242,190,209,0.2)] rounded-full transition-all duration-300">
        <div 
          className="text-2xl font-bold italic cursor-pointer flex items-center gap-2 select-none hover:opacity-85 transition-opacity"
          onClick={() => navigate('home')}
        >
          <Heart className="text-theme-accent2 fill-current animate-pulse" />
          Memories
        </div>
        <div className="flex gap-2 md:gap-4 text-sm md:text-base font-medium items-center">
          <button 
            onClick={() => navigate('slideshow')} 
            className="hover:text-[#8A5B66] hover:bg-white/40 px-3.5 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 hidden md:flex cursor-pointer"
          >
            <ImageIcon size={18}/> Bật Slideshow
          </button>
          <button 
            onClick={() => navigate('videos')} 
            className="hover:text-[#8A5B66] hover:bg-white/40 px-3.5 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 hidden md:flex cursor-pointer"
          >
            <Film size={18}/> Video kỷ niệm
          </button>
          <button 
            onClick={() => navigate('letter')} 
            className="hover:text-[#8A5B66] hover:bg-white/40 px-3.5 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 hidden md:flex cursor-pointer"
          >
            <Mail size={18}/> Thư tình
          </button>
          
          {/* Mobile Nav Icons */}
          <button 
            onClick={() => navigate('slideshow')} 
            className="md:hidden hover:text-theme-accent2 p-2 rounded-full hover:bg-white/40 transition-colors cursor-pointer"
            title="Slideshow"
          >
            <ImageIcon size={20}/>
          </button>
          <button 
            onClick={() => navigate('videos')} 
            className="md:hidden hover:text-theme-accent2 p-2 rounded-full hover:bg-white/40 transition-colors cursor-pointer"
            title="Video kỷ niệm"
          >
            <Film size={20}/>
          </button>
          <button 
            onClick={() => navigate('letter')} 
            className="md:hidden hover:text-theme-accent2 p-2 rounded-full hover:bg-white/40 transition-colors cursor-pointer"
            title="Thư tình"
          >
            <Mail size={20}/>
          </button>

          <div className="w-[1px] h-6 bg-theme-dark/20 mx-1 hidden md:block"></div>

          {isAdmin ? (
            <button 
              onClick={() => { setIsAdmin(false); localStorage.removeItem('admin_token'); localStorage.removeItem('admin_username'); navigate('home'); }} 
              className="text-rose-400 hover:text-rose-600 p-2 md:px-3.5 md:py-2 rounded-full hover:bg-white/40 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={18}/>
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          ) : (
            <button 
              onClick={() => navigate('login')} 
              className="hover:text-theme-accent2 p-2 md:px-3.5 md:py-2 rounded-full hover:bg-white/40 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Quản trị"
            >
              <Lock size={18}/>
              <span className="hidden md:inline">Quản trị</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-28 pb-24 min-h-screen relative">
        {currentView === 'home' && <Home navigate={navigate} photos={photos} />}
        {currentView === 'slideshow' && <Slideshow photos={photos} navigate={navigate} />}
        {currentView === 'videos' && <VideoGallery videos={videos} />}
        {currentView === 'letter' && <LetterView letters={letters} />}
        {currentView === 'login' && <Login setIsAdmin={setIsAdmin} navigate={navigate} />}
        {currentView === 'admin' && isAdmin && (
          <AdminDashboard 
            photos={photos} 
            setPhotos={setPhotos}
            letters={letters} 
            setLetters={setLetters}
            videos={videos}
            setVideos={setVideos}
            musicUrl={musicUrl}
            setMusicUrl={setMusicUrl}
            musicTitle={musicTitle}
            setMusicTitle={setMusicTitle}
            chatbotEnabled={chatbotEnabled}
            setChatbotEnabled={setChatbotEnabled}
            chatbotName={chatbotName}
            setChatbotName={setChatbotName}
            chatbotWelcomeMessage={chatbotWelcomeMessage}
            setChatbotWelcomeMessage={setChatbotWelcomeMessage}
            chatbotSystemPrompt={chatbotSystemPrompt}
            setChatbotSystemPrompt={setChatbotSystemPrompt}
            chatbotApiKey={chatbotApiKey}
            setChatbotApiKey={setChatbotApiKey}
            creatorFacebook={creatorFacebook}
            setCreatorFacebook={setCreatorFacebook}
            creatorLinkedin={creatorLinkedin}
            setCreatorLinkedin={setCreatorLinkedin}
            creatorYoutube={creatorYoutube}
            setCreatorYoutube={setCreatorYoutube}
            creatorGithub={creatorGithub}
            setCreatorGithub={setCreatorGithub}
          />
        )}
      </main>

      {/* Footer with Creator Social Media Links */}
      {currentView !== 'slideshow' && (
        <footer className="w-full bg-white/20 backdrop-blur-md border-t border-white/20 py-10 mt-auto transition-all duration-300">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-base font-serif italic text-[#A7727D] font-bold">
                Dự án kỷ niệm được thiết kế bởi Lê Văn Hoàng ❤️
              </p>
              <p className="text-xs text-[#A7727D]/70 mt-1.5 font-medium">
                © {new Date().getFullYear()} Memories Gallery. All rights reserved.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="text-xs font-serif italic text-[#A7727D]/80 font-bold">Kết nối với Lê Văn Hoàng</span>
              <div className="flex gap-4 items-center">
                {creatorFacebook && (
                  <a 
                    href={creatorFacebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-white/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                    title="Facebook"
                  >
                    <img src="/assets/social/facebook.png" alt="Facebook" className="w-5 h-5 object-contain" />
                  </a>
                )}
                {creatorLinkedin && (
                  <a 
                    href={creatorLinkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-white/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                    title="LinkedIn"
                  >
                    <img src="/assets/social/linkedin.png" alt="LinkedIn" className="w-5 h-5 object-contain" />
                  </a>
                )}
                {creatorYoutube && (
                  <a 
                    href={creatorYoutube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-white/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                    title="YouTube"
                  >
                    <img src="/assets/social/youtube.png" alt="YouTube" className="w-5 h-5 object-contain" />
                  </a>
                )}
                {creatorGithub && (
                  <a 
                    href={creatorGithub} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-white/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                    title="GitHub"
                  >
                    <img src="/assets/social/github.png" alt="GitHub" className="w-5 h-5 object-contain" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* AI Chatbot Widget */}
      {chatbotEnabled && (
        <ChatbotWidget 
          chatbotName={chatbotName} 
          chatbotWelcomeMessage={chatbotWelcomeMessage} 
        />
      )}

      {/* Floating Music Controller */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group">
        <span className="bg-white/90 backdrop-blur-xs text-theme-dark text-xs font-semibold px-3 py-2 rounded-2xl border border-theme-accent1 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none select-none max-w-[200px] truncate translate-x-2 group-hover:translate-x-0">
          🎵 {musicTitle || 'Nhạc nền'}
        </span>
        <button 
          onClick={toggleMusic}
          className="p-4 rounded-full bg-theme-accent2 text-white shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
          title={isPlayingMusic ? `Tạm dừng: ${musicTitle}` : `Phát nhạc: ${musicTitle}`}
        >
          {isPlayingMusic ? <Pause size={24} /> : <Music size={24} />}
        </button>
      </div>
    </div>
  );
}
