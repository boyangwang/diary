require('isomorphic-fetch');
const { MongoClient } = require('mongodb');
const config = require('./config.js');
config.port = config.port + 7;
const dbName = 'diaryTest';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;
const {
  expectFetchUrlStatusCodeAndJson,
  expectDbQueryResult,
} = require('./testutils.js');
let appInstance, db;

beforeAll(async () => {
  db = await MongoClient.connect(mongoUrl);
  appInstance = await require('./server.js')({ dbName, port: config.port });
});

describe('errReport', async () => {
  test('/api/errReport adds an entry', async () => {
    let errEntry = {
      _id: 'testid',
      err: 'test',
    };
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/errReport`,
      method: 'POST',
      postBody: { err: errEntry },
      expectStatusCode: 200,
      expectJson: { err: errEntry },
    });
    expectDbQueryResult({
      db,
      collection: 'errReport',
      query: {},
      expectedResults: [errEntry],
    });
  });
});

afterEach(async () => {
  await db.dropDatabase();
});

afterAll(async () => {
  await db.dropDatabase();
  await appInstance.httpServer.close();
  await appInstance.dbConnection.close();
  await db.close();
});
