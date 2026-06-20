const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Settings = require('./models/Settings');
const ChatLog = require('./models/ChatLog');
const Photo = require('./models/Photo');
const Video = require('./models/Video');
const Letter = require('./models/Letter');

const estimateTokenCount = (text) => {
  return Math.ceil((text || '').length / 2);
};

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const settings = await Settings.findOne();
  if (!settings || !settings.chatbotApiKey) {
    console.error("No API Key configured!");
    process.exit(1);
  }

  const apiKey = settings.chatbotApiKey;
  let systemPrompt = settings.chatbotSystemPrompt || 'Bạn là trợ lý AI đáng yêu.';

  // 1. Fetch memory context
  try {
    const [photos, videos, letters] = await Promise.all([
      Photo.find({}, 'title eventDate').limit(40),
      Video.find({}, 'title eventDate').limit(20),
      Letter.find({}, 'title content').limit(5)
    ]);

    let memoryContext = '\n\n[Dữ liệu Album kỷ niệm thực tế từ website của bạn để sử dụng khi trò chuyện:]';
    if (photos.length > 0) {
      memoryContext += '\n- Ảnh kỷ niệm hiện có: ' + photos.map(p => `"${p.title}" (${p.eventDate || 'chưa rõ ngày'})`).join(', ');
    }
    if (videos.length > 0) {
      memoryContext += '\n- Video kỷ niệm hiện có: ' + videos.map(v => `"${v.title}" (${v.eventDate || 'chưa rõ ngày'})`).join(', ');
    }
    if (letters.length > 0) {
      memoryContext += '\n- Thư tình đã viết: ' + letters.map(l => `Thư "${l.title}" (nội dung chính: "${l.content.substring(0, 150)}...")`).join('; ');
    }
    systemPrompt += memoryContext;
  } catch (dbErr) {
    console.warn("Failed to fetch memories context for chatbot RAG:", dbErr.message);
  }

  const systemPromptTokens = estimateTokenCount(systemPrompt);
  console.log("System Prompt length:", systemPrompt.length, "Tokens:", systemPromptTokens);

  const contents = [
    {
      role: 'user',
      parts: [{ text: "Kể tớ nghe chuyện cười đi" }]
    }
  ];

  const geminiPayload = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: 800
    }
  };

  console.log("Calling Gemini API with gemini-flash-latest...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiPayload)
    });
    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Body:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err);
  }

  await mongoose.disconnect();
}

test().catch(console.error);
