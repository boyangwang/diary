// third-party
const { MongoClient } = require('mongodb');
const http = require('http');
const _ = require('lodash');
const destroyable = require('server-destroy');
const Koa = require('koa');
const koaBody = require('koa-bodyparser');
const session = require('koa-session');
const logger = require('koa-logger');
const cors = require('koa2-cors');
const router = require('koa-router')();
const passport = require('koa-passport');
// own dependencies
const auth = require('./auth');
const entry = require('./entry');
const todo = require('./todo');
const errReport = require('./errReport');
// conf
const config = require('./config');
const packagejson = require('../package.json');

let app, db;

const getApiTest = async (ctx, next) => {
  ctx.response.body = {
    data: {
      user: ctx.state.user || null,
      backendVersion: packagejson.version,
    },
  };
};

/**
 * when used as a module. opt passed in will take precedence
 * @param {*} opt
 */
const main = async (opt = {}) => {
  app = new Koa();
  const mergedConfig = Object.assign({}, config, opt);
  const mongoUrl = `mongodb://localhost:27017/${mergedConfig.dbName}`;
  app.keys = mergedConfig.keys;
  db = await MongoClient.connect(mongoUrl);

  app.use(logger());
  app.use(koaBody());
  app.use(session(mergedConfig.sessionConfig, app));
  app.use(passport.initialize());
  auth.init();
  app.use(passport.session());
  app.use(async (ctx, next) => {
    ctx.response.type = 'json';
    await next();
  });
  // apiTest
  router.get('/api/apiTest', getApiTest);
  // auth
  router.post('/api/login', auth.authenticateCallback);
  router.post('/api/logout', async (ctx) => {
    await ctx.logout();
    ctx.response.status = 200;
    ctx.response.body = { data: { user: null }};
  });
  if (mergedConfig.useAuth) {
    router.use(
      ['/api/getEntries', '/api/postEntry', '/api/deleteEntry'],
      auth.verifyAuthenticated
    );
  }
  // diary
  entry.init(app, db);
  router.use(
    ['/api/getEntries', '/api/postEntry', '/api/deleteEntry'],
    entry.validateParams
  );
  router.use(
    ['/api/getEntries', '/api/postEntry', '/api/deleteEntry'],
    entry.validateOwner
  );
  router.use(['/api/getEntries'], entry.validateDate);
  router.use(['/api/postEntry', '/api/deleteEntry'], entry.validateEntry);
  router.get('/api/getEntries', entry.getEntries);
  router.post('/api/postEntry', entry.postEntry);
  router.post('/api/deleteEntry', entry.deleteEntry);
  // todo
  todo.init(app, db);
  router.use(
    ['/api/getTodos', '/api/postTodo', '/api/deleteTodo'],
    todo.validateParams
  );
  router.use(
    ['/api/getTodos', '/api/postTodo', '/api/deleteTodo'],
    todo.validateOwner
  );
  router.use(['/api/postTodo', '/api/deleteTodo'], todo.validateTodo);
  router.get('/api/getTodos', todo.getTodos);
  router.post('/api/postTodo', todo.postTodo);
  router.post('/api/deleteTodo', todo.deleteTodo);
  // errReport
  errReport.init(app, db);
  router.post('/api/errReport', errReport.post);
  // router wrap-up
  app.use(router.routes());
  app.use(router.allowedMethods());

  return new Promise((resolve) => {
    let server = http.createServer(app.callback());
    server.listen(mergedConfig.port, () => {
      console.log(`--------------- diary-back ver: `, packagejson.version);
      console.log(`Listening on ${mergedConfig.port}`);
      app.dbConnection = db;
      destroyable(server);
      app.httpServer = server;
      resolve(app);
    });
  });
};

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
