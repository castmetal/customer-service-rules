const express = require('express');
const availableScheduleController = require('../controllers/available-schedule-controller');
const router = express.Router();

/**
 * Get rules
 * 
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
router.get(
  '/',
  availableScheduleController.validate('getAvailableSchedules'),
  availableScheduleController.getAvailableSchedules
);


module.exports = router;
