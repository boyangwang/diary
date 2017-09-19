const {
  MongoClient,
} = require('mongodb');
const {
  ObjectId,
} = require('mongodb');

const mongoUrl = 'mongodb://localhost:27017/diary';
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config.js');

const app = express();

/**
 * entry:
{ "_id" : ObjectId("59b324daabd16dd3027ba454"), "date" : "2017-09-08", "title" : "work", "content":
"done dup id warning task, on Fri", "points" : "15" }
{ "_id" : ObjectId("59b324f5abd16dd3027ba455"), "date" : "2017-09-08", "title" : "code", "content":
"started diary proj", "points" : "15" }
{ "_id" : ObjectId("59b32538abd16dd3027ba456"), "date" : "2017-09-08", "title" : "eat less",
"content" : "only breakfast leftover, oatmeal, dinner wok master", "points" : "15" }
{ "_id" : ObjectId("59b32574abd16dd3027ba457"), "date" : "2017-09-08", "title" : "sleep early",
"content" : "8pm", "points" : "15" }
 */
let diaryDb;
let entryCollection;

const getEntriesForDate = (req, res) => {
  const {
    date,
  } = req.query;
  if (!date) {
    res.status(400).json({
      err: 'Missing date query param',
    });
    return;
  }
  entryCollection.find({
    date,
  }).toArray()
    .then(results => res.status(200).json({
      data: results,
    }))
    .catch(err => res.status(500).json({
      err: err.toString(),
    }));
};

const postEntryForDate = (req, res) => {
  if (!req.body) {
    res.status(400).json({
      err: 'Missing body',
    });
    return;
  }
  const {
    entry,
  } = req.body;
  if (!entry) {
    res.status(400).json({
      err: 'Missing params in json',
    });
    return;
  }
  if (entry._id) {
    const newEntry = Object.assign({}, entry);
    delete newEntry._id;
    entryCollection.updateOne({
      _id: ObjectId(entry._id),
    }, newEntry)
      .then((result) => {
        res.status(200).json({
          data: result.toString(),
        });
      })
      .catch((err) => {
        res.status(500).json({
          err: err.toString(),
        });
      });
  } else {
    entryCollection.insertOne(entry)
      .then((result) => {
        res.status(200).json({
          data: result.toString(),
        });
      })
      .catch((err) => {
        res.status(500).json({
          err: err.toString(),
        });
      });
  }
};

MongoClient.connect(mongoUrl)
  .then((_db) => {
    diaryDb = _db;
    entryCollection = diaryDb.collection('entry');
  })
  .then(() => {
    app.use(bodyParser.urlencoded({
      extended: true,
    }));
    app.use(bodyParser.json());
    app.get('/api/getEntriesForDate', getEntriesForDate);
    app.post('/api/postEntryForDate', postEntryForDate);
    return new Promise((resolve) => {
      app.listen(config.port, resolve);
    });
  })
  .then(() => {
    console.log(`Listening on ${config.port}`);
  })
  .catch((err) => {
    console.log('ERR: ', err);
    diaryDb.close();
  });
