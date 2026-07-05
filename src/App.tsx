import { useState, useEffect, useRef } from 'react';
import { Heart, Image as ImageIcon, Lock, LogOut, Music, Pause, ArrowLeft, Eye, Play } from 'lucide-react';
import type { Photo, View, Video } from './types';
import Home from './components/Home';
import Slideshow from './components/Slideshow';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import VideoGallery from './components/VideoGallery';
import { API_BASE_URL } from './config';
import BackgroundParticles from './components/BackgroundParticles';
import ChatbotWidget from './components/ChatbotWidget';

import Hero from './components/Hero';
import Navbar from './components/Navbar';

export default function App() {
  const [currentView, setCurrentView] = useState<View>(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash === '#memories' || search.includes('mode=memories')) {
      return 'home';
    }
    if (hash === '#slideshow' || hash === '#videos' || hash === '#admin' || hash === '#login') {
      return hash.replace('#', '') as View;
    }
    return 'fantasy';
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const [wasPlayingBeforeVideo, setWasPlayingBeforeVideo] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#memories') {
        setCurrentView('home');
      } else if (hash === '#fantasy') {
        setCurrentView('fantasy');
      } else if (hash === '#slideshow' || hash === '#videos' || hash === '#admin' || hash === '#login') {
        setCurrentView(hash.replace('#', '') as View);
      } else {
        setCurrentView('fantasy');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // App State with localStorage cache fallback
  const [photos, setPhotos] = useState<Photo[]>(() => {
    try {
      const cached = localStorage.getItem('cached_photos');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [videos, setVideos] = useState<Video[]>(() => {
    try {
      const cached = localStorage.getItem('cached_videos');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCachedSetting = (key: string, defaultValue: any): any => {
    try {
      const cached = localStorage.getItem('cached_settings');
      if (cached) {
        const parsed = JSON.parse(cached) as Record<string, unknown>;
        if (parsed[key] !== undefined) return parsed[key];
      }
    } catch {
      // ignore
    }
    return defaultValue;
  };

  const [musicUrl, setMusicUrl] = useState<string>(() => getCachedSetting('musicUrl', ''));
  const [musicTitle, setMusicTitle] = useState<string>(() => getCachedSetting('musicTitle', 'Đang tải nhạc...'));
  const [chatbotEnabled, setChatbotEnabled] = useState<boolean>(() => getCachedSetting('chatbotEnabled', true));
  const [creatorFacebook, setCreatorFacebook] = useState<string>(() => getCachedSetting('creatorFacebook', 'https://www.facebook.com/van.hoang.774744/'));
  const [creatorLinkedin, setCreatorLinkedin] = useState<string>(() => getCachedSetting('creatorLinkedin', 'https://www.linkedin.com/in/hoangalgoict/'));
  const [creatorYoutube, setCreatorYoutube] = useState<string>(() => getCachedSetting('creatorYoutube', 'https://www.youtube.com/@Algoict_Official'));
  const [creatorGithub, setCreatorGithub] = useState<string>(() => getCachedSetting('creatorGithub', 'https://github.com/Hoanglovecode'));
  const [creatorTiktok, setCreatorTiktok] = useState<string>(() => getCachedSetting('creatorTiktok', 'https://www.tiktok.com/@hoang_algoict'));
  const [creatorInstagram, setCreatorInstagram] = useState<string>(() => getCachedSetting('creatorInstagram', 'https://www.instagram.com/vhoang2_7/'));
  const [chatbotName, setChatbotName] = useState<string>(() => getCachedSetting('chatbotName', 'AI Assistant'));
  const [chatbotWelcomeMessage, setChatbotWelcomeMessage] = useState<string>(() => getCachedSetting('chatbotWelcomeMessage', 'Chào bạn! Mình là trợ lý ảo. Hôm nay bạn muốn trò chuyện gì nào? ✨'));
  const [chatbotSystemPrompt, setChatbotSystemPrompt] = useState<string>(() => getCachedSetting('chatbotSystemPrompt', ''));
  const [chatbotApiKey, setChatbotApiKey] = useState<string>(() => getCachedSetting('chatbotApiKey', ''));

  // If there's any cached photos, skip the full screen loading screen on start
  const [isLoading, setIsLoading] = useState(() => {
    try {
      const cachedPhotos = localStorage.getItem('cached_photos');
      return !cachedPhotos; // true (show loading screen) only if no cache
    } catch {
      return true;
    }
  });

  // Load from Backend API on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all resources in parallel to optimize loading times
        const [photosRes, videosRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/photos`),
          fetch(`${API_BASE_URL}/videos`),
          fetch(`${API_BASE_URL}/settings`)
        ]);

        // 1. Process photos
        if (photosRes.ok) {
          const photosData = await photosRes.json();
          // Backend returns _id instead of id, so we map it
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedPhotos = (photosData as any[]).map((p: any) => ({
            id: p._id,
            title: p.title,
            description: p.description,
            eventDate: p.eventDate,
            imageUrl: p.imageUrl,
            username: p.username,
            user: p.user
          }));
          setPhotos(mappedPhotos);
          localStorage.setItem('cached_photos', JSON.stringify(mappedPhotos));
        }

        // 2. Process videos
        if (videosRes.ok) {
          const videosData = await videosRes.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedVideos = (videosData as any[]).map((v: any) => ({
            id: v._id,
            title: v.title,
            description: v.description,
            eventDate: v.eventDate,
            videoUrl: v.videoUrl,
            username: v.username,
            user: v.user
          }));
          setVideos(mappedVideos);
          localStorage.setItem('cached_videos', JSON.stringify(mappedVideos));
        }



        // 3.5. Process music and chatbot settings
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
          if (settingsData.creatorTiktok) setCreatorTiktok(settingsData.creatorTiktok);
          if (settingsData.creatorInstagram) setCreatorInstagram(settingsData.creatorInstagram);

          // Create settings copy without large base64 audio data for local storage caching to prevent QuotaExceededError
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const settingsToCache = { ...settingsData } as Record<string, any>;
          if (settingsToCache.musicUrl && settingsToCache.musicUrl.startsWith('data:')) {
            delete settingsToCache.musicUrl;
          }
          try {
            localStorage.setItem('cached_settings', JSON.stringify(settingsToCache));
          } catch (e) {
            console.warn("Failed to cache settings in localStorage:", e);
          }
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
        }, 200);
      }
    }
    loadData();
  }, []);

  const [publicViews, setPublicViews] = useState<number>(() => {
    try {
      const cached = localStorage.getItem('cached_public_views');
      return cached ? parseInt(cached, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [todayUnique, setTodayUnique] = useState<number>(() => {
    try {
      const cached = localStorage.getItem('cached_today_unique');
      return cached ? parseInt(cached, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [todayDate, setTodayDate] = useState<string>(() => {
    try {
      return localStorage.getItem('cached_today_date') || '';
    } catch {
      return '';
    }
  });
  const [showVisitorNotification, setShowVisitorNotification] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('cached_today_unique');
      return cached ? parseInt(cached, 10) > 0 : false;
    } catch {
      return false;
    }
  });

  // Track visitor on mount & load public views
  useEffect(() => {
    const trackVisit = async () => {
      try {
        let referrer = 'Trực tiếp';
        
        // Try reading ref or source query params first (highest accuracy for profile links)
        const urlParams = new URLSearchParams(window.location.search);
        const urlRef = urlParams.get('ref') || urlParams.get('utm_source') || urlParams.get('source');
        
        if (urlRef) {
          if (urlRef.toLowerCase() === 'tiktok') referrer = 'TikTok';
          else if (urlRef.toLowerCase() === 'facebook') referrer = 'Facebook';
          else if (urlRef.toLowerCase() === 'instagram') referrer = 'Instagram';
          else if (urlRef.toLowerCase() === 'youtube') referrer = 'YouTube';
          else referrer = urlRef.charAt(0).toUpperCase() + urlRef.slice(1);
        } else if (document.referrer) {
          try {
            const refUrl = new URL(document.referrer);
            referrer = refUrl.hostname || document.referrer;
            // Clean up common referrers
            if (referrer.includes('facebook.com')) referrer = 'Facebook';
            else if (referrer.includes('instagram.com')) referrer = 'Instagram';
            else if (referrer.includes('google.')) referrer = 'Google';
            else if (referrer.includes('linkedin.com')) referrer = 'LinkedIn';
            else if (referrer.includes('youtube.com')) referrer = 'YouTube';
            else if (referrer.includes('github.com')) referrer = 'GitHub';
            else if (referrer.includes('tiktok.com')) referrer = 'TikTok';
          } catch (e) {
            referrer = document.referrer;
          }
        }

        // Detect iPhone models based on screen resolution and device pixel ratio
        const getIphoneModel = (): string => {
          const ua = navigator.userAgent;
          const isIOS = /iPad|iPhone|iPod/.test(ua) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
          if (!isIOS) return '';

          const width = window.screen.width;
          const height = window.screen.height;
          const ratio = window.devicePixelRatio;
          const portraitWidth = Math.min(width, height);
          const portraitHeight = Math.max(width, height);
          
          const w = portraitWidth * ratio;
          const h = portraitHeight * ratio;

          if (w === 1290 && h === 2796) return 'iPhone 14/15 Pro Max';
          if (w === 1179 && h === 2556) return 'iPhone 14/15 Pro';
          if (w === 1284 && h === 2778) return 'iPhone 12/13/14 Pro Max/Plus';
          if (w === 1170 && h === 2532) return 'iPhone 12/13/14 Pro/Standard';
          if (w === 1080 && h === 2340) return 'iPhone 12/13 mini';
          if (w === 1242 && h === 2688) return 'iPhone XS Max / 11 Pro Max';
          if (w === 828 && h === 1792) return 'iPhone XR / 11';
          if (w === 1125 && h === 2436) return 'iPhone X / XS / 11 Pro';
          if (w === 1242 && h === 2208) return 'iPhone 6s/7/8 Plus';
          if (w === 750 && h === 1334) return 'iPhone 6/7/8 / SE (2/3)';
          if (w === 640 && h === 1136) return 'iPhone 5/5s/SE (1)';
          
          return 'iPhone';
        };

        const iphoneModel = getIphoneModel();
        const clientOs = iphoneModel ? `iOS (${iphoneModel})` : undefined;

        // If already tracked in session, just fetch the views
        if (sessionStorage.getItem('tracked_visit')) {
          const res = await fetch(`${API_BASE_URL}/analytics/public-views`);
          if (res.ok) {
            const data = await res.json();
            setPublicViews(data.totalViews);
            setTodayUnique(data.todayUnique || 0);
            setTodayDate(data.todayDate || '');
            
            localStorage.setItem('cached_public_views', String(data.totalViews));
            localStorage.setItem('cached_today_unique', String(data.todayUnique || 0));
            localStorage.setItem('cached_today_date', data.todayDate || '');
            setShowVisitorNotification(true);
          }
          return;
        }

        const res = await fetch(`${API_BASE_URL}/analytics/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            page: window.location.pathname || '/',
            referrer,
            clientOs
          })
        });
        if (res.ok) {
          const data = await res.json();
          setPublicViews(data.totalViews);
          setTodayUnique(data.todayUnique || 0);
          setTodayDate(data.todayDate || '');

          localStorage.setItem('cached_public_views', String(data.totalViews));
          localStorage.setItem('cached_today_unique', String(data.todayUnique || 0));
          localStorage.setItem('cached_today_date', data.todayDate || '');
          setShowVisitorNotification(true);
          sessionStorage.setItem('tracked_visit', 'true');
        }
      } catch (err) {
        console.warn('Failed to handle visitor analytics:', err);
      }
    };
    trackVisit();
  }, []);

  // Auto-close visitor notification after 8 seconds
  useEffect(() => {
    if (showVisitorNotification && todayUnique > 0) {
      const timer = setTimeout(() => {
        setShowVisitorNotification(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showVisitorNotification, todayUnique]);


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

  const handlePlayVideo = () => {
    if (isPlayingMusic) {
      setWasPlayingBeforeVideo(true);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingMusic(false);
    }
  };

  const handleCloseVideo = () => {
    if (wasPlayingBeforeVideo) {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Failed to resume music:", e));
      }
      setIsPlayingMusic(true);
      setWasPlayingBeforeVideo(false);
    }
  };

  // Autoplay background music with user interaction fallback (due to browser autoplay policies)
  useEffect(() => {
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
  }, [musicUrl]);

  const navigate = (view: View) => {
    if (view === 'fantasy') {
      window.location.hash = 'fantasy';
    } else if (view === 'home') {
      window.location.hash = 'memories';
    } else {
      window.location.hash = view;
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Persistent Background Music */}
      <audio ref={audioRef} loop src={musicUrl} />

      {isLoading && currentView !== 'fantasy' && (
        <div className="fixed inset-0 bg-theme-main flex flex-col items-center justify-center z-[9999]">
          <Heart className="text-theme-accent2 fill-current animate-pulse mb-4 text-[#F2BED1]" size={80} />
          <p className="text-xl font-serif italic text-theme-dark animate-bounce">Đang tải những kỷ niệm tuyệt vời...</p>
        </div>
      )}

      {/* Visitor Stats Toast Notification */}
      {showVisitorNotification && todayUnique > 0 && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-lg md:max-w-xl bg-white/95 backdrop-blur-lg border border-[#FCE4EC] shadow-[0_15px_40px_rgba(242,190,209,0.35)] rounded-[2rem] p-5 md:p-6 flex items-center gap-4.5 animate-scale-up transition-all duration-500 hover:shadow-[0_20px_50px_rgba(242,190,209,0.45)]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFF9C4] to-[#FCE4EC] flex items-center justify-center text-3xl shadow-inner flex-shrink-0 animate-bounce">
            🎉
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest font-serif">Thống kê ngày {todayDate}</p>
            <p className="text-base md:text-lg font-semibold text-theme-dark mt-1 leading-relaxed">
              Hôm nay có tổng cộng <strong className="text-[#E57373] font-extrabold text-lg md:text-xl drop-shadow-sm">{todayUnique} khách mới</strong> truy cập trang web!
            </p>
          </div>
          <button 
            onClick={() => setShowVisitorNotification(false)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full cursor-pointer transition-colors duration-200 text-sm flex items-center justify-center w-8 h-8"
            title="Đóng"
          >
            ✕
          </button>
        </div>
      )}

      {currentView === 'fantasy' ? (
        <div className="relative w-full h-screen overflow-y-auto bg-[#FDFBF7] flex flex-col justify-between scroll-smooth selection:bg-theme-accent2 selection:text-white">
          <Navbar onBack={() => navigate('fantasy')} />
          
          {/* Hero Section */}
          <div className="relative w-full min-h-screen lg:h-screen flex-shrink-0">
            <Hero navigate={navigate} totalPhotos={photos.length} totalVideos={videos.length} />
          </div>

          {/* Footer with Creator Social Media Links */}
          <footer className="w-full bg-white/20 backdrop-blur-md border-t border-white/20 pt-10 pb-28 md:py-10 mt-auto transition-all duration-300 z-20">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-base font-serif italic text-[#A7727D] font-bold">
                  Dự án được thiết kế bởi Lê Văn Hoàng ✨
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
                  {creatorTiktok && (
                    <a
                      href={creatorTiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-white/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                      title="TikTok"
                    >
                      <img src="/assets/social/tiktok.png" alt="TikTok" className="w-5 h-5 object-contain" />
                    </a>
                  )}
                  {creatorInstagram && (
                    <a
                      href={creatorInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-white/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                      title="Instagram"
                    >
                      <img src="/assets/social/instagram.png" alt="Instagram" className="w-5 h-5 object-contain" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </footer>

          {/* AI Chatbot Widget */}
          {chatbotEnabled && (
            <ChatbotWidget
              chatbotName={chatbotName}
              chatbotWelcomeMessage={chatbotWelcomeMessage}
            />
          )}

          {/* Floating Views Counter */}
          <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 group pointer-events-none">
            <div 
              className="p-4 rounded-full bg-white/40 border border-white/60 backdrop-blur-md text-theme-dark shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer animate-fade-in pointer-events-auto"
              title={`Tổng lượt xem: ${publicViews}`}
            >
              <Eye size={20} className="text-theme-accent2 animate-pulse" />
              <span className="text-xs font-bold font-serif">{publicViews}</span>
            </div>
            <span className="hidden md:inline-block bg-white/90 backdrop-blur-xs text-theme-dark text-xs font-semibold px-3 py-2 rounded-2xl border border-theme-accent1 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none select-none translate-x-[-2px] group-hover:translate-x-0 whitespace-nowrap">
              Lượt xem trang
            </span>
          </div>

          {/* Floating Music Controller */}
          <div className="fixed bottom-6 left-28 md:left-auto md:right-6 z-50 flex items-center gap-2 group pointer-events-none">
            <span className="hidden md:inline-block bg-white/90 backdrop-blur-xs text-theme-dark text-xs font-semibold px-3 py-2 rounded-2xl border border-theme-accent1 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none select-none max-w-[200px] truncate translate-x-2 group-hover:translate-x-0">
              🎵 {musicTitle || 'Nhạc nền'}
            </span>
            <button
              onClick={toggleMusic}
              className="p-4 rounded-full bg-theme-accent2 text-white shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center pointer-events-auto"
              title={isPlayingMusic ? `Tạm dừng: ${musicTitle}` : `Phát nhạc: ${musicTitle}`}
            >
              {isPlayingMusic ? <Pause size={24} /> : <Music size={24} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen animated-gradient text-theme-dark font-sans selection:bg-theme-accent2 selection:text-white relative">
          {/* Background Particles */}
          <BackgroundParticles />

          {/* Floating Navigation */}
          {/* Floating Navigation */}
          <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50 px-3 py-2.5 md:px-6 md:py-4 flex justify-between items-center bg-white/30 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(242,190,209,0.2)] rounded-full transition-all duration-300">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => navigate('fantasy')}
                className="hover:text-theme-accent2 p-1 md:p-1.5 rounded-full hover:bg-white/40 transition-colors cursor-pointer flex items-center justify-center text-theme-dark"
                title="Quay lại Album"
              >
                <ArrowLeft size={16} className="md:w-5 md:h-5" />
              </button>
              <div
                className="text-lg sm:text-xl md:text-2xl font-bold italic cursor-pointer flex items-center gap-1.5 md:gap-2 select-none"
                onClick={() => navigate('home')}
              >
                <Heart className="text-theme-accent2 fill-current animate-pulse w-[18px] h-[18px] md:w-6 md:h-6" />
                <span className="leading-none hidden sm:inline animate-gradient-text">Memories</span>
              </div>
            </div>
            <div className="flex gap-1.5 md:gap-3 text-[13px] sm:text-[14px] md:text-base font-bold items-center">
              <button
                onClick={() => navigate('slideshow')}
                className="bg-white/40 border border-white/40 shadow-[0_2px_8px_rgba(167,114,125,0.06)] text-theme-dark/90 hover:bg-white/85 hover:border-white/85 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(229,115,115,0.15)] active:translate-y-0 active:shadow-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-1.5 cursor-pointer"
                title="Ảnh kỷ niệm"
              >
                <ImageIcon size={17} className="md:w-[19px] md:h-[19px] text-[#E57373]" />
                <span className="animate-gradient-text">Ảnh</span>
              </button>
              <button
                onClick={() => navigate('videos')}
                className="bg-white/40 border border-white/40 shadow-[0_2px_8px_rgba(167,114,125,0.06)] text-theme-dark/90 hover:bg-white/85 hover:border-white/85 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(229,115,115,0.15)] active:translate-y-0 active:shadow-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-1.5 cursor-pointer"
                title="Video kỷ niệm"
              >
                <Play size={17} className="md:w-[19px] md:h-[19px] text-[#E57373] fill-current" />
                <span className="animate-gradient-text">Video</span>
              </button>

              <div className="w-[1px] h-5 bg-theme-dark/20 mx-0.5 md:mx-1"></div>

              {isAdmin ? (
                <button
                  onClick={() => { setIsAdmin(false); localStorage.removeItem('admin_token'); localStorage.removeItem('admin_username'); navigate('home'); }}
                  className="bg-white/40 border border-rose-100 shadow-[0_2px_8px_rgba(244,63,94,0.06)] text-rose-500 hover:text-rose-700 hover:bg-rose-50/80 hover:border-rose-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(244,63,94,0.15)] active:translate-y-0 active:shadow-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-1.5 cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut size={17} className="md:w-[19px] md:h-[19px]" />
                  <span className="animate-gradient-text text-rose-500">Thoát</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('login')}
                  className="bg-white/40 border border-white/40 shadow-[0_2px_8px_rgba(167,114,125,0.06)] text-theme-dark/90 hover:bg-white/80 hover:border-white/80 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(229,115,115,0.15)] active:translate-y-0 active:shadow-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-1.5 cursor-pointer"
                  title="Quản trị"
                >
                  <Lock size={17} className="md:w-[19px] md:h-[19px]" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="pt-28 pb-24 min-h-screen relative">
            {currentView === 'home' && <Home navigate={navigate} photos={photos} />}
            {currentView === 'slideshow' && <Slideshow photos={photos} navigate={navigate} />}
            {currentView === 'videos' && (
              <VideoGallery
                videos={videos}
                onPlayVideo={handlePlayVideo}
                onCloseVideo={handleCloseVideo}
              />
            )}

            {currentView === 'login' && <Login setIsAdmin={setIsAdmin} navigate={navigate} />}
            {currentView === 'admin' && isAdmin && (
              <AdminDashboard
                photos={photos}
                setPhotos={setPhotos}

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
                creatorTiktok={creatorTiktok}
                setCreatorTiktok={setCreatorTiktok}
                creatorInstagram={creatorInstagram}
                setCreatorInstagram={setCreatorInstagram}
              />
            )}
          </main>

          {/* Footer with Creator Social Media Links */}
          {currentView !== 'slideshow' && (
            <footer className="w-full bg-white/20 backdrop-blur-md border-t border-white/20 pt-10 pb-28 md:py-10 mt-auto transition-all duration-300">
              <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-base font-serif italic text-[#A7727D] font-bold">
                    Dự án được thiết kế bởi Lê Văn Hoàng ✨
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
                    {creatorTiktok && (
                      <a
                        href={creatorTiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-white/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                        title="TikTok"
                      >
                        <img src="/assets/social/tiktok.png" alt="TikTok" className="w-5 h-5 object-contain" />
                      </a>
                    )}
                    {creatorInstagram && (
                      <a
                        href={creatorInstagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-white/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                        title="Instagram"
                      >
                        <img src="/assets/social/instagram.png" alt="Instagram" className="w-5 h-5 object-contain" />
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

          {/* Floating Views Counter */}
          <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 group pointer-events-none">
            <div 
              className="p-4 rounded-full bg-white/40 border border-white/60 backdrop-blur-md text-theme-dark shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer animate-fade-in pointer-events-auto"
              title={`Tổng lượt xem: ${publicViews}`}
            >
              <Eye size={20} className="text-theme-accent2 animate-pulse" />
              <span className="text-xs font-bold font-serif">{publicViews}</span>
            </div>
            <span className="hidden md:inline-block bg-white/90 backdrop-blur-xs text-theme-dark text-xs font-semibold px-3 py-2 rounded-2xl border border-theme-accent1 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none select-none translate-x-[-2px] group-hover:translate-x-0 whitespace-nowrap">
              Lượt xem trang
            </span>
          </div>

          {/* Floating Music Controller */}
          <div className="fixed bottom-6 left-28 md:left-auto md:right-6 z-50 flex items-center gap-2 group pointer-events-none">
            <span className="hidden md:inline-block bg-white/90 backdrop-blur-xs text-theme-dark text-xs font-semibold px-3 py-2 rounded-2xl border border-theme-accent1 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none select-none max-w-[200px] truncate translate-x-2 group-hover:translate-x-0">
              🎵 {musicTitle || 'Nhạc nền'}
            </span>
            <button
              onClick={toggleMusic}
              className="p-4 rounded-full bg-theme-accent2 text-white shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center pointer-events-auto"
              title={isPlayingMusic ? `Tạm dừng: ${musicTitle}` : `Phát nhạc: ${musicTitle}`}
            >
              {isPlayingMusic ? <Pause size={24} /> : <Music size={24} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
