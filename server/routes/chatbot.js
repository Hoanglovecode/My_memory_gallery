const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Settings = require('../models/Settings');
const ChatLog = require('../models/ChatLog');

// Giới hạn mỗi IP chỉ được gửi tối đa 30 request mỗi 10 phút
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 30, // tối đa 30 requests
  message: {
    reply: "Bạn nhắn tin quá nhanh, thử lại sau nhé 💕"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to estimate token count (~1 token per 2 characters for mixed Vietnamese)
const estimateTokenCount = (text) => {
  return Math.ceil((text || '').length / 2);
};

// @route   POST api/chatbot/chat
// @desc    Secure proxy to chat with Google Gemini API with persistence & context limit
// @access  Public
router.post('/chat', chatLimiter, async (req, res) => {
  const { message, sessionId } = req.body;

  // 1. Validate if message exists and is not just whitespace
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ reply: "Tin nhắn không được để trống cậu nhé! 💕" });
  }

  if (!sessionId) {
    return res.status(400).json({ reply: "Không tìm thấy sessionId hợp lệ. Vui lòng tải lại trang! ⚙️" });
  }

  // 2. Sanitize: Strip HTML tags to prevent injections
  let sanitizedMessage = message.replace(/<[^>]*>/g, '');

  // 3. Trim and limit length to 500 characters
  sanitizedMessage = sanitizedMessage.trim().substring(0, 500);

  // 4. Double check if it became empty after stripping HTML tags
  if (!sanitizedMessage) {
    return res.status(400).json({ reply: "Tin nhắn không được để trống cậu nhé! 💕" });
  }

  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.chatbotApiKey) {
      return res.json({
        reply: "Chào em! Anh là trợ lý AI. Hiện tại anh chưa được cấu hình API Key của Google Gemini trong Bảng quản trị, nên anh chưa thể trả lời em được. Hãy nhắn anh người yêu (Hoàng) cấu hình API Key nhé! 💕"
      });
    }

    const apiKey = settings.chatbotApiKey;
    const systemPrompt = settings.chatbotSystemPrompt || 'Bạn là trợ lý AI đáng yêu đại diện cho bạn nam.';
    const systemPromptTokens = estimateTokenCount(systemPrompt);

    // Fetch previous messages for this session
    let chatLog = await ChatLog.findOne({ sessionId });
    if (!chatLog) {
      chatLog = new ChatLog({ sessionId, messages: [] });
    }

    // Get the last 20 messages from history
    const recentMessages = chatLog.messages.slice(-20);

    // Context window logic (max 8000 tokens including system prompt)
    const contents = [];
    let currentTokens = systemPromptTokens;
    const messagesToInclude = [];

    // Add current user message tokens
    const currentUserMessageText = sanitizedMessage;
    const currentUserMessageTokens = estimateTokenCount(currentUserMessageText);
    currentTokens += currentUserMessageTokens;

    // Loop backwards through history to fit within the 8000 tokens budget
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      const msgTokens = estimateTokenCount(msg.content);
      if (currentTokens + msgTokens > 8000) {
        break; // Stop including older messages
      }
      currentTokens += msgTokens;
      messagesToInclude.unshift(msg); // Add to beginning
    }

    // Format for Gemini API
    messagesToInclude.forEach(msg => {
      contents.push({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: currentUserMessageText }]
    });

    const geminiPayload = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    };

    let response;
    let data;
    let attempts = 0;
    const maxAttempts = 3; // 1 initial + 2 retries
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(geminiPayload)
        };

        if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
          fetchOptions.signal = AbortSignal.timeout(8000); // 8-second timeout
        }

        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, fetchOptions);
        data = await response.json();

        if (response.ok) {
          break; // Success
        } else {
          lastError = new Error(data.error?.message || `Gemini API returned status ${response.status}`);
          console.warn(`Gemini API attempt ${attempts + 1} failed: ${lastError.message}`);
        }
      } catch (err) {
        lastError = err;
        console.warn(`Gemini API attempt ${attempts + 1} threw error: ${err.message}`);
      }

      attempts++;
      if (attempts < maxAttempts) {
        await delay(1000);
      }
    }

    if (!response || !response.ok) {
      console.error("Gemini API call failed after retries. Last error:", lastError);
      return res.status(500).json({
        reply: "Anh đang bận tí, em nhắn lại sau nhé 🥺"
      });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi em, anh chưa kịp nghĩ ra câu trả lời... 💕";
    
    // Save both messages to the database
    chatLog.messages.push({
      role: 'user',
      content: sanitizedMessage,
      timestamp: new Date()
    });
    chatLog.messages.push({
      role: 'model',
      content: replyText,
      timestamp: new Date()
    });
    await chatLog.save();

    res.json({ reply: replyText });
  } catch (err) {
    console.error("Chatbot route error:", err);
    res.status(500).json({ reply: "Hệ thống gặp sự cố kết nối server. Thử lại sau nhé em! ⚙️" });
  }
});

// @route   GET api/chatbot/history
// @desc    Get chat history for a session
// @access  Public
router.get('/history', async (req, res) => {
  const { sessionId, limit = 50 } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    const chatLog = await ChatLog.findOne({ sessionId });
    if (!chatLog) {
      return res.json([]);
    }

    // Return the last 'limit' messages
    const messages = chatLog.messages.slice(-parseInt(limit));
    res.json(messages);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// @route   DELETE api/chatbot/history
// @desc    Clear chat history for a session
// @access  Public
router.delete('/history', async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    await ChatLog.deleteOne({ sessionId });
    res.json({ success: true, message: "Lịch sử chat đã được xoá sạch! 💕" });
  } catch (err) {
    console.error("Error deleting chat history:", err);
    res.status(500).json({ error: "Không thể xoá lịch sử chat" });
  }
});

// @route   POST api/chatbot/test-key
// @desc    Test Gemini API connection with a given key
// @access  Public
router.post('/test-key', async (req, res) => {
  const { apiKey } = req.body;
  
  let keyToTest = apiKey;
  
  // If no key passed or masked, try to retrieve currently saved key
  if (!keyToTest || keyToTest === '********') {
    try {
      const settings = await Settings.findOne();
      keyToTest = settings?.chatbotApiKey;
    } catch (err) {
      return res.json({ success: false, error: "Lỗi cơ sở dữ liệu: " + err.message });
    }
  }

  if (!keyToTest) {
    return res.json({ success: false, error: "Chưa cấu hình API Key" });
  }

  try {
    const geminiPayload = {
      contents: [{
        role: 'user',
        parts: [{ text: "Hello" }]
      }]
    };

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiPayload)
    };

    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
      fetchOptions.signal = AbortSignal.timeout(5000); // 5-second timeout for testing
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${keyToTest}`, fetchOptions);
    const data = await response.json();

    if (response.ok) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, error: data.error?.message || `Status: ${response.status}` });
    }
  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
});

module.exports = router;
