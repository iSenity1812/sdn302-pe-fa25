var express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
var router = express.Router();
const Nation = require('../models/nation');
const Food = require('../models/food');

router.get('/', authenticate, async function(req, res, next) {
  const nations = await Nation.find();
  res.json(nations);
});

router.post('/', async (req, res, next) => {
  try {
    const nation = new Nation(req.body);
    await nation.save();
    res.status(201).json(nation);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const nation = await Nation.findById(req.params.id);
    if (!nation) return res.status(404).json({ message: 'Nation not found' });
    res.json(nation);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const nation = await Nation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!nation) return res.status(404).json({ message: 'Nation not found' });
    res.json(nation);
  }
    catch (error) {
    next(error);
  }
});

// if there are any foods associated with this nation, we should prevent deletion or handle it accordingly 
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const nation = await Nation.findById(req.params.id);
    if (!nation) return res.status(404).json({ message: 'Nation not found' });
    if (await Food.exists({ nation: nation._id })) {
      return res.status(400).json({ message: 'Cannot delete nation with associated foods' });
    }
    await nation.remove();
    res.json({ message: 'Nation deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;