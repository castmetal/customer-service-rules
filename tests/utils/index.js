const getValidationResult = async () => {
  return false;
};
const makeRequest = params => {
  const req = { body: {}, query: {}, param: {} };
  if (params && params.body) {
    req.body = params.body;
  }
  if (params && params.query) {
    req.param = params.query;
  }
  if (params && params.param) {
    req.param = params.param;
  }
  req.getValidationResult = getValidationResult;
  return req;
};

module.exports = {
  makeRequest
};
