require('isomorphic-fetch');
const { MongoClient } = require('mongodb');
const config = require('./config.js');
const dbName = 'diaryTest';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;
let appInstance, db;

beforeAll(async () => {
  db = await MongoClient.connect(mongoUrl);
  appInstance = await require('./server.js')({dbName, port: config.port});
});

describe('login', async () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
  });
});
