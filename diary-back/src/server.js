// polyfill etc
require('isomorphic-fetch');
console.mylog = (...args) => {
  process.stdout.write(new Date().toISOString() + ' | ');
  console.info(...args);
};
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
const errReport = require('./errReport');
const upload = require('./upload');
const entry = require('./entry');
const todo = require('./todo');
const reminder = require('./reminder');
const digest = require('./digest');
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
const graphql = async (ctx, next) => {
  ctx.response.body = {
    data: {},
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

  app.use(
    logger(function(str, args) {
      console.mylog(...args);
    })
  );
  app.use(
    koaBody({
      enableTypes: ['json', 'form', 'text'],
    })
  );
  app.use(
    cors({
      credentials: true,
    })
  );
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
  router.post('/api/graphql', graphql);
  // auth
  router.post('/api/login', auth.authenticateCallback);
  router.post('/api/logout', auth.logout);
  router.get('/api/oauth/github', auth.oauthGithub);
  router.get('/api/oauth/github/callback', auth.oauthGithubCallback);
  if (mergedConfig.useAuth) {
    router.use(
      [
        '/api/getEntries',
        '/api/postEntry',
        '/api/deleteEntry',
        '/api/getCategoryFrequencyMap',
        '/api/getStreaks',
        '/api/getHistoricalStreaks',

        '/api/getTodo',
        '/api/getTodos',
        '/api/postTodo',
        '/api/deleteTodo',

        '/api/getReminder',
        '/api/getReminders',
        '/api/postReminder',
        '/api/deleteReminder',

        '/api/getDigest',
        '/api/getDigests',
        '/api/postDigest',
        '/api/deleteDigest',
        '/api/uploadImage',
      ],
      auth.verifyAuthenticated
    );
    router.use(
      [
        '/api/getEntries',
        '/api/postEntry',
        '/api/deleteEntry',
        '/api/getCategoryFrequencyMap',
        '/api/getStreaks',
        '/api/getHistoricalStreaks',

        '/api/getTodo',
        '/api/getTodos',
        '/api/postTodo',
        '/api/deleteTodo',

        '/api/getReminder',
        '/api/getReminders',
        '/api/postReminder',
        '/api/deleteReminder',

        '/api/getDigest',
        '/api/getDigests',
        '/api/postDigest',
        '/api/deleteDigest',
        '/api/uploadImage',
      ],
      auth.verifyCorrectUser
    );
  }
  // diary
  entry.init(app, db);
  router.use(
    [
      '/api/getEntries',
      '/api/postEntry',
      '/api/deleteEntry',
      '/api/getCategoryFrequencyMap',
      '/api/getStreaks',
      '/api/getHistoricalStreaks',
    ],
    entry.validateParams
  );
  router.use(
    [
      '/api/getEntries',
      '/api/postEntry',
      '/api/deleteEntry',
      '/api/getCategoryFrequencyMap',
      '/api/getStreaks',
      '/api/getHistoricalStreaks',
    ],
    entry.validateOwner
  );
  router.use(['/api/getEntries', '/api/getStreaks'], entry.validateDate);
  router.use(['/api/postEntry', '/api/deleteEntry'], entry.validateEntry);

  router.get('/api/getEntries', entry.getEntries);
  router.get('/api/getCategoryFrequencyMap', entry.getCategoryFrequencyMap);
  router.get('/api/getStreaks', entry.getStreaks);
  router.get('/api/getHistoricalStreaks', entry.getHistoricalStreaks);
  router.post('/api/postEntry', entry.postEntry);
  router.post('/api/deleteEntry', entry.deleteEntry);
  // todo
  todo.init(app, db);
  router.use(
    ['/api/getTodo', '/api/getTodos', '/api/postTodo', '/api/deleteTodo'],
    todo.validateParams
  );
  router.use(
    ['/api/getTodo', '/api/getTodos', '/api/postTodo', '/api/deleteTodo'],
    todo.validateOwner
  );
  router.use(['/api/postTodo', '/api/deleteTodo'], todo.validateTodo);
  router.get('/api/getTodo', todo.getTodo);
  router.get('/api/getTodos', todo.getTodos);
  router.post('/api/postTodo', todo.postTodo);
  router.post('/api/deleteTodo', todo.deleteTodo);
  // reminder
  reminder.init(app, db);
  router.use(
    [
      '/api/getReminder',
      '/api/getReminders',
      '/api/postReminder',
      '/api/deleteReminder',
    ],
    reminder.validateParams
  );
  router.use(
    [
      '/api/getReminder',
      '/api/getReminders',
      '/api/postReminder',
      '/api/deleteReminder',
    ],
    reminder.validateOwner
  );
  router.use(
    ['/api/postReminder', '/api/deleteReminder'],
    reminder.validateReminder
  );
  router.get('/api/getReminder', reminder.getReminder);
  router.get('/api/getReminders', reminder.getReminders);
  router.post('/api/postReminder', reminder.postReminder);
  router.post('/api/deleteReminder', reminder.deleteReminder);
  // entry
  digest.init(app, db);
  router.use(
    [
      '/api/getDigest',
      '/api/getDigests',
      '/api/postDigest',
      '/api/deleteDigest',
    ],
    digest.validateParams
  );
  router.use(
    [
      '/api/getDigest',
      '/api/getDigests',
      '/api/postDigest',
      '/api/deleteDigest',
    ],
    digest.validateOwner
  );
  router.use(['/api/postDigest', '/api/deleteDigest'], digest.validateDigest);
  router.get('/api/getDigest', digest.getDigest);
  router.get('/api/getDigests', digest.getDigests);
  router.post('/api/postDigest', digest.postDigest);
  router.post('/api/deleteDigest', digest.deleteDigest);
  // uploadImage
  upload.init(app, db);
  router.post('/api/uploadImage', upload.uploadImage);
  // errReport
  errReport.init(app, db);
  router.post('/api/errReport', errReport.post);
  // router wrap-up
  app.use(router.routes());
  app.use(router.allowedMethods());

  return new Promise((resolve) => {
    let server = http.createServer(app.callback());
    server.listen(mergedConfig.port, () => {
      console.mylog(`diary-back ver: `, packagejson.version);
      console.mylog(`Listening on ${mergedConfig.port}`);
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
