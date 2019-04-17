const genericErrors = {
  NOT_EXISTS: 'não existe',
  THREE_CHARACTERS_MIN: 'deve possuir, pelo menos 3 caracteres',
  NOT_VALID: 'não é válido',
  INVALID_FIELD: 'é inválido',
  INVALID_DATE: 'é uma data inválida',
  NOT_ARRAY: 'não é um array'
};

const validateTime = time => {
  let validReturn = true;
  const splitTime = time.split(':');
  if (
    splitTime.length === 0 ||
    splitTime.length > 2 ||
    (parseInt(splitTime[0], 10) > 23 || parseInt(splitTime[0], 10) < 0) ||
    (parseInt(splitTime[1], 10) > 59 || parseInt(splitTime[1], 10) < 0)
  ) {
    validReturn = false;
  }
  return validReturn;
};

const validationHandler = next => result => {
  if (result.isEmpty()) return;
  const error = new Error(
    result
      .array()
      .map(i => `${i.param} - ${i.msg}`)
      .join('|')
  );
  error.statusCode = 422;
  error.code = 'INVALID_FIELD';
  if (!next) {
    throw error;
  }
  return next(error);
};

module.exports = {
  genericErrors,
  validateTime,
  validationHandler
};
