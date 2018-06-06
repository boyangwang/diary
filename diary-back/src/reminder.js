const { ObjectId } = require('mongodb').ObjectId;

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
  validateReminder: async (ctx, next) => {
    let { reminder } = ctx.request.body.data,
      errMsg;
    if (!reminder) {
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
   * return reminders for owner
   * @param {*} req req.query.owner
   * @param {*} res
   */
  getReminders: async (ctx, next) => {
    const { owner } = ctx.request.query;

    let ownerReminderCollection = db.collection(`reminder_${owner}`);
    let results = await (await ownerReminderCollection.find({})).toArray();
    ctx.response.body = { data: results };
  },
  /**
   * return one reminder for this owner, based on _id
   * @param {*} req req.query._id req.query.owner
   * @param {*} res
   */
  getReminder: async (ctx, next) => {
    const { _id, owner } = ctx.request.query;
    if (!_id) {
      ctx.response.status = 400;
      ctx.response.body = { err: 'Missing param' };
      return;
    }
    let ownerReminderCollection = db.collection(`reminder_${owner}`);
    const processedId = _id.length === 24 ? ObjectId(_id) : _id;
    let results = await (await ownerReminderCollection.find({
      _id: processedId,
    })).toArray();
    ctx.response.body = { data: results };
  },
  postReminder: async (ctx, next) => {
    let { reminder, owner } = ctx.request.body.data;
    let ownerReminderCollection = db.collection(`reminder_${owner}`);
    if (!reminder._id) {
      let result = await ownerReminderCollection.insertOne(reminder);
      ctx.response.status = 200;
      ctx.response.body = { data: { reminder } };
    } else {
      const processedId =
        reminder._id.length === 24 ? ObjectId(reminder._id) : reminder._id;
      delete reminder._id;
      let result = await ownerReminderCollection.updateOne(
        { _id: processedId },
        { $set: { ...reminder } }
      );
      ctx.response.status = 200;
      ctx.response.body = { data: result };
    }
  },
  deleteReminder: async (ctx, next) => {
    let { owner, reminder } = ctx.request.body.data;
    let ownerReminderCollection = db.collection(`reminder_${owner}`);
    const processedId = reminder._id.length === 24 ? ObjectId(reminder._id) : reminder._id;
    let result = await ownerReminderCollection.findOneAndDelete({
      _id: processedId,
    });
    ctx.response.status = 200;
    ctx.response.body = { data: { reminder: result.value } };
  },
};
