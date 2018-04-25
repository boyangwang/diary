require('isomorphic-fetch');
const { MongoClient } = require('mongodb');

const {
  expectFetchUrlStatusCodeAndJson,
  expectDbQueryResult,
  setTestObj,
  getTestObj,
  transformIdToObjectId,
} = require('./testutils.js');
const config = require('./config.js');

config.port = config.port + 3;
const dbName = 'diaryTest';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;
let appInstance, db;

beforeAll(async () => {
  db = await MongoClient.connect(mongoUrl);
  appInstance = await require('./server.js')({
    dbName,
    port: config.port,
    useAuth: false,
  });
});

describe('api', async () => {
  test('/api/graphql', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/graphql`,
      method: 'POST',
      postBody: {},
      expectStatusCode: 200,
      expectJson: {
        data: {},
      },
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
