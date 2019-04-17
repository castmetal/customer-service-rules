const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, '/../../database/rules.json');

/**
 * Verify and Create a database JSON
 *
 */
const verifyAndCreate = () => {
  if (!fs.existsSync(databasePath)) {
    const defaultData = {
      data: [],
      count: 0
    };
    fs.createWriteStream(databasePath);
    fs.writeFileSync(databasePath, JSON.stringify(defaultData));
  }
  return true;
};

/**
 * getDatabase JSON
 * @return {object} - json
 */
const getDatabase = () => {
  verifyAndCreate();

  const data = fs.readFileSync(databasePath);
  return JSON.parse(data);
};

/**
 * Insert a row at database on json
 *
 * @param {object} - row json
 */
const insertRuleToDataBase = json => {
  const dataBase = getDatabase();
  dataBase.data.push(json);
  dataBase.count += 1;
  fs.writeFileSync(databasePath, JSON.stringify(dataBase));
};

/**
 * Insert full database on json
 *
 * @param {object} - json
 */
const insertDataArrayToDataBase = json => {
  const dataBase = getDatabase();
  dataBase.data = json;
  dataBase.count = json.length;
  fs.writeFileSync(databasePath, JSON.stringify(dataBase));
};

module.exports = {
  insertDataArrayToDataBase,
  insertRuleToDataBase,
  getDatabase,
  verifyAndCreate
};
