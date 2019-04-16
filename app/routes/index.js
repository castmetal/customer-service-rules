const express = require('express');
const router = express.Router();

/**
 * Home Page
 * 
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
router.get('/', (req, res, next) => {
  res.send({ title: 'Customer Service Rules - on' });
});

module.exports = router;
