require('isomorphic-fetch');
const { MongoClient } = require('mongodb');
const config = require('./config.js');
const dbName = 'dairyTest';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;
let appInstance, db;

beforeAll(async () => {
    db = await MongoClient.connect(mongoUrl);
    appInstance = await require('./server.js')({dbName});
});

let expectFetchUrlStatusCodeAndJson = async (url, expectStatusCode, expectJson) => {
  let response = await fetch(url);
  expect(response.status).toBe(expectStatusCode);
  let body = await response.json();
  expect(body).toEqual(expectJson);  
}

test('/api/getEntriesForDate require date and owner params', async () => {
  await expectFetchUrlStatusCodeAndJson(
    `http://localhost:${config.port}/api/getEntriesForDate`,
    400, {err: 'Missing query param'});

  await expectFetchUrlStatusCodeAndJson(
    `http://localhost:${config.port}/api/getEntriesForDate?owner=testOwner`,
    400, {err: 'Missing query param'});
  
  await expectFetchUrlStatusCodeAndJson(
    `http://localhost:${config.port}/api/getEntriesForDate?date=1970-01-01`,
    400, {err: 'Missing query param'});
});

test('/api/getEntriesForDate require date and owner params legal', async () => {
  await expectFetchUrlStatusCodeAndJson(
    `http://localhost:${config.port}/api/getEntriesForDate?owner=_admin&date=1970-01-01`,
    400, {err: 'Illegal query param'});

  await expectFetchUrlStatusCodeAndJson(
    `http://localhost:${config.port}/api/getEntriesForDate?owner=testOwner&date=1234`,
    400, {err: 'Illegal query param'});
});

test('/api/getEntriesForDate returns a entry', async () => {
    let testOwnerEntryCollection = db.collection(`entry_testOwner`);
    let entry = {_id: 'testid', date: "1970-01-01", title:
      "test title", content: "test content", points: 1};
    await testOwnerEntryCollection.insertOne(entry);
    await expectFetchUrlStatusCodeAndJson(
      `http://localhost:${config.port}/api/getEntriesForDate?date=1970-01-01&owner=testOwner`,
      200, {data: [entry]});
});

test('/api/postEntryForDate adds a entry', async () => {

});

afterEach(async () => {
  await db.dropDatabase();
});

afterAll(async () => {
  await appInstance.httpServer.close();
  await appInstance.dbConnection.close();
  await db.close();
});