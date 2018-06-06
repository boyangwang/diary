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

config.port = config.port + 4;
const dbName = 'diaryTest';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;
let appInstance, db;

beforeAll(async () => {
  setTestObj({
    "createTimestamp": 1521819342901,
    title: 'test title',
    content: 'test content',
    cycleType: '',
    cycleTime: '',
  });
  db = await MongoClient.connect(mongoUrl);
  appInstance = await require('./server.js')({
    dbName,
    port: config.port,
    useAuth: false,
  });
});

describe('api', async () => {
  test('/api/getReminders and /api/getReminder returns a reminder', async () => {
    const reminder = getTestObj();
    const reminder2 = getTestObj();
    reminder2.title = 'anothertitle';
    let testOwnerReminderCollection = db.collection(`reminder_testOwner`);
    await testOwnerReminderCollection.insertMany([
      transformIdToObjectId(reminder), transformIdToObjectId(reminder2)
    ]);
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/getReminders?owner=testOwner`,
      expectStatusCode: 200,
      expectJson: { data: [reminder, reminder2] },
    });

    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/getReminder?owner=testOwner&_id=${
        reminder._id
      }`,
      expectStatusCode: 200,
      expectJson: { data: [reminder] },
    });
  });

  test('/api/postReminder adds an reminder', async () => {
    const reminder = getTestObj({ _id: undefined });
    let body = (await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postReminder`,
      method: 'POST',
      postBody: { data: { reminder, owner: 'testOwner' } },
      expectStatusCode: 200,
    })).body;

    expectDbQueryResult({
      db,
      collection: 'reminder_testOwner',
      query: {},
      expectedResults: [
        Object.assign({}, reminder, {
          _id: body.data.reminder._id,
        }),
      ],
    });
  });

  test('/api/postReminder if update an reminder that exists, update it', async () => {
    const reminder = getTestObj();
    let testOwnerReminderCollection = db.collection(`reminder_testOwner`);
    await testOwnerReminderCollection.insertOne(transformIdToObjectId(reminder));
    const reminderNew = Object.assign({}, reminder, {
      title: 'updated test title',
      content: 'updated test content',
      cycleType: 'updated ctype',
      cycleTime: 'updated ctime',
    });
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/postReminder`,
      method: 'POST',
      postBody: { data: { reminder: reminderNew, owner: 'testOwner' } },
      expectStatusCode: 200,
      expectJson: { data: { n: 1, nModified: 1, ok: 1 } },
    });
    expectDbQueryResult({
      db,
      collection: testOwnerReminderCollection,
      query: { _id: reminder._id },
      expectedResults: [reminderNew],
    });
  });

  test('/api/deleteReminder', async () => {
    const reminder = getTestObj();
    let testOwnerReminderCollection = await db.collection(`reminder_testOwner`);
    await testOwnerReminderCollection.insertOne(transformIdToObjectId(reminder));
    await expectFetchUrlStatusCodeAndJson({
      url: `http://localhost:${config.port}/api/deleteReminder`,
      method: 'POST',
      postBody: {
        data: {
          reminder: { _id: reminder._id },
          owner: 'testOwner',
        },
      },
      expectStatusCode: 200,
      expectJson: {
        data: {
          reminder,
        },
      },
    });

    expectDbQueryResult({
      db,
      collection: testOwnerReminderCollection,
      query: { _id: reminder._id },
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
