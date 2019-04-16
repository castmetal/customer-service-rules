const utils = require('./utils');
let req;
const path = require('path');
const fs = require('fs');
beforeEach(async () => {
  req = utils.makeRequest();
  const databasePath = path.join(__dirname, '/../app/database/rules.json');
  if (fs.existsSync(databasePath)) {
    await fs.unlink(databasePath);
  }
});

describe("rules controller", () => {
  
  it("verifyIntervalEntry start_time greater than end_time", async () => {
    
  });
});