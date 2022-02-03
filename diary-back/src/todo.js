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
  validateTodo: async (ctx, next) => {
    let { todo } = ctx.request.body.data,
      errMsg;
    if (!todo) {
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
   * return one todo for this owner, based on _id
   * @param {*} req req.query._id req.query.owner
   * @param {*} res
   */
  getTodo: async (ctx, next) => {
    const { _id, owner } = ctx.request.query;
    if (!_id) {
      ctx.response.status = 400;
      ctx.response.body = { err: 'Missing param' };
      return;
    }
    let ownerTodoCollection = db.collection(`todo_${owner}`);
    const processedId = _id.length === 24 ? ObjectId(_id) : _id;
    let results = await (
      await ownerTodoCollection.find({
        _id: processedId,
      })
    ).toArray();
    ctx.response.body = { data: results };
  },
  /**
   * return todos for this owner
   * @param {*} req req.query.owner
   * @param {*} res
   */
  getTodos: async (ctx, next) => {
    const { owner } = ctx.request.query;

    let ownerTodoCollection = db.collection(`todo_${owner}`);
    let results = await (await ownerTodoCollection.find({})).toArray();
    ctx.response.body = { data: results };
  },
  /**
   * add a new todo to date, or update an existing todo
   * - if new, your todo must have no _id
   * - if update, your todo must have _id. If that _id is not found, nothing happens
   * - if new todo is identical to old, nothing happens
   * @param {*} req req.body.data.todo req.body.data.owner
   * @param {*} res
   */
  postTodo: async (ctx, next) => {
    let { todo, owner } = ctx.request.body.data;
    let ownerTodoCollection = db.collection(`todo_${owner}`);
    if (!todo._id) {
      let result = await ownerTodoCollection.insertOne(todo);
      ctx.response.status = 200;
      ctx.response.body = { data: { todo } };
    } else {
      const processedId =
        todo._id.length === 24 ? ObjectId(todo._id) : todo._id;
      delete todo._id;
      let result = await ownerTodoCollection.updateOne(
        { _id: processedId },
        { $set: { ...todo } }
      );
      ctx.response.status = 200;
      ctx.response.body = { data: result };
    }
  },
  deleteTodo: async (ctx, next) => {
    let { owner, todo } = ctx.request.body.data;
    let ownerTodoCollection = db.collection(`todo_${owner}`);
    const processedId = todo._id.length === 24 ? ObjectId(todo._id) : todo._id;
    let result = await ownerTodoCollection.findOneAndDelete({
      _id: processedId,
    });
    ctx.response.status = 200;
    ctx.response.body = { data: { todo: result.value } };
  },
};
