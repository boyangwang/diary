const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
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
const auth = require('./auth');
const config = require('./config');
const packagejson = require('../package.json');

let app, db;

const validateParams = async (ctx, next) => {
  let invalid;
  if (ctx.method === 'GET' && !ctx.request.query) {
    invalid = true;
  } else if (
    ctx.method === 'POST' &&
    (!ctx.request.body || !ctx.request.body.data)
  ) {
    invalid = true;
  }
  if (invalid) {
    ctx.response.status = 400;
    ctx.response.body = { err: 'Missing param' };
  } else {
    await next();
  }
};

const validateOwner = async (ctx, next) => {
  let owner, errMsg;
  if (ctx.method === 'GET') {
    ({ owner } = ctx.request.query);
  } else {
    ({ owner } = ctx.request.body.data);
  }
  if (!owner) {
    errMsg = 'Missing param';
  } else if (!/^[A-Za-z0-9]+$/.test(owner)) {
    errMsg = 'Illegal param';
  }
  if (errMsg) {
    ctx.response.status = 400;
    ctx.response.body = { err: errMsg };
  } else {
    await next();
  }
};

const validateDate = async (ctx, next) => {
  let { date } = ctx.request.query,
    errMsg;
  if (!date) {
    errMsg = 'Missing param';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errMsg = 'Illegal param';
  }
  if (errMsg) {
    ctx.response.status = 400;
    ctx.response.body = { err: errMsg };
  } else {
    await next();
  }
};

const validateEntry = async (ctx, next) => {
  let { entry } = ctx.request.body.data,
    errMsg;
  if (!entry) {
    errMsg = 'Missing param';
  }
  if (errMsg) {
    ctx.response.status = 400;
    ctx.response.body = { err: errMsg };
  } else {
    await next();
  }
};

/**
 * returns a list of entries for specified date, or empty
 * @param {*} req req.query.date req.query.owner
 * @param {*} res
 */
const getEntries = async (ctx, next) => {
  const { date, owner } = ctx.request.query;

  let ownerEntryCollection = db.collection(`entry_${owner}`);
  let results = await (await ownerEntryCollection.find({ date })).toArray();
  ctx.response.body = { data: results };
};

const getApiTest = async (ctx, next) => {
  ctx.response.body = { data: { success: true } };
};

/**
 * add a new entry to date, or update an existing entry
 * - if new, your entry must have no _id
 * - if update, your entry must have _id. If that _id is not found, nothing happens
 * - if new entry is identical to old, nothing happens
 * @param {*} req req.body.data.entry req.body.data.owner
 * @param {*} res
 */
const postEntry = async (ctx, next) => {
  let { entry, owner } = ctx.request.body.data;
  let ownerEntryCollection = db.collection(`entry_${owner}`);
  if (!entry._id) {
    let result = await ownerEntryCollection.insertOne(entry);
    ctx.response.status = 200;
    ctx.response.body = { data: { entry } };
  } else {
    let result = await ownerEntryCollection.updateOne(
      { _id: entry._id },
      { $set: { ...entry } }
    );
    ctx.response.status = 200;
    ctx.response.body = { data: result };
  }
};

const deleteEntry = async (ctx, next) => {
  let { owner, entry } = ctx.request.body.data;
  let ownerEntryCollection = db.collection(`entry_${owner}`);
  let result = await ownerEntryCollection.findOneAndDelete(entry);
  ctx.response.status = 200;
  ctx.response.body = { data: { entry: result.value } };
};

const errReport = async (ctx, next) => {
  let err;
  if (
    ctx.request.body &&
    ctx.request.body.err &&
    _.isObject(ctx.request.body.err)
  ) {
    err = ctx.request.body.err;
  } else {
    err = ctx.request.body;
  }
  let errCollection = db.collection(`errReport`);
  let result = await errCollection.insertOne(err);
  ctx.response.status = 200;
  ctx.response.body = { err };
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
  // in local dev env, sometimes port/domain are different between front/back
  if (process.env.NODE_ENV !== 'production') {
    app.use(cors());
  }

  router.post('/api/login', auth.authenticateCallback);
  router.post('/api/logout', async (ctx) => {
    ctx.logout();
    ctx.redirect('/');
  });
  
  router.use(['/api/getEntries', '/api/postEntry', '/api/deleteEntry'], auth.verifyAuthenticated);
  router.use(
    ['/api/getEntries', '/api/postEntry', '/api/deleteEntry'],
    validateParams
  );
  router.use(
    ['/api/getEntries', '/api/postEntry', '/api/deleteEntry'],
    validateOwner
  );
  router.use(['/api/getEntries'], validateDate);
  router.use(['/api/postEntry', '/api/deleteEntry'], validateEntry);
  router.get('/api/apiTest', getApiTest);
  router.get('/api/getEntries', getEntries);
  router.post('/api/postEntry', postEntry);
  router.post('/api/deleteEntry', deleteEntry);
  router.post('/api/errReport', errReport);
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
