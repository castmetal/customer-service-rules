const getValidationResult = async () => {
  Request.prototype.then = function(resolve, reject) {
    var self = this;
    return new Promise(function(resolve, reject){
      self.end(function(err, res){
        if (err) reject(err); else resolve(res);
      });
    })
    .then(resolve, reject);
  };
}
const makeRequest = params => {
  const req = {body:{},query:{},param:{}};
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
}