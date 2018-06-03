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

config.port = config.port + 2;
const dbName = 'diaryTest';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;
let appInstance, db;

beforeAll(async () => {
  setTestObj({
    date: '1970-01-01',
    title: 'test title',
    content: 'test content',
    points: 1,
  });
  db = await MongoClient.connect(mongoUrl);
  appInstance = await require('./server.js')({
    dbName,
    port: config.port,
    useAuth: false,
  });
});

describe('api', async () => {
  test('/api/getEntries require date and owner params', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/getEntries`,
      expectStatusCode: 400,
      expectJson: { err: 'Missing param' },
    });

    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/getEntries?owner=testOwner`,
      expectStatusCode: 400,
      expectJson: { err: 'Missing param' },
    });

    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/getEntries?date=1970-01-01`,
      expectStatusCode: 400,
      expectJson: { err: 'Missing param' },
    });
  });

  test('/api/getEntries require date and owner params legal', async () => {
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${
        config.port
      }/api/getEntries?owner=_admin&date=1970-01-01`,
      expectStatusCode: 400,
      expectJson: { err: 'Illegal param' },
    });

    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${
        config.port
      }/api/getEntries?owner=testOwner&date=1234`,
      expectStatusCode: 400,
      expectJson: { err: 'Illegal param' },
    });
  });

  test('/api/getEntries returns a entry', async () => {
    let entry = getTestObj();
    let testOwnerEntryCollection = db.collection(`entry_testOwner`);
    await testOwnerEntryCollection.insertOne(transformIdToObjectId(entry));
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/getEntries?date=${
        entry.date
      }&owner=testOwner`,
      expectStatusCode: 200,
      expectJson: { data: [entry] },
    });
  });

  test('/api/getEntries returns entries for multiple days', async () => {
    let entry1 = getTestObj({ date: '1970-01-01' });
    let entry2 = getTestObj({ date: '1970-01-02' });
    let testOwnerEntryCollection = db.collection(`entry_testOwner`);
    await testOwnerEntryCollection.insertOne(transformIdToObjectId(entry1));
    await testOwnerEntryCollection.insertOne(transformIdToObjectId(entry2));
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/getEntries?date=${[
        entry1.date,
        entry2.date,
      ].join(',')}&owner=testOwner`,
      expectStatusCode: 200,
      expectJson: { data: [entry1, entry2] },
    });
  });

  test('/api/getCategoryFrequencyMap returns categories', async () => {
    let entry1 = getTestObj({ date: '1970-01-01' });
    let entry2 = getTestObj({ date: '1970-01-01' });
    let entry3 = getTestObj({ date: '1970-01-01' });
    entry3.title = 'anotherTestTitle';
    let testOwnerEntryCollection = db.collection(`entry_testOwner`);
    await testOwnerEntryCollection.insertMany([
      transformIdToObjectId(entry1),
      transformIdToObjectId(entry2),
      transformIdToObjectId(entry3),
    ]);

    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${
        config.port
      }/api/getCategoryFrequencyMap?owner=testOwner`,
      expectStatusCode: 200,
      expectJson: { data: { 'test title': 2, anotherTestTitle: 1 } },
    });
  });

  test('/api/getStreaks returns correct streaks', async () => {
    // today is 01 04, yester is 01 03 last streak 01 01
    let entry5 = getTestObj({ date: '1970-01-03' });
    let entry1 = getTestObj({ date: '1970-01-02' });
    let entry2 = getTestObj({ date: '1970-01-01' });

    let entry3 = getTestObj({ date: '1970-01-02' });
    let entry4 = getTestObj({ date: '1970-01-01' });

    let entry6 = getTestObj({ date: '1970-01-03' });

    entry1.title = entry2.title = entry5.title = '3streak';

    entry3.title = 'alsonostreak';
    entry4.title = 'noStreak';

    entry6.title = '1streak';

    let testOwnerEntryCollection = db.collection(`entry_testOwner`);
    await testOwnerEntryCollection.insertMany([
      transformIdToObjectId(entry1),
      transformIdToObjectId(entry2),
      transformIdToObjectId(entry3),
      transformIdToObjectId(entry4),
      transformIdToObjectId(entry5),
      transformIdToObjectId(entry6),
    ]);

    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${
        config.port
      }/api/getStreaks?owner=testOwner&date=1970-01-04`,
      expectStatusCode: 200,
      expectJson: { data: { '1streak': 1, '3streak': 3 } },
    });
  });

  test('/api/getHistoricalStreaks returns correct streaks', async () => {
    // today is 01 04, yester is 01 03 last streak 01 01
    let entry5 = getTestObj({ date: '1970-01-03' });
    let entry1 = getTestObj({ date: '1970-01-02' });
    let entry2 = getTestObj({ date: '1970-01-01' });

    let entry3 = getTestObj({ date: '1970-01-02' });
    let entry4 = getTestObj({ date: '1970-01-01' });

    let entry6 = getTestObj({ date: '1970-01-03' });

    entry1.title = entry2.title = entry5.title = '3streak';

    entry3.title = 'alsonostreak';
    entry4.title = 'noStreak';

    entry6.title = '1streak';

    let testOwnerEntryCollection = db.collection(`entry_testOwner`);
    await testOwnerEntryCollection.insertMany([
      transformIdToObjectId(entry1),
      transformIdToObjectId(entry2),
      transformIdToObjectId(entry3),
      transformIdToObjectId(entry4),
      transformIdToObjectId(entry5),
      transformIdToObjectId(entry6),
    ]);

    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${
        config.port
      }/api/getHistoricalStreaks?owner=testOwner`,
      expectStatusCode: 200,
      expectJson: {
        data: {
          '1streak': [
            { endDate: '1970-01-03', startDate: '1970-01-03', streaks: 1 },
          ],
          '3streak': [
            { endDate: '1970-01-03', startDate: '1970-01-01', streaks: 3 },
          ],
          alsonostreak: [
            { endDate: '1970-01-02', startDate: '1970-01-02', streaks: 1 },
          ],
          noStreak: [
            { endDate: '1970-01-01', startDate: '1970-01-01', streaks: 1 },
          ],
        },
      },
    });
  });

  test('/api/postEntry needs an owner and an entry in body', async () => {
    let entry = getTestObj();
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postEntry`,
      postBody: { data: { owner: 'testOwner' } },
      method: 'POST',
      expectStatusCode: 400,
      expectJson: { err: 'Missing param' },
    });

    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postEntry`,
      postBody: { data: { entry } },
      method: 'POST',
      expectStatusCode: 400,
      expectJson: { err: 'Missing param' },
    });

    expectDbQueryResult({
      db,
      collection: 'entry_testOwner',
      query: {},
      expectedResults: [],
    });
  });

  test('/api/postEntry adds an entry', async () => {
    let entry = getTestObj({ _id: undefined });
    let body = (await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postEntry`,
      method: 'POST',
      postBody: { data: { entry, owner: 'testOwner' } },
      expectStatusCode: 200,
    })).body;
    /**
     * we don't know _id beforehand, so not asserting res
     * format: 
     * { data:
         { todo:
            { date: '1970-01-01',
              title: 'test title',
              content: 'test content',
              priority: 3,
              check: false,
              _id: '5aad3a16a2b32c25e0c95c57' } } }
     */
    expectDbQueryResult({
      db,
      collection: 'entry_testOwner',
      query: {},
      expectedResults: [Object.assign({}, entry, { _id: body.data.entry._id })],
    });
  });

  test("/api/postEntry if update an entry that doesn't exist, give modified 0", async () => {
    let entry = getTestObj();
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postEntry`,
      method: 'POST',
      postBody: { data: { entry, owner: 'testOwner' } },
      expectStatusCode: 200,
      expectJson: { data: { n: 0, nModified: 0, ok: 1 } },
    });
    expectDbQueryResult({
      db,
      collection: 'entry_testOwner',
      query: {},
      expectedResults: [],
    });
  });

  test('/api/postEntry if update an entry that exists, update it', async () => {
    let entry = getTestObj();
    let testOwnerEntryCollection = db.collection(`entry_testOwner`);
    await testOwnerEntryCollection.insertOne(transformIdToObjectId(entry));
    let entryNew = Object.assign({}, entry, {
      title: 'updated test title',
      content: 'updated test content',
      points: 2,
    });
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postEntry`,
      method: 'POST',
      postBody: { data: { entry: entryNew, owner: 'testOwner' } },
      expectStatusCode: 200,
      expectJson: { data: { n: 1, nModified: 1, ok: 1 } },
    });
    expectDbQueryResult({
      db,
      collection: testOwnerEntryCollection,
      query: { _id: entry._id },
      expectedResults: [entryNew],
    });
  });

  test('/api/postEntry if update an entry that exists, but all same, do nothing', async () => {
    let entry = getTestObj();
    let testOwnerEntryCollection = db.collection(`entry_testOwner`);
    await testOwnerEntryCollection.insertOne(transformIdToObjectId(entry));
    let entryNew = Object.assign({}, entry);
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postEntry`,
      method: 'POST',
      postBody: { data: { entry: entryNew, owner: 'testOwner' } },
      expectStatusCode: 200,
      expectJson: { data: { n: 1, nModified: 0, ok: 1 } },
    });

    expectDbQueryResult({
      db,
      collection: testOwnerEntryCollection,
      query: { _id: entry._id },
      expectedResults: [entryNew],
    });
  });

  test('/api/deleteEntry', async () => {
    let entry = getTestObj();
    let testOwnerEntryCollection = await db.collection(`entry_testOwner`);
    await testOwnerEntryCollection.insertOne(transformIdToObjectId(entry));
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/deleteEntry`,
      method: 'POST',
      postBody: {
        data: {
          entry: { _id: entry._id },
          owner: 'testOwner',
        },
      },
      expectStatusCode: 200,
      expectJson: {
        data: {
          entry,
        },
      },
    });

    expectDbQueryResult({
      db,
      collection: testOwnerEntryCollection,
      query: { _id: entry._id },
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
