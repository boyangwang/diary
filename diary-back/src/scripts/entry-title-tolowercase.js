const { MongoClient, ObjectId } = require('mongodb');

const mongoUrl = `mongodb://localhost:27017/diary`;

(async () => {
  let db = await MongoClient.connect(mongoUrl);

  let ownerEntryCollection = db.collection(`entry_diary`);

  let results = await (await ownerEntryCollection.find({})).toArray();

  console.log('results', results.map(r => r.title));

  let res;
  results.forEach(async doc => {
    res = await ownerEntryCollection.updateOne(
      { _id: ObjectId(doc._id) },
      { $set: { title: doc.title.toLocaleLowerCase() } }
    );
  });
  await db.close();
})();
