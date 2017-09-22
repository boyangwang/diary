require('isomorphic-fetch');
const { MongoClient } = require('mongodb');
const config = require('./config.js');
const dbName = 'dairyTest';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;
let serverInstance, db, entryCollection;

beforeAll(async () => {
    db = await MongoClient.connect(mongoUrl);
    entryCollection = db.collection('entry');
    serverInstance = await require('./server.js')({dbName});
});

test('dairy-back server gets a entry', async () => {
    await entryCollection.insertOne({"date" : "1970-01-01", "title" : "test1", "content":
        "test1 content", "points" : 1});
    let result = await
      (await fetch(`http://localhost:${config.port}/api/getEntriesForDate?date=1970-01-01`)).json();
    expect(result.data.length).toBe(1);
    let expected = {data: [{_id: result.data[0]._id, "date" : "1970-01-01", "title" : "test1", "content":
      "test1 content", "points" : 1}]};
    expect(result).toEqual(expected);
});

afterAll(async () => {
  await db.dropDatabase();
  await db.close();
  await serverInstance.dbConnection.close();
  await serverInstance.httpServer.destroy();
  await serverInstance.close();
});