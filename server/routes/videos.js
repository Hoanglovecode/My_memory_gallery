const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const { saveBase64File } = require('../utils/fileUpload');

// Helper to format video properties and resolve static URLs dynamically
const formatVideoUrl = (video, req) => {
  const v = video.toObject ? video.toObject() : { ...video };
  v.id = v._id;
  if (v.user && v.user.username) {
    v.username = v.user.username;
  } else {
    v.username = 'levanhoang'; // fallback
  }
  if (v.videoUrl && v.videoUrl.startsWith('/uploads/')) {
    const host = req.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';
    v.videoUrl = `${protocol}://${host}${v.videoUrl}`;
  }
  return v;
};

// @route   GET api/videos
// @desc    Get all videos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().populate('user', 'username').sort({ createdAt: -1 });
    const formattedVideos = videos.map(video => formatVideoUrl(video, req));
    res.json(formattedVideos);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   POST api/videos
// @desc    Create a video
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, eventDate, videoUrl } = req.body;

  try {
    if (!videoUrl) {
      return res.status(400).json({ msg: 'Please provide a video' });
    }

    // Save base64 video to file if applicable
    const savedVideoUrl = await saveBase64File(videoUrl, 'video');

    const newVideo = new Video({
      title: title || 'Video kỷ niệm',
      description: description || '',
      eventDate: eventDate || 'Hôm nay',
      videoUrl: savedVideoUrl,
      user: req.user.id
    });

    let video = await newVideo.save();
    // Populate user to get username
    video = await Video.findById(video._id).populate('user', 'username');
    res.json(formatVideoUrl(video, req));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   PUT api/videos/:id
// @desc    Update a video
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, eventDate, videoUrl } = req.body;

  try {
    let video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }

    // Verify ownership
    if (video.user && video.user.toString() !== req.user.id && req.user.username !== 'admin') {
      return res.status(403).json({ msg: 'Bạn không có quyền sửa video này' });
    }

    // Save base64 video to file if new one is provided
    const savedVideoUrl = videoUrl ? await saveBase64File(videoUrl, 'video') : undefined;

    // Update fields
    video.title = title || 'Video kỷ niệm';
    if (description !== undefined) video.description = description || '';
    video.eventDate = eventDate || 'Hôm nay';
    if (savedVideoUrl) video.videoUrl = savedVideoUrl;

    await video.save();
    // Populate user to get username
    video = await Video.findById(video._id).populate('user', 'username');
    res.json(formatVideoUrl(video, req));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   DELETE api/videos/:id
// @desc    Delete a video
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }

    // Verify ownership
    if (video.user && video.user.toString() !== req.user.id && req.user.username !== 'admin') {
      return res.status(403).json({ msg: 'Bạn không có quyền xóa video này' });
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Video removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

module.exports = router;
