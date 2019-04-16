const fs = require('fs');
const path = require('path');
const databasePath = path.join(__dirname, '/../../database/rules.json');

const insertRuleToDataBase = json => {
  const dataBase = getDatabase();
  dataBase.data.push(json);
  dataBase.count += 1;
  fs.writeFileSync(databasePath, JSON.stringify(dataBase));
};

const insertDataArrayToDataBase = json => {
  const dataBase = getDatabase();
  dataBase.data = json;
  dataBase.count = data.length;
  fs.writeFileSync(databasePath, JSON.stringify(dataBase));
};

const getDatabase = () => {
  verifyAndCreate();

  //more optimized than JSON.parse
  return require(databasePath);
};

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