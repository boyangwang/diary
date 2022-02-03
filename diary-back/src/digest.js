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
  validateDigest: async (ctx, next) => {
    let { digest } = ctx.request.body.data,
      errMsg;
    if (!digest) {
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
   * return one digest for this owner, based on _id
   * @param {*} req req.query._id req.query.owner
   * @param {*} res
   */
  getDigest: async (ctx, next) => {
    const { _id, owner } = ctx.request.query;
    if (!_id) {
      ctx.response.status = 400;
      ctx.response.body = { err: 'Missing param' };
      return;
    }
    let ownerDigestCollection = db.collection(`digest_${owner}`);
    const processedId = _id.length === 24 ? ObjectId(_id) : _id;
    let results = await (
      await ownerDigestCollection.find({
        _id: processedId,
      })
    ).toArray();
    ctx.response.body = { data: results };
  },
  /**
   * return digests for this owner
   * @param {*} req req.query.owner
   * @param {*} res
   */
  getDigests: async (ctx, next) => {
    const { owner } = ctx.request.query;

    let ownerDigestCollection = db.collection(`digest_${owner}`);
    let results = await (await ownerDigestCollection.find({})).toArray();
    ctx.response.body = { data: results };
  },
  /**
   * add a new digest to date, or update an existing digest
   * - if new, your digest must have no _id
   * - if update, your digest must have _id. If that _id is not found, nothing happens
   * - if new digest is identical to old, nothing happens
   * @param {*} req req.body.data.digest req.body.data.owner
   * @param {*} res
   */
  postDigest: async (ctx, next) => {
    let { digest, owner } = ctx.request.body.data;
    let ownerDigestCollection = db.collection(`digest_${owner}`);
    if (!digest._id) {
      let result = await ownerDigestCollection.insertOne(digest);
      ctx.response.status = 200;
      ctx.response.body = { data: { digest } };
    } else {
      const processedId =
        digest._id.length === 24 ? ObjectId(digest._id) : digest._id;
      delete digest._id;
      let result = await ownerDigestCollection.updateOne(
        { _id: processedId },
        { $set: { ...digest } }
      );
      ctx.response.status = 200;
      ctx.response.body = { data: result };
    }
  },
  deleteDigest: async (ctx, next) => {
    let { owner, digest } = ctx.request.body.data;
    let ownerDigestCollection = db.collection(`digest_${owner}`);
    const processedId =
      digest._id.length === 24 ? ObjectId(digest._id) : digest._id;
    let result = await ownerDigestCollection.findOneAndDelete({
      _id: processedId,
    });
    ctx.response.status = 200;
    ctx.response.body = { data: { digest: result.value } };
  },
};
