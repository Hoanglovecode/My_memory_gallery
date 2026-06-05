const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Video kỷ niệm',
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  eventDate: {
    type: String,
    default: 'Hôm nay'
  },
  videoUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Video', VideoSchema);
