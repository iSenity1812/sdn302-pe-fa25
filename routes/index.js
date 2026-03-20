var express = require('express');
var router = express.Router();

// Mount sub-routes
router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/nations', require('./nation'));
router.use('/foods', require('./food'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ message: 'API v1 is running' });
});

module.exports = router;
