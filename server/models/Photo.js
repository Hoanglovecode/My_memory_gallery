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
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Photo', PhotoSchema);
