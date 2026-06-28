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
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [aiReply, setAiReply] = useState<string>('');
  
  const continuousRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  // Speech objects
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const selectVoice = useCallback((voices: SpeechSynthesisVoice[]) => {
    const viVoice =
      voices.find(v => v.lang === 'vi-VN') ||
      voices.find(v => v.lang.startsWith('vi')) ||
      voices.find(v => v.name.toLowerCase().includes('viet')) ||
      voices.find(v => v.name.includes('Tiếng Việt'));
    voiceRef.current = viVoice || null;
  }, []);

  // Initialize
  useEffect(() => {
    let currentSessionId = localStorage.getItem('chatbot_session_id');
    if (!currentSessionId) {
      currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chatbot_session_id', currentSessionId);
    }
    setSessionId(currentSessionId);

    const hasSpeechProps = 'speechSynthesis' in window && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    if (hasSpeechProps) {
      try {
        synthesisRef.current = window.speechSynthesis;
        
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'vi-VN';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserTranscript(transcript);
          setAiReply(''); // Clear previous AI reply when new input is recognized
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

        const loadVoices = (): Promise<void> => {
          return new Promise((resolve) => {
            const voices = synthesisRef.current?.getVoices() || [];
            if (voices.length > 0) {
              selectVoice(voices);
              resolve();
              return;
            }
            
            // Wait for voices to load
            if (synthesisRef.current) {
              synthesisRef.current.onvoiceschanged = () => {
                const v = synthesisRef.current?.getVoices() || [];
                selectVoice(v);
                resolve();
              };
            }
          });
        };

        loadVoices().then(() => {
          console.log('[TTS] Voice selected:', voiceRef.current?.name ?? 'none');
        });
        
        setIsSpeechSupported(true);
      } catch (err) {
        console.error('Failed to initialize Speech Recognition:', err);
        setIsSpeechSupported(false);
        recognitionRef.current = null;
      }
    } else {
      setIsSpeechSupported(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthesisRef.current || !isSpeechSupported) return;

    if (!voiceRef.current) {
      const voices = synthesisRef.current.getVoices();
      selectVoice(voices);
    }

    // Prevent collision by nullifying the callbacks of the active utterance before canceling
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current.onstart = null;
      currentUtteranceRef.current.onend = null;
      currentUtteranceRef.current.onerror = null;
    }

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    // Mark as speaking immediately to block microphone from restarting prematurely
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    onSpeakStateChange(true);

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef.current = utterance;

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
      currentUtteranceRef.current = null;
      
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
      currentUtteranceRef.current = null;
    };

    synthesisRef.current.speak(utterance);
  }, [onSpeakStateChange, isSpeechSupported, selectVoice]);

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
          message: text + " (Hãy trả lời tôi bằng Tiếng Việt một cách tự nhiên và ngắn gọn dưới 30 từ nhé)",
          sessionId: localStorage.getItem('chatbot_session_id') || sessionId
        })
      });

      const data = await response.json();
      const reply = data.reply || "Xin lỗi em, hình như có chút trục trặc kết nối...";
      
      setAiReply(reply);
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
      
      if (currentUtteranceRef.current) {
        currentUtteranceRef.current.onstart = null;
        currentUtteranceRef.current.onend = null;
        currentUtteranceRef.current.onerror = null;
      }

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
      setUserTranscript('');
      setAiReply('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Clean up synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

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

      {/* Conversation Card */}
      {(isListening || isProcessing || isSpeaking || userTranscript || aiReply) && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-64 sm:w-80 p-4 rounded-3xl bg-black/80 text-white backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-3 pointer-events-auto"
        >
          {/* Status Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isListening ? 'bg-rose-500 animate-ping' : 
              isProcessing ? 'bg-blue-500 animate-pulse' : 
              isSpeaking ? 'bg-amber-400 animate-pulse' : 'bg-green-500'
            }`} />
            <span className="text-[12px] font-medium text-white/60 tracking-wider uppercase">
              {isListening ? "Đang lắng nghe..." : 
               isProcessing ? "Đang suy nghĩ..." : 
               isSpeaking ? "Lạc đà đang nói..." : "Sẵn sàng"}
            </span>
          </div>

          {/* Transcript details */}
          <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
            {userTranscript && (
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Bạn:</span>
                <p className="text-white/90 text-sm leading-relaxed">{userTranscript}</p>
              </div>
            )}
            
            {aiReply && (
              <div className="flex flex-col text-left border-t border-white/5 pt-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Lạc đà:</span>
                <p className="text-white/90 text-sm leading-relaxed">{aiReply}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
