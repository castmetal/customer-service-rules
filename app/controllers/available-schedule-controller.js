const { query } = require('express-validator/check');
const moment = require('moment');
const { genericErrors, validationHandler } = require('./message-validators');
const fileHandler = require('./utils/file-utils');
const { newContextJson } = require('./utils/json');
const baseWeekDays = {
  2: 'monday',
  3: 'tuesday',
  4: 'wednesday',
  5: 'thursday',
  6: 'friday',
  7: 'saturday',
  1: 'sunday',
}

/**
 * Check if start_date is greater than end_date
 * 
 * @param {string} start - String of start_date
 * @param {string} end - String of end_date
 * @return {boolean} true, false
 */
const checkDate = (start, end) => {
  let returnContext = true;
  const mStart = moment(start, 'DD-MM-YYYY');
  const mEnd = moment(end, 'DD-MM-YYYY');
  const equal = start === end;
  if (!equal) {
    returnContext = mStart.isBefore(mEnd);
  }
  return returnContext;
}

/**
 * Action getAvailableSchedules
 * 
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
exports.getAvailableSchedules = (req, res, next) => {
  req
  .getValidationResult()
  .then(validationHandler())
  .then(() => {
    const { start_date, end_date } = req.query;
    if (!checkDate(start_date, end_date)) {
      const error = new Error(`end_date deve ser maior ou igual que start_date`);
      error.statusCode = 422;
      error.code = "INVALID_FIELD";
      return next(error);
    }
    const availableSchedules = filterAvailableSchedules(start_date, end_date);
    res.send(availableSchedules);
  })
  .catch(next)
}

/**
 * Filter Available Schedules - Based on start and end date
 * 
 * @param {string} start_date - String of start_date
 * @param {string} end_date - String of end_date
 * @return {array} AvailableSchedules
 */
const filterAvailableSchedules = (start_date, end_date) => {
  const dataBaseRules = newContextJson(fileHandler.getDatabase());
  const initial_date = moment(start_date, 'DD-MM-YYYY');
  const final_date = moment(end_date, 'DD-MM-YYYY');
  const diffDays = final_date.diff(initial_date, 'days');
  let finalArray = [];
  let date;
  for (let i = 0; i <= diffDays; i += 1) {
    date = moment(start_date, 'DD-MM-YYYY').add(i, 'days');
    const day = date.format('DD-MM-YYYY');
    finalArray[i] = {day};
    finalArray[i].intervals = filterRulesByDate(day, dataBaseRules);
  }
  return finalArray;
}

/**
 * Filter Rules Based on date Interval
 * 
 * @param {string} day - String of day
 * @param {array} dataBaseRules - Array of rules
 * @return {array} AvailableSchedules
 */
const filterRulesByDate = (day, dataBaseRules) => {
  const mapRules = dataBaseRules.data.map(element => {
    if (element.type === 'daily') {
      return formatIntervals(element.intervals);
    }
    if (element.type === 'specific_day' && element.specific_day === day) {
      return formatIntervals(element.intervals);
    }
    if (element.type === 'weekly') {
      const dayWeek = moment(day, 'DD-MM-YYYY').day();
      if (element.week_days.indexOf(baseWeekDays[dayWeek])) {
        return formatIntervals(element.intervals);
      }
    } else {
      return null;
    }
  });
  return mapRules.filter(element => {
    return (element !== null);
  });
}

/**
 * Parse Intervals based on object
 * 
 * @param {array} intervals - Array of intervals
 * @return {array} intervals formated
 */
const formatIntervals = intervals => {
  return intervals.map(element => {
    return {start: element.start_time, end: element.end_time};
  });
}

/**
 * Validates API inputs on querys and request_data
 * 
 * @param {string} method - getAvailableSchedules
 * @return {Promise} reject,resolve
 */
exports.validate = method => {
  switch (method) {
      case 'getAvailableSchedules': {
        return [
          query('start_date', genericErrors.INVALID_DATE)
          .exists(),
          query('start_date')
          .custom((day) => {
            if (day && moment(day, 'DD-MM-YYYY', true).isValid() === false) {
              return Promise.reject(genericErrors.INVALID_DATE);
            }          
            return Promise.resolve(day);
          }),
          query('end_date', genericErrors.INVALID_DATE)
          .exists(),
          query('end_date')
          .custom((day) => {
            if (day && moment(day, 'DD-MM-YYYY', true).isValid() === false) {
              return Promise.reject(genericErrors.INVALID_DATE);
            }          
            return Promise.resolve(day);
          })
        ]
      };
    }
}