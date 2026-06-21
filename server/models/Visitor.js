const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  browser: {
    type: String,
    default: 'Unknown Browser',
    trim: true
  },
  os: {
    type: String,
    default: 'Unknown OS',
    trim: true
  },
  page: {
    type: String,
    default: '/',
    trim: true
  },
  country: {
    type: String,
    default: 'Local/Unknown',
    trim: true
  },
  city: {
    type: String,
    default: '',
    trim: true
  },
  isp: {
    type: String,
    default: '',
    trim: true
  },
  referrer: {
    type: String,
    default: 'Direct',
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Visitor', VisitorSchema);
