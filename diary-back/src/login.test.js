require('isomorphic-fetch');
const { MongoClient } = require('mongodb');
const config = require('./config.js');
config.port = config.port + 1;
const dbName = 'diaryTest';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;
const { expectFetchUrlStatusCodeAndJson,
  expectDbQueryResult } = require('./testutils.js');
let appInstance, db;

beforeAll(async () => {
  db = await MongoClient.connect(mongoUrl);
  appInstance = await require('./server.js')({dbName, port: config.port});
});

describe('login', async () => {
  test('correct', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/login`,
      postBody: { username: 'foo', password: 'bar' },
      method: 'POST', expectJson: {err: 'Login failure'},
      expectStatusCode: 401,
    });
  });

  test('correct', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/login`,
      postBody: { username: config.username, password: config.password },
      method: 'POST', expectJson: {data: {username: config.username}},
      expectStatusCode: 200,
    });
  });
});
