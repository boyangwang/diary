require('isomorphic-fetch');

module.exports = {
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
