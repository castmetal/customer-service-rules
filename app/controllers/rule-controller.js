const { body, query, param } = require('express-validator/check');
const moment = require('moment');
const { genericErrors, validateTime, validationHandler } = require('./message-validators');

exports.createRule = (req, res, next) => {
  req
  .getValidationResult()
  .then(validationHandler())
  .then(() => {
    console.log(req);
    res.send({"createRule": "ok"});
  })
  .catch(next)
}

exports.getRules = (req, res, next) => {
  req
  .getValidationResult()
  .then(validationHandler())
  .then(() => {
    console.log(req);
    res.send({"getRules": "ok"});
  })
  .catch(next)
}

exports.deleteRule = (req, res, next) => {
  req
  .getValidationResult()
  .then(validationHandler())
  .then(() => {
    console.log(req);
    res.send({"deleteRule": "ok"});
  })
  .catch(next)
}

exports.validate = method => {
  switch (method) {
    case 'createRule': {
      return [ 
        body('rule_name', genericErrors.NOT_EXISTS)
        .exists(),
        body('rule_name', genericErrors.THREE_CHARACTERS_MIN)
        .isLength({ min: 3 }),
        body('type', genericErrors.NOT_EXISTS)
        .exists(),
        body('type', genericErrors.NOT_VALID)
        .isIn(['specific_day', 'daily', 'weekly']),
        body('week_days', genericErrors.NOT_VALID)
        .isIn(['monday', 'tuesday', 'wednesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        body('week_days')
        .custom((week_days, {req}) => {
          const { type } = req.body;
          if (
            type &&
            type === 'week_days' &&
            typeof week_days === "undefined" || week_days === ""
          ) {
            return Promise.reject(genericErrors.NOT_EXISTS);
          }
          return Promise.resolve(week_days);
        }),
        body('specific_day')
        .custom((day, {req}) => {
          const { type } = req.body;
          if (
            type &&
            type === 'specific_day' &&
            typeof day === "undefined" || day === ""
          ) {
            return Promise.reject(genericErrors.NOT_EXISTS);
          } else {
            if (day && moment(day, 'DD-MM-YYYY', true).isValid() === false) {
              return Promise.reject(genericErrors.INVALID_DATE);
            }
          }
          return Promise.resolve(day);
        }),
        body('start_time', genericErrors.NOT_EXISTS).exists(),
        body('start_time').custom(start_time => {
          if (start_time && validateTime(start_time) === false) {
            return Promise.reject(genericErrors.INVALID_FIELD);
          }
          return Promise.resolve(start_time);
        }),
        body('end_time', genericErrors.NOT_EXISTS).exists(),
        body('end_time').custom(end_time => {
          if (end_time && validateTime(end_time)) {
            return Promise.reject(genericErrors.INVALID_FIELD);
          }
          return Promise.resolve(end_time);
        })
      ];
    };
    case 'getRules': {
      return [
        query('type', genericErrors.NOT_VALID)
        .optional()
        .isIn(['specific_day', 'daily', 'weekly']),
        query('specific_day')
        .optional()
        .custom((day) => {
          if (day && moment(day, 'DD-MM-YYYY', true).isValid() === false) {
            return Promise.reject(genericErrors.INVALID_DATE);
          }          
          return Promise.resolve(day);
        }),
        query('start_time').custom(start_time => {
          if (start_time && validateTime(start_time) === false) {
              return Promise.reject(genericErrors.INVALID_FIELD);
          }
          return Promise.resolve(start_time);
        }),
        query('end_time').custom(end_time => {
          if (end_time && validateTime(end_time)) {
              return Promise.reject(genericErrors.INVALID_FIELD);
          }
          return Promise.resolve(end_time);
        })
      ]
    };
    case 'deleteRule': {
      return [
        param('id', genericErrors.NOT_VALID)
        .exists()
      ]
    }
  }
}