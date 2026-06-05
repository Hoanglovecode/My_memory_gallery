const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Ảnh kỷ niệm',
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
  imageUrl: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Photo', PhotoSchema);
