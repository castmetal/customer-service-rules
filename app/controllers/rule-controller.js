const { body, query, param } = require('express-validator/check');
const moment = require('moment');
const slugify = require('slugify');
const lodash = require('lodash');
const { genericErrors, validateTime, validationHandler } = require('./message-validators');
const fileHandler = require('./utils/file-utils');
const { overlapSegments } = require('./utils/date');
const singularModel = 'rule';
const pluralModel = 'rules';
const defaultRowReturn = {data:{}};

const newContextJson = json => {
  const stringiFy = JSON.stringify(json);
  return JSON.parse(stringiFy);
};

const returnSingularRow = (row, res) => {
  res.set('Content-Type', 'application/json');
  const returnData = newContextJson(defaultRowReturn);
  returnData.data[singularModel] = row;
  return returnData;
}

const returnPluralRow = (array, res) => {
  res.set('Content-Type', 'application/json');
  const returnData = newContextJson(defaultRowReturn);
  returnData.data[pluralModel] = array;
  return returnData;
}

const verifyIntervalEntry = (intervals, next) => {
  const tamInterval = intervals.length;
  for (let i = 0; i < tamInterval; i += 1) {
    const startSplit = intervals[i].start_time.split(':');
    const endSplit = intervals[i].end_time.split(':');
    if (
      (startSplit[0] > endSplit[0]) ||
      (startSplit[0] === endSplit[0] && startSplit[1] >= endSplit[1])
    ) {
      const error = new Error(`intervals[${i}].end_time deve ser maior que intervals[${i}].start_time`);
      error.statusCode = 422;
      error.code = "INVALID_FIELD";
      return next(error);
    }
  }
}

exports.createRule = (req, res, next) => {
  req
  .getValidationResult()
  .then(validationHandler())
  .then(() => {
    const { type, specific_day, intervals, week_days, rule_name } = req.body;
    verifyIntervalEntry(intervals, next);
    if (verifyRuleName(rule_name)) {
      const error = new Error(
        'Já existe regra com a mesma rule_name cadastrada. \n'+
        'Por favor digite outra e tente novamente'
      );
      error.statusCode = 403;
      error.code = 'RULE_EXISTS';
      return next(error);
    }
    const dataInsert = {
      id: slugify(rule_name),
      rule_name,
      type,
      specific_day: specific_day || null,
      intervals,
      week_days: week_days || null,
    };

    fileHandler.insertRuleToDataBase(dataInsert);
    res.send(returnSingularRow(dataInsert, res));
  })
  .catch(next)
}

exports.getRules = (req, res, next) => {
  req
  .getValidationResult()
  .then(validationHandler())
  .then(() => {
    const { type, start_time, end_time, rule_name } = req.query;
    const roles = filterRules(type, start_time, end_time, rule_name);
    res.send(returnPluralRow(roles, res));
  })
  .catch(next)
}

exports.deleteRule = (req, res, next) => {
  req
  .getValidationResult()
  .then(validationHandler())
  .then(() => {
    const { id } = req.params;
    if (verifyRuleId(id) === false) {
      const error = new Error(
        `Não existe rule com ID: ${id}. \n`+
        'Por favor digite outro e tente novamente'
      );
      error.statusCode = 403;
      error.code = 'INVALID_ID';
      return next(error);
    }
    const newDatabase = deleteById(id);
    fileHandler.insertDataArrayToDataBase(newDatabase);

    res.set('Content-Type', 'application/json');
    res.send({"status": "ok", "message": "Rule deletada com sucesso"}, 202);
  })
  .catch(next)
}

const verifyRuleName = (rule_name) => {
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
}

const verifyRuleId = (rule_id) => {
  let returnVerify = false;
  const dataBase = newContextJson(fileHandler.getDatabase());
  const rules = lodash.filter(
    dataBase.data, 
    index => index.id === rule_id
  );
  if (rules.length > 0) {
    returnVerify = true;
  }
  return returnVerify;
}

const deleteById = (rule_id) => {
  const dataBase = newContextJson(fileHandler.getDatabase());
  const rules = lodash.filter(
    dataBase.data, 
    index => index.id !== rule_id
  );
  return rules;
}

const filterRules = (type, start_time, end_time, rule_name) => {
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

const filterIntervals = (intervals, start_time, end_time) => {
  let timeSegments;
  intervals = intervals.filter(element => {
    if (!start_time && !end_time) {
      return true;
    }
    if (start_time && !end_time && start_time === element.start_time) {
      return true;
    } else {
      timeSegments = [];
      timeSegments.push([element.start_time, element.end_time]);
      timeSegments.push([start_time, end_time]);
      return overlapSegments(timeSegments);
    }
  });

  return intervals;
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
        .optional()
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
        body('intervals', genericErrors.NOT_EXISTS)
        .exists(),
        body('intervals', genericErrors.NOT_ARRAY)
        .isArray(),
        body('intervals', genericErrors.NOT_ARRAY)
        .custom(intervals => {
          if (intervals.length === 0) {
            return Promise.reject(genericErrors.INVALID_FIELD);
          }
          return Promise.resolve(intervals);
        }),
        body('intervals.*.start_time', genericErrors.NOT_EXISTS).exists(),
        body('intervals.*.start_time').custom(start_time => {
          if (start_time && validateTime(start_time) === false) {
            return Promise.reject(genericErrors.INVALID_FIELD);
          } else if (typeof start_time === "undefined") {
            return Promise.reject(genericErrors.NOT_EXISTS);
          }
          return Promise.resolve(start_time);
        }),
        body('intervals.*.end_time', genericErrors.NOT_EXISTS).exists(),
        body('intervals.*.end_time').custom(end_time => {
          if (end_time && validateTime(end_time) === false) {
            return Promise.reject(genericErrors.INVALID_FIELD);
          } else if (typeof end_time === "undefined") {
            return Promise.reject(genericErrors.NOT_EXISTS);
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

        query('rule_name', genericErrors.NOT_VALID)
        .optional(),
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
          if (end_time && validateTime(end_time) === false) {
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