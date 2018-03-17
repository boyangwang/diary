require('isomorphic-fetch');
const { ObjectId } = require('mongodb');
const leftPad = require('left-pad');

let testObj;

module.exports = {
  setTestObj: (obj) => {
    testObj = obj;
  },
  getTestObj: (overrides) => {
    if (!testObj) {
      throw new Error('Must first call setTestObj');
    }
    const currentTestObj = Object.assign({}, testObj, {
      _id: '00000000000000000000' + leftPad(Math.floor(Math.random() * 1000), 4, '0'),
    });
    if (overrides) {
      Object.assign(currentTestObj, overrides);
    }
    return currentTestObj;
  },
  transformIdToObjectId: (obj) => {
    return Object.assign({}, obj, {_id: ObjectId(obj._id)});
  },
  expectFetchUrlStatusCodeAndJson: async ({
    url,
    expectStatusCode,
    expectJson,
    method,
    postBody,
  }) => {
    let response;
    if (!method) response = await fetch(url);
    else if (method === 'POST') {
      response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        method,
        body: JSON.stringify(postBody),
      });
    }
    expect(response.status).toBe(expectStatusCode);
    let body = await response.json();
    if (expectJson) expect(body).toEqual(expectJson);
    return body;
  },
  expectDbQueryResult: async ({ db, collection, query, expectedResults }) => {
    if (typeof collection === 'string') collection = db.collection(collection);
    setTimeout(async () => {
      if (query._id && typeof document._id === 'string') {
        query._id = ObjectId(query._id);
      }
      let dbResult = await (await collection.find(query)).toArray();
      dbResult = dbResult.map((document) => {
        if (typeof document._id !== 'string') {
          return Object.assign({}, document, { _id: document._id.toString() });
        }
        return document;
      });
      expect(dbResult).toEqual(expectedResults);
    }, 1000);
  },
};
