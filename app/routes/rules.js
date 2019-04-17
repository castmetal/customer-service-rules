const express = require('express');
const ruleController = require('../controllers/rule-controller');

const router = express.Router();

/**
 * Create rules
 *
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
router.post(
  '/',
  ruleController.validate('createRule'),
  ruleController.createRule
);

/**
 * Get rules
 *
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
router.get('/', ruleController.validate('getRules'), ruleController.getRules);

/**
 * Delete rule
 *
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
router.delete(
  '/:id',
  ruleController.validate('deleteRule'),
  ruleController.deleteRule
);

module.exports = router;
