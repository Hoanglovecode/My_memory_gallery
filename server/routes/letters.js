const express = require('express');
const router = express.Router();
const Letter = require('../models/Letter');
const auth = require('../middleware/auth');

// @route   GET api/letters
// @desc    Get all love letters
// @access  Public
router.get('/', async (req, res) => {
  try {
    let letters = await Letter.find().populate('user', 'username');
    if (letters.length === 0) {
      // Create a default letter associated with levanhoang if none exists
      const User = require('../models/User');
      const defaultUser = await User.findOne({ username: 'levanhoang' });
      const defaultUserId = defaultUser ? defaultUser._id : null;
      
      if (defaultUserId) {
        const defaultLetter = new Letter({
          title: 'Dear My Love,',
          content: 'Cảm ơn em đã xuất hiện trong cuộc đời anh. Mỗi khoảnh khắc bên em đều là một món quà vô giá. Dù tương lai có ra sao, anh vẫn muốn nắm tay em đi qua mọi giông bão. Yêu em vô cùng! ❤️',
          user: defaultUserId
        });
        await defaultLetter.save();
        letters = await Letter.find().populate('user', 'username');
      }
    }
    res.json(letters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/letters
// @desc    Update the love letter for the logged in user
// @access  Private
router.put('/', auth, async (req, res) => {
  const { title, content } = req.body;

  try {
    let letter = await Letter.findOne({ user: req.user.id });
    if (!letter) {
      letter = new Letter({ title, content, user: req.user.id });
    } else {
      if (title) letter.title = title;
      if (content) letter.content = content;
    }

    await letter.save();
    letter = await Letter.findById(letter._id).populate('user', 'username');
    res.json(letter);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
