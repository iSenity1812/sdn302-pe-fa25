const express = require('express');
const router = express.Router();
const { generateToken } = require('../config/jwtConfig');
const { authenticate } = require('../middlewares/authMiddleware');
const User = require('../models/user');

router.post('/signin', async (req, res, next) => {
  try {
    const { name, key } = req.body;
    const user = await User.findOne({ name });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.compareKey(key);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user._id, name: user.name });
    // res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Login successful', user, token });
  } catch (error) {
    next(error);
  }
})

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-key');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      name: user.name,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.post('/register', async (req, res, _next) => {
  try {
    const { name, key } = req.body;
    if (!name || !key) return res.status(400).json({ message: 'Name and key are required' });

    const user = new User({ name, key });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ message: 'Error registering user' });
  }
});

module.exports = router;