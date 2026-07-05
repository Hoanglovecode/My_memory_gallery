import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Heart, Trash2, Mic } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface ChatbotWidgetProps {
  chatbotName: string;
  chatbotWelcomeMessage: string;
  onMicrophoneStart?: () => void;
  onMicrophoneEnd?: () => void;
}

export default function ChatbotWidget({ chatbotName, chatbotWelcomeMessage, onMicrophoneStart, onMicrophoneEnd }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const handleSendRef = useRef<any>(null);

  // Initialize session ID, draft, and open state on mount
  useEffect(() => {
    let currentSessionId = localStorage.getItem('chatbot_session_id');
    if (!currentSessionId) {
      currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chatbot_session_id', currentSessionId);
    }
    setSessionId(currentSessionId);

    const savedOpen = localStorage.getItem('chatbot_open');
    if (savedOpen === 'true') {
      setIsOpen(true);
    }

    const savedDraft = localStorage.getItem('chatbot_draft');
    if (savedDraft) {
      setInputText(savedDraft);
    }
  }, []);

  // Fetch history for the session once sessionId is ready
  useEffect(() => {
    if (!sessionId) return;

    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chatbot/history?sessionId=${sessionId}`);
        if (!response.ok) throw new Error("Failed to load history");
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const formattedMessages: Message[] = data.map((msg: any) => ({
            role: msg.role === 'model' ? 'ai' : 'user',
            text: msg.content,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(formattedMessages);
        } else {
          setMessages([
            {
              role: 'ai',
              text: chatbotWelcomeMessage || 'Chào cậu! Tớ là trợ lý ảo của bạn. Hôm nay tớ có thể giúp gì cho cậu? ✨',
              timestamp: new Date()
            }
          ]);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
        setMessages([
          {
            role: 'ai',
            text: chatbotWelcomeMessage || 'Chào cậu! Tớ là trợ lý ảo của bạn. Hôm nay tớ có thể giúp gì cho cậu? ✨',
            timestamp: new Date()
          }
        ]);
      }
    };

    fetchHistory();
  }, [sessionId, chatbotWelcomeMessage]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const onMicrophoneStartRef = useRef(onMicrophoneStart);
  const onMicrophoneEndRef = useRef(onMicrophoneEnd);

  // Sync latest handleSend and mic callbacks to refs for STT callbacks
  useEffect(() => {
    handleSendRef.current = handleSend;
    onMicrophoneStartRef.current = onMicrophoneStart;
    onMicrophoneEndRef.current = onMicrophoneEnd;
  });

  // Initialize Speech Recognition
  useEffect(() => {
    const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    if (!supported) {
      setIsSpeechSupported(false);
      return;
    }
    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'vi-VN';

      rec.onstart = () => {
        setIsListening(true);
      };
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (handleSendRef.current) {
          handleSendRef.current(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('[STT] error:', event.error);
        setIsListening(false);
        
        // Cảnh báo người dùng nếu lỗi do quyền truy cập hoặc không có tiếng
        let errorMsg = "";
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          errorMsg = "⚠️ Bạn chưa cấp quyền Micro! Vui lòng cho phép trình duyệt sử dụng Micro để tôi có thể nghe bạn nói nhé.";
        } else if (event.error === 'no-speech') {
          errorMsg = "⚠️ Tôi chưa nghe được âm thanh nào. Bạn hãy kiểm tra lại Micro và nói to hơn chút nha.";
        } else {
          errorMsg = "⚠️ Lỗi nhận diện giọng nói: " + event.error;
        }
        
        // Thêm tin nhắn cảnh báo vào khung chat
        setMessages(prev => [...prev, {
          role: 'ai',
          text: errorMsg,
          timestamp: new Date()
        }]);
      };

      rec.onend = () => {
        setIsListening(false);
        if (onMicrophoneEndRef.current) onMicrophoneEndRef.current();
      };

      recognitionRef.current = rec;
      setIsSpeechSupported(true);
    } catch (err) {
      console.error('[STT] init failed:', err);
      setIsSpeechSupported(false);
    }
  }, []);

  const toggleListening = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isSpeechSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (onMicrophoneStartRef.current) onMicrophoneStartRef.current();
        setIsListening(true);
        recognitionRef.current?.start();
      } catch (err) {
        console.error(err);
        setIsListening(false);
        if (onMicrophoneEndRef.current) onMicrophoneEndRef.current();
      }
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    localStorage.removeItem('chatbot_draft');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          sessionId: sessionId
        })
      });

      const data = await response.json();

      const aiMessage: Message = {
        role: 'ai',
        text: data.reply || "Xin lỗi, hình như có chút trục trặc kết nối...",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: "Hệ thống gặp sự cố kết nối rồi. Cậu thử lại sau nhé! ⚙️",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    localStorage.setItem('chatbot_draft', val);
  };

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    localStorage.setItem('chatbot_open', String(nextOpen));
    if (nextOpen) {
      setHasNewMessage(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện này không?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/chatbot/history?sessionId=${sessionId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setMessages([
            {
              role: 'ai',
              text: chatbotWelcomeMessage || 'Xin chào! Tôi là trợ lý AI của bạn. Hôm nay tôi có thể giúp gì cho bạn? 😊',
              timestamp: new Date()
            }
          ]);
          localStorage.removeItem('chatbot_draft');
          setInputText('');
        }
      } catch (err) {
        console.error("Failed to clear chat history:", err);
      }
    }
  };

  const handleQuickReply = (promptText: string) => {
    handleSend(promptText);
  };

  const quickReplies = [
    "Kể tớ nghe chuyện vui đi 😄",
    "Nhắc lại một kỷ niệm nhé ✨",
    "Hôm nay nên làm gì cho thú vị? 🗺️",
    "Gợi ý cho tớ một bài nhạc hay 🎵"
  ];

  return (
    <div className="fixed bottom-6 right-6 md:bottom-24 z-[99] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[520px] bg-white/95 backdrop-blur-md border border-theme-accent1/30 shadow-[0_12px_40px_rgba(167,114,125,0.15)] rounded-3xl flex flex-col mb-4 overflow-hidden animate-scale-up relative pointer-events-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-theme-accent2 to-[#F8C4B4] p-4 text-white flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/10">
                  <Sparkles size={20} className="text-white animate-pulse" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-ping"></span>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h4 className="font-serif font-bold tracking-wide text-md">{chatbotName || 'AI Assistant'}</h4>
                <p className="text-[10px] text-white/80 font-medium">Trợ lý ảo đang trực tuyến</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  onClick={handleClearHistory}
                  className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Xoá lịch sử trò chuyện"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button 
                onClick={handleToggle} 
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-theme-accent1">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div 
                  className={`p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-xs transition-all ${
                    msg.role === 'user' 
                      ? 'bg-theme-accent2 text-white rounded-tr-none' 
                      : 'bg-theme-main/40 text-theme-dark border border-theme-accent1/20 rounded-tl-none font-medium'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="mr-auto items-start max-w-[80%] flex flex-col">
                <div className="p-3.5 rounded-2xl bg-theme-main/40 text-theme-dark border border-theme-accent1/20 rounded-tl-none flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-theme-dark/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2.5 h-2.5 bg-theme-dark/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2.5 h-2.5 bg-theme-dark/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && !isTyping && (
            <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-theme-accent1/10 bg-gray-50/50">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs bg-white hover:bg-theme-main/40 text-theme-dark/80 hover:text-theme-dark px-3 py-1.5 rounded-full border border-theme-accent1/20 transition-all shadow-2xs hover:scale-102 cursor-pointer font-medium"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }} 
            className="p-3 bg-white border-t border-theme-accent1/20 flex gap-2 items-center"
          >
            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isTyping}
                className={`p-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center pointer-events-auto flex-shrink-0 ${
                  isListening ? 'bg-rose-500 text-white shadow-lg animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-theme-accent2'
                } disabled:opacity-50`}
                title={isListening ? 'Đang nghe (Bấm để dừng)' : 'Ghi âm giọng nói'}
              >
                <Mic size={18} />
              </button>
            )}
            <input 
              type="text" 
              value={isListening ? 'Đang nghe...' : inputText}
              onChange={e => { if (!isListening) handleInputChange(e.target.value); }}
              placeholder="Nhập tin nhắn của bạn..."
              disabled={isTyping || isListening}
              className="flex-1 px-4 py-2.5 bg-theme-main/20 text-theme-dark placeholder-theme-dark/50 text-sm border border-transparent rounded-full focus:outline-hidden focus:border-theme-accent2 focus:bg-white transition-all font-medium"
            />
            <button 
              type="submit" 
              disabled={isTyping || !inputText.trim()}
              className="p-2.5 bg-theme-accent2 text-white rounded-full hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer flex items-center justify-center pointer-events-auto"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={handleToggle}
        className="p-4 rounded-full bg-theme-accent2 text-white shadow-[0_6px_20px_rgba(242,190,209,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center relative animate-bounce pointer-events-auto"
        title="Trò chuyện AI"
      >
        <MessageCircle size={26} />
        <Heart size={10} className="absolute top-3.5 right-3.5 fill-current text-white animate-pulse" />
        {hasNewMessage && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white pointer-events-none"></span>
        )}
      </button>
    </div>
  );
}
