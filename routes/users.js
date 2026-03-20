var express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
var router = express.Router();
const User = require('../models/user');

/* GET users listing. */
router.get('/', authenticate, async function(req, res, next) {
  const users = await User.find();
  res.json(users);
});

router.post('/', async (req, res, next) => {
  try {;
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;