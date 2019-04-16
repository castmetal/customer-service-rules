var express = require('express');
var router = express.Router();

/**
 * Get rules
 * 
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

module.exports = router;
