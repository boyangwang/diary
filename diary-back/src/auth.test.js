require('isomorphic-fetch');
const { MongoClient } = require('mongodb');
const config = require('./config.js');
config.port = config.port + 1;
const user = config.users[0];
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

describe('login', async () => {
  test('wrong', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/login`,
      postBody: { username: 'foo', password: 'bar' },
      method: 'POST',
      expectJson: { err: 'Login failure' },
      expectStatusCode: 401,
    });
  });

  test('401 for all api reqs', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${
        config.port
      }/api/getEntries?date=1970-01-01&owner=testOwner`,
      expectStatusCode: 401,
      expectJson: { err: 'need login' },
    });
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${
        config.port
      }/api/postEntry`,
      method: 'POST',
      expectStatusCode: 401,
      expectJson: { err: 'need login' },
    });
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${
        config.port
      }/api/deleteEntry`,
      method: 'POST',
      expectStatusCode: 401,
      expectJson: { err: 'need login' },
    });
  });

  test('correct', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/login`,
      postBody: { username: user.username, password: user.password },
      method: 'POST',
      expectJson: { data: { user: { username: user.username } } },
      expectStatusCode: 200,
    });
  });
});
