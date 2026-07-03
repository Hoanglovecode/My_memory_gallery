import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';

interface CamelVoiceAIProps {
  onSpeakStateChange: (isSpeaking: boolean) => void;
  chatbotWelcomeMessage?: string;
}

export default function CamelVoiceAI({ onSpeakStateChange, chatbotWelcomeMessage }: CamelVoiceAIProps) {
  const [isListening, setIsListening]     = useState(false);
  const [isSpeaking, setIsSpeaking]       = useState(false);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [hasGreeted, setHasGreeted]       = useState(false);
  const [sessionId, setSessionId]         = useState<string>('');
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [aiReply, setAiReply]             = useState<string>('');

  const continuousRef    = useRef(false);
  const isSpeakingRef    = useRef(false);
  const isProcessingRef  = useRef(false);
  const recognitionRef   = useRef<any>(null);
  const currentAudioRef  = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);

  const handleUserSpeakRef = useRef<(text: string) => void>(() => {});

  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const cleanupAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    onSpeakStateChange(false);
  }, [onSpeakStateChange]);

  const resumeListeningIfNeeded = useCallback(() => {
    if (continuousRef.current) {
      setTimeout(() => {
        try { recognitionRef.current?.start(); setIsListening(true); }
        catch (e) { console.error('[VoiceAI] Restart mic failed:', e); }
      }, 400);
    }
  }, []);

  // ── handleUserSpeak ──────────────────────────────────────────────────────
  const handleUserSpeak = useCallback(async (text: string) => {
    setIsListening(false);
    if (!text.trim()) return;

    // Dừng audio đang phát nếu user nói đè (kèm dọn dẹp bộ nhớ)
    cleanupAudio();

    setIsProcessing(true);
    isProcessingRef.current = true;

    try {
      const sid = localStorage.getItem('chatbot_session_id') || sessionId;
      const response = await fetch(`http://localhost:8000/voice/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sid })
      });

      console.log(`[VoiceAI] fetch status: ${response.status}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Lấy text reply từ header để hiển thị UI
      let replyText = response.headers.get('X-Reply-Text') || '';
      try { replyText = decodeURIComponent(replyText); } catch {}
      if (replyText) {
        console.log(`[VoiceAI] Header X-Reply-Text:`, replyText);
        setAiReply(replyText);
      }

      // Phát audio stream
      const audioBlob = await response.blob();
      console.log(`[VoiceAI] Audio blob received. Size: ${audioBlob.size} bytes, Type: ${audioBlob.type}`);
      
      const audioUrl  = URL.createObjectURL(audioBlob);
      currentAudioUrlRef.current = audioUrl; // Lưu để revoke sau này

      const audio     = new Audio(audioUrl);
      currentAudioRef.current = audio;

      setIsSpeaking(true);
      isSpeakingRef.current = true;
      onSpeakStateChange(true);

      audio.onloadeddata = () => console.log(`[VoiceAI] Audio loaded data.`);
      audio.oncanplay = () => console.log(`[VoiceAI] Audio can play.`);

      audio.onended = () => {
        console.log(`[VoiceAI] Audio ended.`);
        cleanupAudio();
        resumeListeningIfNeeded();
      };

      audio.onerror = (e) => {
        console.error(`[VoiceAI] Audio playback error:`, e);
        cleanupAudio();
        resumeListeningIfNeeded(); // Phải resume mic nếu lỗi audio
      };

      try {
        await audio.play();
        console.log(`[VoiceAI] Audio playing successfully.`);
      } catch (playErr: any) {
        if (playErr.name === 'NotAllowedError') {
          console.warn('[VoiceAI] Autoplay blocked, retrying after 100ms...');
          setTimeout(() => audio.play().catch((e) => {
            console.error(e);
            cleanupAudio();
            resumeListeningIfNeeded(); // Resume nếu vẫn bị lỗi Autoplay
          }), 100);
        } else {
          console.error('[VoiceAI] Play exception:', playErr);
          cleanupAudio();
          resumeListeningIfNeeded(); // Resume nếu play văng lỗi khác
        }
      }

    } catch (err) {
      console.error('[VoiceAI] fetch error:', err);
      cleanupAudio();
      resumeListeningIfNeeded(); // Quan trọng: Rớt mạng vẫn phải bật lại mic
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  }, [sessionId, onSpeakStateChange, cleanupAudio, resumeListeningIfNeeded]);

  // ✅ Luôn cập nhật ref khi hàm thay đổi
  useEffect(() => {
    handleUserSpeakRef.current = handleUserSpeak;
  }, [handleUserSpeak]);

  // ── Init Speech Recognition ──────────────────────────────────────────────
  useEffect(() => {
    let sid = localStorage.getItem('chatbot_session_id');
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chatbot_session_id', sid);
    }
    setSessionId(sid);

    const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    if (!supported) { setIsSpeechSupported(false); return; }

    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous      = false;
      rec.interimResults  = false;
      rec.lang            = 'vi-VN';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserTranscript(transcript);
        setAiReply('');
        // ✅ Gọi qua ref — luôn là hàm mới nhất, không bao giờ stale
        handleUserSpeakRef.current(transcript);
      };

      rec.onerror = (event: any) => {
        console.error('[STT] error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        // Trong trường hợp rớt diện rộng hoặc tự động ngắt
        setTimeout(() => {
          if (continuousRef.current && !isProcessingRef.current && !isSpeakingRef.current) {
            try { rec.start(); setIsListening(true); } catch {}
          }
        }, 300);
      };

      recognitionRef.current = rec;
      setIsSpeechSupported(true);
    } catch (err) {
      console.error('[STT] init failed:', err);
      setIsSpeechSupported(false);
    }
  }, []);

  // ── Auto Greeting ────────────────────────────────────────────────────────
  useEffect(() => {
    const greet = () => {
      if (!hasGreeted && isSpeechSupported) {
        setHasGreeted(true);
        const msg = chatbotWelcomeMessage || "Chào bạn! Tớ là trợ lý của Memories. Bạn muốn nói chuyện gì nào?";
        setAiReply(msg);
        handleUserSpeakRef.current("Hãy đọc lời chào: " + msg);
        document.removeEventListener('click', greet);
        document.removeEventListener('touchstart', greet);
      }
    };
    document.addEventListener('click', greet);
    document.addEventListener('touchstart', greet);
    return () => {
      document.removeEventListener('click', greet);
      document.removeEventListener('touchstart', greet);
    };
  }, [hasGreeted, chatbotWelcomeMessage, isSpeechSupported]);

  // ── Toggle Listening ─────────────────────────────────────────────────────
  const toggleListening = () => {
    if (!isSpeechSupported) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      return;
    }
    if (continuousRef.current) {
      continuousRef.current = false;
      setIsContinuousMode(false);
      recognitionRef.current?.stop();
      setIsListening(false);
      cleanupAudio();
    } else {
      continuousRef.current = true;
      setIsContinuousMode(true);
      setUserTranscript('');
      setAiReply('');
      try { recognitionRef.current?.start(); setIsListening(true); } catch {}
    }
  };

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
      currentAudioRef.current?.pause();
    };
  }, []);

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed right-4 sm:right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
      <motion.button
        onClick={toggleListening}
        whileHover={{ scale: isSpeechSupported ? 1.1 : 1 }}
        whileTap={{ scale: isSpeechSupported ? 0.9 : 1 }}
        className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all duration-300 backdrop-blur-xl cursor-pointer
          ${!isSpeechSupported ? 'bg-gray-500/50 text-white/50 border-white/10' :
            isContinuousMode ? 'ring-4 ring-amber-400/50 border-white/20' : 'border-white/20'}
          ${isSpeechSupported ? (
            isListening  ? 'bg-rose-500/80 text-white' :
            isSpeaking   ? 'bg-amber-400/80 text-black' :
            isProcessing ? 'bg-blue-500/80 text-white' :
            'bg-white/10 text-white hover:bg-white/20'
          ) : ''}`}
      >
        {isProcessing ? <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" /> :
         isSpeaking   ? <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" /> :
         isListening  ? <Mic    className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" /> :
                        <MicOff className="w-8 h-8 sm:w-10 sm:h-10" />}

        {isListening && <span className="absolute inset-0 rounded-full animate-ping bg-rose-500/40" style={{ animationDuration: '1.5s' }} />}
        {isSpeaking  && <span className="absolute inset-0 rounded-full animate-ping bg-amber-400/50" style={{ animationDuration: '2s' }} />}
      </motion.button>

      {(isListening || isProcessing || isSpeaking || userTranscript || aiReply) && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-64 sm:w-80 p-4 rounded-3xl bg-black/80 text-white backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-3 pointer-events-auto"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isListening  ? 'bg-rose-500 animate-ping' :
              isProcessing ? 'bg-blue-500 animate-pulse' :
              isSpeaking   ? 'bg-amber-400 animate-pulse' : 'bg-green-500'
            }`} />
            <span className="text-[12px] font-medium text-white/60 tracking-wider uppercase">
              {isListening  ? "Đang lắng nghe..." :
               isProcessing ? "Đang suy nghĩ..." :
               isSpeaking   ? "AI đang nói..." : "Sẵn sàng"}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
            {userTranscript && (
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Bạn:</span>
                <p className="text-white/90 text-sm leading-relaxed">{userTranscript}</p>
              </div>
            )}
            {aiReply && (
              <div className="flex flex-col text-left border-t border-white/5 pt-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">AI:</span>
                <p className="text-white/90 text-sm leading-relaxed">{aiReply}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
