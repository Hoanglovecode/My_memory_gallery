const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  musicUrl: {
    type: String,
    default: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  musicTitle: {
    type: String,
    default: 'SoundHelix-Song-1'
  },
  chatbotEnabled: {
    type: Boolean,
    default: true
  },
  chatbotName: {
    type: String,
    default: 'AI Love Bot'
  },
  chatbotWelcomeMessage: {
    type: String,
    default: 'Chào em! Anh là trợ lý tình yêu của hai bạn. Hôm nay em muốn trò chuyện gì nào? 💕'
  },
  chatbotSystemPrompt: {
    type: String,
    default: 'Bạn là một trợ lý AI ngọt ngào, ấm áp và hài hước đại diện cho bạn nam (Hoàng) trò chuyện với bạn gái tương lai. Hãy dùng giọng điệu quan tâm, cưng chiều, đôi khi chọc ghẹo một cách dễ thương. Tránh trả lời quá dài, hãy nói ngắn gọn, tự nhiên như tin nhắn trò chuyện.'
  },
  chatbotApiKey: {
    type: String,
    default: ''
  },
  creatorFacebook: {
    type: String,
    default: 'https://www.facebook.com/van.hoang.774744/'
  },
  creatorLinkedin: {
    type: String,
    default: 'https://www.linkedin.com/in/hoangalgoict/'
  },
  creatorYoutube: {
    type: String,
    default: 'https://www.youtube.com/@Algoict_Official'
  },
  creatorGithub: {
    type: String,
    default: 'https://github.com/Hoanglovecode'
  },
  creatorTiktok: {
    type: String,
    default: 'https://www.tiktok.com/@hoang_algoict'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', SettingsSchema);
