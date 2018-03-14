let app, db;

module.exports = {
  init: (passedApp, passedDb) => {
    app = passedApp;
    db = passedDb;
  },
  validateParams: async (ctx, next) => {
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
  },
  validateOwner: async (ctx, next) => {
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
  },
  validateDate: async (ctx, next) => {
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
  },
  validateEntry: async (ctx, next) => {
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
  },
  /**
   * returns a list of entries for specified date, or empty
   * @param {*} req req.query.date req.query.owner
   * @param {*} res
   */
  getEntries: async (ctx, next) => {
    const { date, owner } = ctx.request.query;

    let ownerEntryCollection = db.collection(`entry_${owner}`);
    let results = await (await ownerEntryCollection.find({ date })).toArray();
    ctx.response.body = { data: results };
  },
  /**
   * add a new entry to date, or update an existing entry
   * - if new, your entry must have no _id
   * - if update, your entry must have _id. If that _id is not found, nothing happens
   * - if new entry is identical to old, nothing happens
   * @param {*} req req.body.data.entry req.body.data.owner
   * @param {*} res
   */
  postEntry: async (ctx, next) => {
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
  },
  deleteEntry: async (ctx, next) => {
    let { owner, entry } = ctx.request.body.data;
    let ownerEntryCollection = db.collection(`entry_${owner}`);
    let result = await ownerEntryCollection.findOneAndDelete(entry);
    ctx.response.status = 200;
    ctx.response.body = { data: { entry: result.value } };
  },
};