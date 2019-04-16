const { query } = require('express-validator/check');
const moment = require('moment');
const { genericErrors, validationHandler } = require('./message-validators');
const fileHandler = require('./utils/file-utils');
const { overlapSegments } = require('./utils/date');
const lodash = require('lodash');
const pluralModel = 'available-schedules';
const defaultRowReturn = {data:{}};

const newContextJson = json => {
  const stringiFy = JSON.stringify(json);
  return JSON.parse(stringiFy);
};

const returnPluralRow = (array, res) => {
  res.set('Content-Type', 'application/json');
  const returnData = newContextJson(defaultRowReturn);
  returnData.data[pluralModel] = array;
  return returnData;
}

exports.getAvailableSchedules = (req, res, next) => {
  req
  .getValidationResult()
  .then(validationHandler())
  .then(() => {
    const availableSchedules = filterAvailableSchedules(start_date, end_date);
    res.send({"getRules": "ok"});
  })
  .catch(next)
}



const filterAvailableSchedules = (start_date, end_date) => {
  const dataBase = newContextJson(fileHandler.getDatabase());
  const rules = lodash.filter(
    dataBase.data, 
    index => {
      if (!type && !start_time && !end_time) {
        return true;
      }

      if (
        (type && index.type === type && typeof rule_name === "undefined") ||
        (rule_name && index.rule_name === rule_name && typeof type === "undefined") ||
        (
          rule_name && index.rule_name === rule_name && 
          type && index.type === type
        )
      ) {
        index.intervals = filterIntervals(index.intervals, start_time, end_time);
        return (index.intervals.length > 0);
      } else if (typeof rule_name === "undefined" && typeof type === "undefined") {
        index.intervals = filterIntervals(index.intervals, start_time, end_time);
        return (index.intervals.length > 0);
      } else {
        return false;
      }
    }
  );
  return rules;
}

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