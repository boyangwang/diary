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

test('/api/getEntriesForDate require date and owner params', async () => {
  let response = await fetch(`http://localhost:${config.port}/api/getEntriesForDate`);
  expect(response.status).toBe(400);
  let body = await response.json();
  expect(body).toEqual({err: 'Missing query param'});
  
  response = await fetch(`http://localhost:${config.port}/api/getEntriesForDate?owner=testOwner`);
  expect(response.status).toBe(400);
  body = await response.json();
  expect(body).toEqual({err: 'Missing query param'});

  response = await fetch(`http://localhost:${config.port}/api/getEntriesForDate?date=1970-01-01`);
  expect(response.status).toBe(400);
  body = await response.json();
  expect(body).toEqual({err: 'Missing query param'});
});

test('/api/getEntriesForDate returns a entry', async () => {
    let testOwnerEntryCollection = db.collection(`entry_testOwner`);
    await testOwnerEntryCollection.insertOne({date: "1970-01-01", title:
      "test title", content: "test content", points: 1});
    let response = await fetch(`http://localhost:${config.port}/api/getEntriesForDate?date=1970-01-01&owner=testOwner`);
    expect(response.status).toBe(200);
    let result = await response.json();
    expect(result.err).toBeUndefined();
    expect(result.data).toHaveLength(1);
    let expected = {data: [{_id: result.data[0]._id, date: "1970-01-01",
      title: "test title", content: "test content", points: 1}]};
    expect(result).toEqual(expected);
});

afterEach(async () => {
  await db.dropDatabase();
});

afterAll(async () => {
  await appInstance.httpServer.close();
  await appInstance.dbConnection.close();
  await db.close();
});