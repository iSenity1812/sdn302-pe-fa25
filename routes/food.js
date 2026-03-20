var express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
var router = express.Router();
const Food = require('../models/food');

router.get('/', authenticate, async function(_req, res, next) {
  const foods = await Food.find().populate('nation', 'nationName');
  res.json(foods);
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id).populate('nation', 'nationName');
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.json(food);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json(food);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.json(food);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    await food.remove();
    res.json({ message: 'Food deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;