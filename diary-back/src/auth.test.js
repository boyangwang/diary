require('isomorphic-fetch');
const { MongoClient } = require('mongodb');
const config = require('./config.js');
config.port = config.port + 6;
const user = config.users[0];
const dbName = 'diaryTest';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;
const {
  expectFetchUrlStatusCodeAndJson,
  expectDbQueryResult,
  setTestObj,
  getTestObj,
  getMyCookiesString,
} = require('./testutils.js');
let appInstance, db;

beforeAll(async () => {
  db = await MongoClient.connect(mongoUrl);
  appInstance = await require('./server.js')({ dbName, port: config.port });

  await setTestObj({
    date: '1970-01-01',
    title: 'test title',
    content: 'test content',
    points: 1,
  });
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

  test('correct login and able to make req, but only to own user', async () => {
    let responseAndBody = await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/login`,
      postBody: { username: user.username, password: user.password },
      method: 'POST',
      expectJson: { data: { user: { username: user.username } } },
      expectStatusCode: 200,
    });

    // const setCookie = responseAndBody.response.headers.get('set-cookie');
    const setCookie = responseAndBody.response.headers.getAll('set-cookie');
    expect(setCookie).toBeTruthy();

    const cookie = getMyCookiesString(setCookie);

    responseAndBody = await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/apiTest`,
      headers: {
        cookie,
      },
      expectStatusCode: 200,
    });
    expect(responseAndBody.body.data.user.username).toEqual(user.username);

    let entry = getTestObj({ _id: undefined });
    responseAndBody = await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postEntry`,
      headers: {
        cookie,
      },
      method: 'POST',
      postBody: { data: { entry, owner: 'testOwner' } },
      expectStatusCode: 200,
    });

    responseAndBody = await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postEntry`,
      headers: {
        cookie,
      },
      method: 'POST',
      postBody: { data: { entry, owner: 'demo' } },
      expectStatusCode: 401,
      expectJson: { err: 'wrong owner' },
    });
  });
});
