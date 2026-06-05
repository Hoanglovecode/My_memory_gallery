const express = require('express');
const router = express.Router();
const Letter = require('../models/Letter');
const auth = require('../middleware/auth');

// @route   GET api/letters
// @desc    Get the love letter (returns the first one or creates a default)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let letter = await Letter.findOne();
    if (!letter) {
      // Create a default letter if none exists in database
      const defaultLetter = new Letter({
        title: 'Dear My Love,',
        content: 'Cảm ơn em đã xuất hiện trong cuộc đời anh. Mỗi khoảnh khắc bên em đều là một món quà vô giá. Dù tương lai có ra sao, anh vẫn muốn nắm tay em đi qua mọi giông bão. Yêu em vô cùng! ❤️'
      });
      letter = await defaultLetter.save();
    }
    res.json(letter);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/letters
// @desc    Update the love letter
// @access  Private
router.put('/', auth, async (req, res) => {
  const { title, content } = req.body;

  try {
    let letter = await Letter.findOne();
    if (!letter) {
      letter = new Letter({ title, content });
    } else {
      if (title) letter.title = title;
      if (content) letter.content = content;
    }

    await letter.save();
    res.json(letter);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
