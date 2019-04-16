const fs = require('fs');
const path = require('path');
const databasePath = path.join(__dirname, '/../../database/rules.json');

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

/**
 * getDatabase JSON
 * @return {object} - json
 */
const getDatabase = () => {
  verifyAndCreate();

  //more optimized than JSON.parse
  return require(databasePath);
};

/**
 * Verify and Create a database JSON
 * 
 */
const verifyAndCreate = () => {
  if (!fs.existsSync(databasePath)) {
    const defaultData = {
      "data": [],
      "count": 0
    };
    fs.createWriteStream(databasePath);
    fs.writeFileSync(databasePath, JSON.stringify(defaultData));
  }
  return true;
}

module.exports = {
  insertDataArrayToDataBase,
  insertRuleToDataBase,
  getDatabase,
  verifyAndCreate
}