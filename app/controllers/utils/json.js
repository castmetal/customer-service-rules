const defaultRowReturn = { data: {} };

/**
 * Returns a new context json
 *
 * @param {object} json - original json
 * @return {object} json - new context json
 */
const newContextJson = json => {
  const stringiFy = JSON.stringify(json);
  return JSON.parse(stringiFy);
};

/**
 * Pluralize return data with json_apis
 *
 * @param {object} row - returned Row
 * @param {string} pluralModel - model on ṕlural
 * @param {func} res - Response
 * @return {array} Formated Json
 */
const returnPluralRow = (array, pluralModel, res) => {
  res.set('Content-Type', 'application/json');
  const returnData = newContextJson(defaultRowReturn);
  returnData.data[pluralModel] = array;
  return returnData;
};

/**
 * Singularize return data with json_apis
 *
 * @param {object} row - returned Row
 * @param {string} singularModel - model on singular
 * @param {func} res - Response
 * @return {array} Formated Json
 */
const returnSingularRow = (row, singularModel, res) => {
  res.set('Content-Type', 'application/json');
  const returnData = newContextJson(defaultRowReturn);
  returnData.data[singularModel] = row;
  return returnData;
};

module.exports = {
  newContextJson,
  returnPluralRow,
  returnSingularRow
};
