require('isomorphic-fetch');
const { MongoClient } = require('mongodb');
const config = require('./config.js');
const dbName = 'diaryTest';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;
let appInstance, db;

beforeAll(async () => {
  db = await MongoClient.connect(mongoUrl);
  appInstance = await require('./server.js')({dbName});
});

let expectFetchUrlStatusCodeAndJson = async ({url, expectStatusCode, expectJson,
    method, postBody}) => {
  let response;
  if (!method)
    response = await fetch(url);
  else if (method === 'POST') {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      method,
      body: JSON.stringify(postBody)
    });
  }
  expect(response.status).toBe(expectStatusCode);
  let body = await response.json();
  if (expectJson)
    expect(body).toEqual(expectJson);
  return body;
};

let expectDbQueryResult = async ({collection, query, expectedResults}) => {
  if (typeof collection === 'string')
    collection = db.collection(collection);
  let dbResult = await (await collection.find(query)).toArray();
  dbResult = dbResult.map(document => {
    if (typeof document._id !== 'string') {
      return Object.assign({}, document, {_id: document._id.toString()});
    }
    return document;
  });
  expect(dbResult).toEqual(expectedResults);
  return dbResult;
};

test('/api/getEntries require date and owner params', async () => {
  await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/getEntries`,
    expectStatusCode: 400, expectJson: {err: 'Missing param'}});

  await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/getEntries?owner=testOwner`,
    expectStatusCode: 400, expectJson: {err: 'Missing param'}});
  
  await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/getEntries?date=1970-01-01`,
    expectStatusCode: 400, expectJson: {err: 'Missing param'}});
});

test('/api/getEntries require date and owner params legal', async () => {
  await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/getEntries?owner=_admin&date=1970-01-01`,
    expectStatusCode: 400, expectJson: {err: 'Illegal param'}});

  await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/getEntries?owner=testOwner&date=1234`,
    expectStatusCode: 400, expectJson: {err: 'Illegal param'}});
});

test('/api/getEntries returns a entry', async () => {
  let testOwnerEntryCollection = db.collection(`entry_testOwner`);
  let entry = {_id: 'testid', date: "1970-01-01", title:
    "test title", content: "test content", points: 1};
  await testOwnerEntryCollection.insertOne(entry);
  await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/getEntries?date=1970-01-01&owner=testOwner`,
    expectStatusCode: 200, expectJson: {data: [entry]}});
});

test('/api/postEntry needs an owner and an entry in body', async () => {
  let entry = {date: "1970-01-01", title: "test title", content: "test content", points: 1};  
  await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/postEntry`, postBody: {data: {owner: 'testOwner'}},
    method: 'POST', expectStatusCode: 400, expectJson: {err: 'Missing param'}});
  
  await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/postEntry`, postBody: {data: {entry}},
    method: 'POST', expectStatusCode: 400, expectJson: {err: 'Missing param'}});
  
  expectDbQueryResult({collection: 'entry_testOwner', query: {}, expectedResults: []});
});

test('/api/postEntry adds an entry', async () => {
  let entry = {date: "1970-01-01", title: "test title", content: "test content", points: 1};
  let res = await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/postEntry`,
    method: 'POST', postBody: {data: {entry, owner: 'testOwner'}}, expectStatusCode: 200
  });
  expectDbQueryResult({collection: 'entry_testOwner', query: {}, expectedResults: [{_id:
    res.data.entry._id, date: "1970-01-01", title: "test title",
    content:"test content", points: 1}]});
});

test('/api/postEntry if update an entry that doesn\'t exist, give modified 0', async () => {
  let entry = {_id: '59c61d8dc8864c16acb0c422', date: "1970-01-01", title: "test title",
    content: "test content", points: 1};
  let json = await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/postEntry`,
    method: 'POST', postBody: {data: {entry, owner: 'testOwner'}}, expectStatusCode: 200,
    expectJson: {"data": {"n": 0, "nModified": 0, "ok": 1}}
  });
  expectDbQueryResult({collection: 'entry_testOwner', query: {}, expectedResults: []});
});

test('/api/postEntry if update an entry that exists, update it', async () => {
  let entry = {_id: '59c61d8dc8864c16acb0c422', date: "1970-01-01", title: "test title",
    content: "test content", points: 1};
  let testOwnerEntryCollection = db.collection(`entry_testOwner`);    
  await testOwnerEntryCollection.insertOne(entry);

  let entryNew = Object.assign({}, entry, {title: 'updated test title',
    content: 'updated test content', points: 2});
  let json = await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/postEntry`,
    method: 'POST', postBody: {data: {entry: entryNew, owner: 'testOwner'}}, expectStatusCode: 200,
    expectJson: {"data": {"n": 1, "nModified": 1, "ok": 1}}
  });
  expectDbQueryResult({collection: testOwnerEntryCollection, query: {_id: entry._id},
    expectedResults: [entryNew]});
});

test('/api/postEntry if update an entry that exists, but all same, do nothing', async () => {
  let entry = {_id: '59c61d8dc8864c16acb0c422', date: "1970-01-01", title: "test title",
    content: "test content", points: 1};
  let testOwnerEntryCollection = db.collection(`entry_testOwner`);    
  await testOwnerEntryCollection.insertOne(entry);

  let entryNew = Object.assign({}, entry);
  let json = await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/postEntry`,
    method: 'POST', postBody: {data: {entry: entryNew, owner: 'testOwner'}}, expectStatusCode: 200,
    expectJson: {"data": {"n": 1, "nModified": 0, "ok": 1}}
  });

  expectDbQueryResult({collection: testOwnerEntryCollection, query: {_id: entry._id},
    expectedResults: [entryNew]});
});

test('/api/deleteEntry', async () => {
  let entry = {_id: '59c61d8dc8864c16acb0c422', date: "1970-01-01", title: "test title",
  content: "test content", points: 1};
  let testOwnerEntryCollection = db.collection(`entry_testOwner`);    
  await testOwnerEntryCollection.insertOne(entry);

  let json = await expectFetchUrlStatusCodeAndJson({url:
    `http://localhost:${config.port}/api/deleteEntry`, method: 'POST',
    postBody: {data: {entry: {_id: '59c61d8dc8864c16acb0c422'}, owner: 'testOwner'}},
    expectStatusCode: 200,
    expectJson: {"data": {entry: {
      _id: '59c61d8dc8864c16acb0c422',
      date: '1970-01-01',
      title: 'test title',
      content: 'test content',
      points: 1 
    }}}
  });

  expectDbQueryResult({collection: testOwnerEntryCollection, query: {_id: entry._id},
    expectedResults: []});
});

afterEach(async () => {
  await db.dropDatabase();
});

afterAll(async () => {
  await appInstance.httpServer.close();
  await appInstance.dbConnection.close();
  await db.close();
});