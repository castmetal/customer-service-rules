const { body } = require('express-validator/check');
const moment = require('moment');
const validateMessages = {
  NOT_EXISTS: 'não existe',
  THREE_CHARACTERS_MIN: 'deve possuir, pelo menos 3 caracteres',
  NOT_VALID: 'não é válido',
  INVALID_FIELD: 'é inválido',
  INVALID_DATE: 'é uma data inválida'
};

exports.validateMessages = validateMessages;

exports.validate = method => {
  switch (method) {
    case 'createRule': {
      return [ 
        body('rule_name', validateMessages.NOT_EXISTS)
        .exists(),
        body('rule_name', validateMessages.THREE_CHARACTERS_MIN)
        .isLength({ min: 3 }),
        body('type', validateMessages.NOT_EXISTS)
        .exists(),
        body('type', validateMessages.NOT_VALID)
        .isIn(['specific_day', 'daily', 'weekly']),
        body('week_days', validateMessages.NOT_VALID)
        .isIn(['monday', 'tuesday', 'wednesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        body('week_days')
        .custom((week_days, {req}) => {
          const { type } = req.body;
          if (
            type &&
            type === 'week_days' &&
            typeof week_days === "undefined" || week_days === ""
          ) {
            return Promise.reject(validateMessages.NOT_EXISTS)
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
            return Promise.reject(validateMessages.NOT_EXISTS)
          } else {
            if (day && moment(day, 'DD-MM-YYYY', true).isValid() === false) {
              return Promise.reject(validateMessages.INVALID_DATE);
            }
          }
          return Promise.resolve(day);
        }),
        body('start_time', validateMessages.NOT_EXISTS).exists(),
        body('start_time').custom(start_time => {
          if (validateTime(start_time) === false) {
              return Promise.reject(validateMessages.INVALID_FIELD)
          }
          return Promise.resolve(start_time);
        }),
        body('end_time', 'end_time não existe').exists(),
        body('end_time').custom(end_time => {
          if (end_time && validateTime(end_time)) {
              return Promise.reject(validateMessages.INVALID_FIELD)
          }
          return Promise.resolve(end_time);
        })
      ];
    }
  }
}

exports.createRule = (req, res, next) => {
  req
  .getValidationResult()
  .then(validationHandler())
  .then(() => {
     console.log(req);
     next();
  })
  .catch(next)
}

const validationHandler = next => result => {
  if (result.isEmpty()) return;
  const error = new Error(result.array().map(i => `${i.param} - ${i.msg}`).join('|'));
  error.statusCode = 422;
  error.code = "INVALID_FIELD";
  if (!next) {
    throw error;
  } else {
    return next(error);
  }
}

const validateTime = time => {
  let validReturn = true;
  const splitTime = time.split(':');
  if (
    (splitTime.length === 0 || splitTime.length > 2) ||
    (parseInt(splitTime[0]) > 23 || parseInt(splitTime[0]) < 1) ||
    (parseInt(splitTime[1]) > 59 || parseInt(splitTime[1]) < 1)
  ){
    validReturn = false;
  }
  return validReturn;
};