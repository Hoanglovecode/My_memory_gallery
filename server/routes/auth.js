const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Simple validation
    if (!username || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Check for user
    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    // Sign JWT
    jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'super_secret_key_for_memories_gallery_jwt',
      { expiresIn: '7d' }, // token expires in 7 days
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
