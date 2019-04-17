const { body, query, param } = require('express-validator/check');
const moment = require('moment');
const slugify = require('slugify');
const lodash = require('lodash');
const {
  genericErrors,
  validateTime,
  validationHandler
} = require('./message-validators');
const fileHandler = require('./utils/file-utils');
const { overlapSegments } = require('./utils/date');
const {
  returnPluralRow,
  returnSingularRow,
  newContextJson
} = require('./utils/json');

const singularModel = 'rule';
const pluralModel = 'rules';

/**
 * Verify if end_time is greater than start_time
 *
 * @param {array} intervals - Array of request.body.intervals
 * @param {func} next - Callback
 */
const verifyIntervalEntry = (intervals, next) => {
  const tamInterval = intervals.length;
  for (let i = 0; i < tamInterval; i += 1) {
    const startSplit = intervals[i].start_time.split(':');
    const endSplit = intervals[i].end_time.split(':');
    if (
      startSplit[0] > endSplit[0] ||
      (startSplit[0] === endSplit[0] && startSplit[1] >= endSplit[1])
    ) {
      const error = new Error(
        `intervals[${i}].end_time deve ser maior que intervals[${i}].start_time`
      );
      error.statusCode = 422;
      error.code = 'INVALID_FIELD';
      return next(error);
    }
  }
  return true;
};

/**
 * Verify if exists a rule with a rule_name
 *
 * @param {string} rule_name - rule_name for verify
 * @return {boolean} true, false
 */
const verifyRuleName = rule_name => {
  let returnVerify = false;
  const dataBase = newContextJson(fileHandler.getDatabase());
  const rules = lodash.filter(
    dataBase.data,
    index => index.rule_name === rule_name
  );
  if (rules.length > 0) {
    returnVerify = true;
  }
  return returnVerify;
};

/**
 * Verify if exists a rule with an id
 *
 * @param {string} rule_id - Id for removes rules
 * @return {array} rules without rule id
 */
const verifyRuleId = rule_id => {
  let returnVerify = false;
  const dataBase = newContextJson(fileHandler.getDatabase());
  const rules = lodash.filter(dataBase.data, index => index.id === rule_id);
  if (rules.length > 0) {
    returnVerify = true;
  }
  return returnVerify;
};

/**
 * Deletes a rule inside database Rules
 *
 * @param {string} rule_id - Id for removes rules
 * @return {array} rules without rule id
 */
const deleteById = rule_id => {
  const dataBase = newContextJson(fileHandler.getDatabase());
  const rules = lodash.filter(dataBase.data, index => index.id !== rule_id);
  return rules;
};

/**
 * Filter interval_range of datas
 *
 * @param {array} intervals - Array of Intervals
 * @param {string} start_time - Start Time Interval
 * @param {string} end_time - End Time Interval
 * @return {Promise} reject,resolve
 */
const filterIntervals = (intervals, start_time, end_time) => {
  let timeSegments;
  return intervals.filter(element => {
    if (!start_time && !end_time) {
      return true;
    }
    if (start_time && !end_time && start_time === element.start_time) {
      return true;
    }
    timeSegments = [];
    timeSegments.push([element.start_time, element.end_time]);
    timeSegments.push([start_time, end_time]);
    return overlapSegments(timeSegments);
  });
};

/**
 * Filter rules on database json of rules
 *
 * @param {string} type - Type for filter
 * @param {string} start_time - Start Time Interval
 * @param {string} end_time - End Time Interval
 * @param {string} rule_name - Rule Name for filter
 * @return {array} rules
 */
const filterRules = (start_time, end_time, type, rule_name, specific_day) => {
  const dataBase = newContextJson(fileHandler.getDatabase());
  let newIntervals;
  const rules = lodash.filter(dataBase.data, index => {
    if (!type && !start_time && !end_time) {
      return true;
    }

    if (
      (type &&
        index.type === type &&
        typeof rule_name === 'undefined' &&
        typeof specific_day === 'undefined') ||
      (rule_name &&
        index.rule_name === rule_name &&
        typeof type === 'undefined' &&
        typeof specific_day === 'undefined') ||
      (specific_day &&
        index.specific_day === specific_day &&
        typeof rule_name === 'undefined' &&
        typeof type === 'undefined' &&
        typeof specific_day === 'undefined') ||
      (rule_name &&
        index.rule_name === rule_name &&
        type &&
        index.type === type &&
        specific_day &&
        index.specific_day === specific_day) ||
      (rule_name &&
        index.rule_name === rule_name &&
        type &&
        index.type === type &&
        typeof specific_day === 'undefined') ||
      (rule_name &&
        index.rule_name === rule_name &&
        specific_day &&
        index.specific_day === specific_day &&
        typeof type === 'undefined') ||
      (type &&
        index.type === type &&
        specific_day &&
        index.specific_day === specific_day &&
        typeof rule_name === 'undefined')
    ) {
      newIntervals = filterIntervals(index.intervals, start_time, end_time);
      return newIntervals.length > 0;
    }
    if (
      typeof specific_day === 'undefined' &&
      typeof rule_name === 'undefined' &&
      typeof type === 'undefined'
    ) {
      newIntervals = filterIntervals(index.intervals, start_time, end_time);
      return newIntervals.length > 0;
    }
    return false;
  });
  return rules;
};

/**
 * verifySegments on interval range
 *
 * @param {array} intervals - Interval rules
 * @param {string} type - Type for check - used on specific_day
 * @param {string} specific_day - Day specific on rule
 * @param {object} status, message - {true/false,string}
 */
const verifySegments = (intervals, type, specific_day) => {
  const tamIntervals = intervals.length;
  let rules;
  for (let i = 0; i < tamIntervals; i += 1) {
    if (type === 'specific_day') {
      rules = lodash.merge(
        filterRules(intervals[i].start_time, intervals[i].end_time, 'daily'),
        filterRules(intervals[i].start_time, intervals[i].end_time, 'weekly'),
        filterRules(
          intervals[i].start_time,
          intervals[i].end_time,
          'specific_day',
          undefined,
          specific_day
        )
      );
    } else {
      rules = filterRules(intervals[i].start_time, intervals[i].end_time);
    }
    if (rules.length > 0) {
      return {
        status: false,
        message: `Já existe a regra: '${
          rules[0].rule_name
        }' neste mesmo intervalo de tempo`
      };
    }
  }

  return { status: true };
};

/**
 * Action createRule
 *
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
exports.createRule = (req, res, next) => {
  req
    .getValidationResult()
    .then(validationHandler())
    .then(() => {
      const { type, specific_day, intervals, week_days, rule_name } = req.body;
      verifyIntervalEntry(intervals, next);
      if (verifyRuleName(rule_name)) {
        const error = new Error(
          'Já existe regra com a mesma rule_name cadastrada. \n' +
            'Por favor digite outra e tente novamente'
        );
        error.statusCode = 403;
        error.code = 'RULE_EXISTS';
        return next(error);
      }
      //Faz a validação de regras if header x-validate-intervals = true
      if (req.get('x-validate-intervals') === 'true') {
        const segments = verifySegments(intervals, type, specific_day);
        if (segments.status === false) {
          const err = new Error(segments.message);
          err.statusCode = 403;
          err.code = 'RULE_EXISTS';
          return next(err);
        }
      }
      const dataInsert = {
        id: slugify(rule_name),
        rule_name,
        type,
        specific_day: specific_day || null,
        intervals,
        week_days: week_days || null
      };

      fileHandler.insertRuleToDataBase(dataInsert);
      return res.send(returnSingularRow(dataInsert, singularModel, res));
    })
    .catch(next);
};

/**
 * Action getRules
 *
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
exports.getRules = (req, res, next) => {
  req
    .getValidationResult()
    .then(validationHandler())
    .then(() => {
      const { type, start_time, end_time, rule_name } = req.query;
      const rules = filterRules(start_time, end_time, type, rule_name);
      res.send(returnPluralRow(rules, pluralModel, res));
    })
    .catch(next);
};

/**
 * Action deleteRule
 *
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
exports.deleteRule = (req, res, next) => {
  req
    .getValidationResult()
    .then(validationHandler())
    .then(() => {
      const { id } = req.params;
      if (verifyRuleId(id) === false) {
        const error = new Error(
          `Não existe rule com ID: ${id}. \n` +
            'Por favor digite outro e tente novamente'
        );
        error.statusCode = 403;
        error.code = 'INVALID_ID';
        return next(error);
      }
      const newDatabase = deleteById(id);
      fileHandler.insertDataArrayToDataBase(newDatabase);

      res.set('Content-Type', 'application/json');
      return res
        .status(202)
        .send({ status: 'ok', message: 'Rule deletada com sucesso' });
    })
    .catch(next);
};

/**
 * Validates API inputs on querys and request_data
 *
 * @param {string} method - createRule, getRules, deleteRule
 * @return {Promise} reject,resolve
 */
exports.validate = method => {
  switch (method) {
    case 'createRule': {
      return [
        body('rule_name', genericErrors.NOT_EXISTS).exists(),
        body('rule_name', genericErrors.THREE_CHARACTERS_MIN).isLength({
          min: 3
        }),
        body('type', genericErrors.NOT_EXISTS).exists(),
        body('type', genericErrors.NOT_VALID).isIn([
          'specific_day',
          'daily',
          'weekly'
        ]),
        body('week_days', genericErrors.NOT_VALID)
          .optional()
          .isIn([
            'monday',
            'tuesday',
            'wednesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday'
          ]),
        body('week_days').custom((week_days, { req }) => {
          const { type } = req.body;
          if (
            (type && type === 'weekly' && typeof week_days === 'undefined') ||
            week_days === ''
          ) {
            return Promise.reject(genericErrors.NOT_EXISTS);
          }
          return Promise.resolve(week_days);
        }),
        body('specific_day').custom((day, { req }) => {
          const { type } = req.body;
          if (
            (type && type === 'specific_day' && typeof day === 'undefined') ||
            day === ''
          ) {
            return Promise.reject(genericErrors.NOT_EXISTS);
          }
          if (day && moment(day, 'DD-MM-YYYY', true).isValid() === false) {
            return Promise.reject(genericErrors.INVALID_DATE);
          }
          return Promise.resolve(day);
        }),
        body('intervals', genericErrors.NOT_EXISTS).exists(),
        body('intervals', genericErrors.NOT_ARRAY).isArray(),
        body('intervals', genericErrors.NOT_ARRAY).custom(intervals => {
          if (intervals.length === 0) {
            return Promise.reject(genericErrors.INVALID_FIELD);
          }
          return Promise.resolve(intervals);
        }),
        body('intervals.*.start_time', genericErrors.NOT_EXISTS).exists(),
        body('intervals.*.start_time').custom(start_time => {
          if (start_time && validateTime(start_time) === false) {
            return Promise.reject(genericErrors.INVALID_FIELD);
          }
          if (typeof start_time === 'undefined') {
            return Promise.reject(genericErrors.NOT_EXISTS);
          }
          return Promise.resolve(start_time);
        }),
        body('intervals.*.end_time', genericErrors.NOT_EXISTS).exists(),
        body('intervals.*.end_time').custom(end_time => {
          if (end_time && validateTime(end_time) === false) {
            return Promise.reject(genericErrors.INVALID_FIELD);
          }
          if (typeof end_time === 'undefined') {
            return Promise.reject(genericErrors.NOT_EXISTS);
          }
          return Promise.resolve(end_time);
        })
      ];
    }
    case 'getRules': {
      return [
        query('type', genericErrors.NOT_VALID)
          .optional()
          .isIn(['specific_day', 'daily', 'weekly']),

        query('rule_name', genericErrors.NOT_VALID).optional(),
        query('specific_day')
          .optional()
          .custom(day => {
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
          if (end_time && validateTime(end_time) === false) {
            return Promise.reject(genericErrors.INVALID_FIELD);
          }
          return Promise.resolve(end_time);
        })
      ];
    }
    case 'deleteRule': {
      return [param('id', genericErrors.NOT_VALID).exists()];
    }
    default: {
      return [];
    }
  }
};
