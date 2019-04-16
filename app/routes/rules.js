const express = require('express');
const { body } = require('express-validator/check');
const ruleController = require('../controllers/rule-controller');
const router = express.Router();
const { merge } = require('lodash');

/**
 * Create rules
 * 
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
router.post(
  '/',
    ruleController.validate('createRule')
  ,
  ruleController.createRule
);

module.exports = router;
