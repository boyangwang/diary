require('isomorphic-fetch');
const { MongoClient, ObjectId } = require('mongodb');
const leftPad = require('left-pad');
const config = require('./config.js');
config.port = config.port + 3;
const dbName = 'diaryTest';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;
const {
  expectFetchUrlStatusCodeAndJson,
  expectDbQueryResult,
} = require('./testutils.js');
let appInstance, db;

const exampleTodo = {
  _id: '00000000000000000000',
  date: '1970-01-01',
  title: 'test title',
  content: 'test content',
  priority: 3,
  check: false,
};

beforeAll(async () => {
  db = await MongoClient.connect(mongoUrl);
  appInstance = await require('./server.js')({
    dbName,
    port: config.port,
    useAuth: false,
  });
});

describe('api', async () => {
  test('/api/getTodos require owner params', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/getTodos`,
      expectStatusCode: 400,
      expectJson: { err: 'Missing param' },
    });
  });

  test('/api/getTodos require owner params legal', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${
        config.port
      }/api/getTodos?owner=_admin&date=1970-01-01`,
      expectStatusCode: 400,
      expectJson: { err: 'Illegal param' },
    });
  });

  test('/api/getTodos returns a todo', async () => {
    let testOwnerTodoCollection = db.collection(`todo_testOwner`);
    await testOwnerTodoCollection.insertOne(exampleTodo);
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${
        config.port
      }/api/getTodos?date=1970-01-01&owner=testOwner`,
      expectStatusCode: 200,
      expectJson: { data: [exampleTodo] },
    });
  });

  test('/api/postTodo needs an owner and an todo in body', async () => {
    const todo = Object.assign({}, exampleTodo, {
      _id: exampleTodo._id + leftPad(Math.floor(Math.random() * 1000), 4, '0'),
    });
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postTodo`,
      postBody: { data: { owner: 'testOwner' } },
      method: 'POST',
      expectStatusCode: 400,
      expectJson: { err: 'Missing param' },
    });

    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postTodo`,
      postBody: { data: { todo } },
      method: 'POST',
      expectStatusCode: 400,
      expectJson: { err: 'Missing param' },
    });

    expectDbQueryResult({
      db,
      collection: 'todo_testOwner',
      query: {},
      expectedResults: [],
    });
  });

  test('/api/postTodo adds an todo', async () => {
    const todo = Object.assign({}, exampleTodo, {
      _id: undefined,
    });
    let res = await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postTodo`,
      method: 'POST',
      postBody: { data: { todo, owner: 'testOwner' } },
      expectStatusCode: 200,
    });
    expectDbQueryResult({
      db,
      collection: 'todo_testOwner',
      query: {},
      expectedResults: [
        Object.assign({}, todo, {
          _id: res.data.todo._id,
        }),
      ],
    });
  });

  test("/api/postTodo if update an todo that doesn't exist, give modified 0", async () => {
    const todo = Object.assign({}, exampleTodo, {
      _id: exampleTodo._id + leftPad(Math.floor(Math.random() * 1000), 4, '0'),
    });
    let json = await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postTodo`,
      method: 'POST',
      postBody: { data: { todo, owner: 'testOwner' } },
      expectStatusCode: 200,
      expectJson: { data: { n: 0, nModified: 0, ok: 1 } },
    });
    expectDbQueryResult({
      db,
      collection: 'todo_testOwner',
      query: {},
      expectedResults: [],
    });
  });

  test('/api/postTodo if update an todo that exists, update it', async () => {
    const _id =
      exampleTodo._id + leftPad(Math.floor(Math.random() * 1000), 4, '0');
    const todo = Object.assign({}, exampleTodo, { _id });
    let testOwnerTodoCollection = db.collection(`todo_testOwner`);
    await testOwnerTodoCollection.insertOne(
      Object.assign({}, todo, { _id: ObjectId(_id) })
    );
    const todoNew = Object.assign({}, todo, {
      title: 'updated test title',
      content: 'updated test content',
    });
    let json = await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postTodo`,
      method: 'POST',
      postBody: { data: { todo: todoNew, owner: 'testOwner' } },
      expectStatusCode: 200,
      expectJson: { data: { n: 1, nModified: 1, ok: 1 } },
    });
    expectDbQueryResult({
      db,
      collection: testOwnerTodoCollection,
      query: { _id: todo._id },
      expectedResults: [todoNew],
    });
  });

  test('/api/postTodo if update an todo that exists, but all same, do nothing', async () => {
    const _id =
      exampleTodo._id + leftPad(Math.floor(Math.random() * 1000), 4, '0');
    const todo = Object.assign({}, exampleTodo, { _id });
    let testOwnerTodoCollection = db.collection(`todo_testOwner`);
    await testOwnerTodoCollection.insertOne(
      Object.assign({}, todo, { _id: ObjectId(_id) })
    );

    let json = await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postTodo`,
      method: 'POST',
      postBody: { data: { todo, owner: 'testOwner' } },
      expectStatusCode: 200,
      expectJson: { data: { n: 1, nModified: 0, ok: 1 } },
    });
    expectDbQueryResult({
      db,
      collection: testOwnerTodoCollection,
      query: { _id: todo._id },
      expectedResults: [todo],
    });
  });

  test('/api/deleteTodo', async () => {
    const _id =
      exampleTodo._id + leftPad(Math.floor(Math.random() * 1000), 4, '0');
    const todo = Object.assign({}, exampleTodo, { _id });

    let testOwnerTodoCollection = await db.collection(`todo_testOwner`);
    await testOwnerTodoCollection.insertOne(
      Object.assign({}, todo, { _id: ObjectId(_id) })
    );

    let json = await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/deleteTodo`,
      method: 'POST',
      postBody: {
        data: {
          todo: { _id },
          owner: 'testOwner',
        },
      },
      expectStatusCode: 200,
      expectJson: {
        data: {
          todo,
        },
      },
    });

    expectDbQueryResult({
      db,
      collection: testOwnerTodoCollection,
      query: { _id: todo._id },
      expectedResults: [],
    });
  });

  afterEach(async () => {
    await db.dropDatabase();
  });
});

afterAll(async () => {
  await db.dropDatabase();
  await appInstance.httpServer.close();
  await appInstance.dbConnection.close();
  await db.close();
});
