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
    const apis = [
      '/api/getEntries',
      '/api/postEntry',
      '/api/deleteEntry',
      '/api/getTodos',
      '/api/postTodo',
      '/api/deleteTodo',
      '/api/getDigests',
      '/api/postDigest',
      '/api/deleteDigest',
      '/api/uploadImage',
    ];
    await apis.forEach(async (api) => {
      await expectFetchUrlStatusCodeAndJson({
        url: `http://localhost:${config.port}${api}`,
        method: api.includes('get') ? 'GET' : 'POST',
        expectStatusCode: 401,
        expectJson: { err: 'need login' },
      });
    });
  });

  test('correct login and able to make req', async () => {
    const loginResponse = (await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/login`,
      postBody: { username: user.username, password: user.password },
      method: 'POST',
      expectJson: { data: { user: { username: user.username } } },
      expectStatusCode: 200,
    })).response;

    console.log('XXX ', loginResponse.headers);
  });
});
