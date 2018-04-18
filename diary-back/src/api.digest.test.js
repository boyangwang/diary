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
  setTestObj({
    createTimestamp: 1521819342901,
    lastModified: 1521819342901,
    title: 'test title',
    content: '<p>test</p>',
    tags: ['tag1', 'tag2', 'tag3'],
  });
  db = await MongoClient.connect(mongoUrl);
  appInstance = await require('./server.js')({
    dbName,
    port: config.port,
    useAuth: false,
  });
});

describe('api', async () => {
  test('/api/getDigests require owner params', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/getDigests`,
      expectStatusCode: 400,
      expectJson: { err: 'Missing param' },
    });
  });

  test('/api/getDigests require owner params legal', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${
        config.port
      }/api/getDigests?owner=_admin&date=1970-01-01`,
      expectStatusCode: 400,
      expectJson: { err: 'Illegal param' },
    });
  });

  test('/api/getDigests returns a digest', async () => {
    const digest = getTestObj();
    let testOwnerDigestCollection = db.collection(`digest_testOwner`);
    await testOwnerDigestCollection.insertOne(transformIdToObjectId(digest));
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/getDigests?owner=testOwner`,
      expectStatusCode: 200,
      expectJson: { data: [digest] },
    });
  });

  test('/api/postDigest needs an owner and an digest in body', async () => {
    const digest = getTestObj();
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postDigest`,
      postBody: { data: { owner: 'testOwner' } },
      method: 'POST',
      expectStatusCode: 400,
      expectJson: { err: 'Missing param' },
    });

    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postDigest`,
      postBody: { data: { digest } },
      method: 'POST',
      expectStatusCode: 400,
      expectJson: { err: 'Missing param' },
    });

    expectDbQueryResult({
      db,
      collection: 'digest_testOwner',
      query: {},
      expectedResults: [],
    });
  });

  test('/api/postDigest adds an digest', async () => {
    const digest = getTestObj({ _id: undefined });
    let body = (await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postDigest`,
      method: 'POST',
      postBody: { data: { digest, owner: 'testOwner' } },
      expectStatusCode: 200,
    })).body;
    /**
     * we don't know _id beforehand, so not asserting res
     * format: 
     * { data:
         { entry:
            { date: '1970-01-01',
              title: 'test title',
              content: 'test content',
              points: 1,
              _id: '5aad3a156073fa25e0a09bd1' } } }
     */
    expectDbQueryResult({
      db,
      collection: 'digest_testOwner',
      query: {},
      expectedResults: [
        Object.assign({}, digest, {
          _id: body.data.digest._id,
        }),
      ],
    });
  });

  test("/api/postDigest if update an digest that doesn't exist, give modified 0", async () => {
    const digest = getTestObj();
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postDigest`,
      method: 'POST',
      postBody: { data: { digest, owner: 'testOwner' } },
      expectStatusCode: 200,
      expectJson: { data: { n: 0, nModified: 0, ok: 1 } },
    });
    expectDbQueryResult({
      db,
      collection: 'digest_testOwner',
      query: {},
      expectedResults: [],
    });
  });

  test('/api/postDigest if update an digest that exists, update it', async () => {
    const digest = getTestObj();
    let testOwnerDigestCollection = db.collection(`digest_testOwner`);
    await testOwnerDigestCollection.insertOne(transformIdToObjectId(digest));
    const digestNew = Object.assign({}, digest, {
      title: 'updated test title',
      content: 'updated test content',
      priority: 100,
    });
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postDigest`,
      method: 'POST',
      postBody: { data: { digest: digestNew, owner: 'testOwner' } },
      expectStatusCode: 200,
      expectJson: { data: { n: 1, nModified: 1, ok: 1 } },
    });
    expectDbQueryResult({
      db,
      collection: testOwnerDigestCollection,
      query: { _id: digest._id },
      expectedResults: [digestNew],
    });
  });

  test('/api/postDigest if update an digest that exists, but all same, do nothing', async () => {
    const digest = getTestObj();
    let testOwnerDigestCollection = db.collection(`digest_testOwner`);
    await testOwnerDigestCollection.insertOne(transformIdToObjectId(digest));
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postDigest`,
      method: 'POST',
      postBody: { data: { digest, owner: 'testOwner' } },
      expectStatusCode: 200,
      expectJson: { data: { n: 1, nModified: 0, ok: 1 } },
    });
    expectDbQueryResult({
      db,
      collection: testOwnerDigestCollection,
      query: { _id: digest._id },
      expectedResults: [digest],
    });
  });

  test('/api/deleteDigest', async () => {
    const digest = getTestObj();
    let testOwnerDigestCollection = await db.collection(`digest_testOwner`);
    await testOwnerDigestCollection.insertOne(transformIdToObjectId(digest));
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/deleteDigest`,
      method: 'POST',
      postBody: {
        data: {
          digest: { _id: digest._id },
          owner: 'testOwner',
        },
      },
      expectStatusCode: 200,
      expectJson: {
        data: {
          digest,
        },
      },
    });

    expectDbQueryResult({
      db,
      collection: testOwnerDigestCollection,
      query: { _id: digest._id },
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
