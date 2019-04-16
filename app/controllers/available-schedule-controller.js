const { query } = require('express-validator/check');
const moment = require('moment');
const { genericErrors, validationHandler } = require('./message-validators');

exports.getAvailableSchedules = (req, res, next) => {
  req
  .getValidationResult()
  .then(validationHandler())
  .then(() => {
    console.log(req);
    res.send({"getRules": "ok"});
  })
  .catch(next)
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