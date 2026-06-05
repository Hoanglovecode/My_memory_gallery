const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const auth = require('../middleware/auth');
const { saveBase64File } = require('../utils/fileUpload');

// Helper to format photo properties and resolve static URLs dynamically
const formatPhotoUrl = (photo, req) => {
  const p = photo.toObject ? photo.toObject() : { ...photo };
  p.id = p._id;
  if (p.imageUrl && p.imageUrl.startsWith('/uploads/')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    p.imageUrl = `${baseUrl}${p.imageUrl}`;
  }
  return p;
};

// @route   GET api/photos
// @desc    Get all photos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });
    const formattedPhotos = photos.map(photo => formatPhotoUrl(photo, req));
    res.json(formattedPhotos);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   POST api/photos
// @desc    Create a photo
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, eventDate, imageUrl } = req.body;

  try {
    if (!imageUrl) {
      return res.status(400).json({ msg: 'Please provide an image' });
    }

    // Save base64 image to file if applicable
    const savedImageUrl = saveBase64File(imageUrl, 'photo');

    const newPhoto = new Photo({
      title: title || 'Ảnh kỷ niệm',
      description: description || '',
      eventDate: eventDate || 'Hôm nay',
      imageUrl: savedImageUrl
    });

    const photo = await newPhoto.save();
    res.json(formatPhotoUrl(photo, req));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   PUT api/photos/:id
// @desc    Update a photo
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, eventDate, imageUrl } = req.body;

  try {
    let photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ msg: 'Photo not found' });
    }

    // Save base64 image to file if new one is provided
    const savedImageUrl = imageUrl ? saveBase64File(imageUrl, 'photo') : undefined;

    // Update fields
    photo.title = title || 'Ảnh kỷ niệm';
    if (description !== undefined) photo.description = description || '';
    photo.eventDate = eventDate || 'Hôm nay';
    if (savedImageUrl) photo.imageUrl = savedImageUrl;

    await photo.save();
    res.json(formatPhotoUrl(photo, req));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   DELETE api/photos/:id
// @desc    Delete a photo
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ msg: 'Photo not found' });
    }

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Photo removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

module.exports = router;
