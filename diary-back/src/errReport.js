const _ = require('lodash');

let app, db;

module.exports = {
  init: (passedApp, passedDb) => {
    app = passedApp;
    db = passedDb;
  },
  post: async (ctx, next) => {
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
  }
}