import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface CamelVoiceAIProps {
  onSpeakStateChange: (isSpeaking: boolean) => void;
  chatbotWelcomeMessage?: string;
}

export default function CamelVoiceAI({ onSpeakStateChange, chatbotWelcomeMessage }: CamelVoiceAIProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  
  const continuousRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isProcessingRef = useRef(false);
  
  // Speech objects
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const isSpeechSupported = 'speechSynthesis' in window && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize
  useEffect(() => {
    let currentSessionId = localStorage.getItem('chatbot_session_id');
    if (!currentSessionId) {
      currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chatbot_session_id', currentSessionId);
    }
    setSessionId(currentSessionId);

    if (isSpeechSupported) {
      synthesisRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'vi-VN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserSpeak(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Auto-restart listening if in continuous mode and not currently processing or speaking
        setTimeout(() => {
          if (continuousRef.current && !isProcessingRef.current && !isSpeakingRef.current) {
            try {
              recognitionRef.current?.start();
              setIsListening(true);
            } catch (e) { console.error(e); }
          }
        }, 300);
      };

      // Load voices and select a male Vietnamese voice
      const loadVoices = () => {
        const voices = synthesisRef.current?.getVoices() || [];
        // Strict search for Vietnamese
        let viVoice = voices.find(v => 
          (v.lang.includes('vi') || v.name.toLowerCase().includes('vietnam') || v.name.includes('Tiếng Việt')) && 
          (v.name.includes('An') || v.name.toLowerCase().includes('male'))
        );
        if (!viVoice) {
          viVoice = voices.find(v => v.lang.includes('vi') || v.name.toLowerCase().includes('vietnam') || v.name.includes('Tiếng Việt'));
        }
        voiceRef.current = viVoice || voices[0];
      };

      loadVoices();
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthesisRef.current || !isSpeechSupported) return;

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 0.9; // Slightly lower pitch for a calmer/male voice

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      onSpeakStateChange(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      onSpeakStateChange(false);
      
      // Auto-resume listening after speaking if continuous mode is ON
      if (continuousRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
            setIsListening(true);
          } catch (e) { console.error(e); }
        }, 400);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      onSpeakStateChange(false);
    };

    synthesisRef.current.speak(utterance);
  }, [onSpeakStateChange, isSpeechSupported]);

  // Initial Auto-Greeting on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasGreeted && isSpeechSupported) {
        setHasGreeted(true);
        const greeting = chatbotWelcomeMessage || "Chào bạn, tớ là trợ lý tình yêu của Memories. Hôm nay tớ có thể giúp gì cho bạn?";
        speak(greeting);
        // Remove listener after greeting
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      }
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [hasGreeted, speak, chatbotWelcomeMessage, isSpeechSupported]);

  const handleUserSpeak = async (text: string) => {
    setIsListening(false);
    if (!text.trim()) return;

    setIsProcessing(true);
    isProcessingRef.current = true;
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text + " (Hãy trả lời tôi bằng Tiếng Việt một cách tự nhiên và ngắn gọn nhé)",
          sessionId: sessionId
        })
      });

      const data = await response.json();
      const reply = data.reply || "Xin lỗi em, hình như có chút trục trặc kết nối...";
      
      speak(reply);
    } catch (err) {
      console.error(err);
      speak("Hệ thống gặp sự cố kết nối rồi. Cậu thử lại sau nhé!");
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  const toggleListening = () => {
    if (!isSpeechSupported) {
      alert("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói.");
      return;
    }

    if (continuousRef.current) {
      // Turn OFF continuous mode
      continuousRef.current = false;
      setIsContinuousMode(false);
      
      if (isSpeaking) {
        synthesisRef.current?.cancel();
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        onSpeakStateChange(false);
      }
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
    } else {
      // Turn ON continuous mode
      continuousRef.current = true;
      setIsContinuousMode(true);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="fixed right-4 sm:right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
      {/* Microphone Button */}
      <motion.button
        onClick={toggleListening}
        whileHover={{ scale: isSpeechSupported ? 1.1 : 1 }}
        whileTap={{ scale: isSpeechSupported ? 0.9 : 1 }}
        className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all duration-300 backdrop-blur-xl cursor-pointer
          ${!isSpeechSupported ? 'bg-gray-500/50 text-white/50 border-white/10' :
            isContinuousMode ? 'ring-4 ring-amber-400/50 border-white/20' : 'border-white/20'}
          ${isSpeechSupported ? (
            isListening ? 'bg-rose-500/80 text-white' : 
            isSpeaking ? 'bg-amber-400/80 text-theme-dark' : 
            isProcessing ? 'bg-blue-500/80 text-white' : 
            'bg-white/10 text-white hover:bg-white/20'
          ) : ''}`}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" />
        ) : isSpeaking ? (
          <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
        ) : isListening ? (
          <Mic className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
        ) : (
          <MicOff className="w-8 h-8 sm:w-10 sm:h-10" />
        )}

        {/* Glow Effects */}
        {isListening && (
          <span className="absolute inset-0 rounded-full animate-ping bg-rose-500/40" style={{ animationDuration: '1.5s' }} />
        )}
        {isSpeaking && (
          <span className="absolute inset-0 rounded-full animate-ping bg-amber-400/50" style={{ animationDuration: '2s' }} />
        )}
      </motion.button>

      {/* Status Text */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: (isListening || isSpeaking || isProcessing) ? 1 : 0, x: (isListening || isSpeaking || isProcessing) ? 0 : 20 }}
        className="absolute right-full mr-4 whitespace-nowrap bg-black/60 text-white px-4 py-2 rounded-full text-sm font-serif backdrop-blur-md border border-white/10 shadow-lg pointer-events-none"
      >
        {isListening ? "Đang nghe bạn nói..." : 
         isProcessing ? "Đang suy nghĩ..." : 
         isSpeaking ? "Lạc đà đang trả lời..." : ""}
      </motion.div>
    </div>
  );
}
