let createError = require('http-errors');
let express = require('express');
let logger = require('morgan');
let indexRouter = require('./routes/index');
let rulesRouter = require('./routes/rules');
let app = express();
const environment = process.env.NODE_ENV || 'dev';
const basePath = process.env.SERVICE_PATH || '/customer-service';
app.use(logger(environment));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use(`${basePath}/rules`, rulesRouter);

/**
 * Generates errors on not found paths
 * 
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
app.use((req, res, next) => {
  const error = new Error('Página não encontrada');
  error.statusCode = 404;
  error.code = "PAGE_NOTFOUND";

  next(error);
});

/**
 * Error handler on server
 * 
 * @param {object} err - Error
 * @param {object} req - Request HTTP
 * @param {object} res - HTTP Response
 * @param {func} next - Callback
 */
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.statusCode || 500);
  res.send({ errors: [
    {"message": err.message,"code": err.code}
  ]});
});

module.exports = app;
