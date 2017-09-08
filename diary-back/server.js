const MongoClient = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://localhost:27017/diary';
const express = require('express');
const config = require('./config.js');
const app = express();

let diary_db, entry_collection;

let getEntriesForDate = (req, res) => {
    let date = req.query.date;
    if (!date)
        return res.status(400).json({err: 'Missing date query param'});
    entry_collection.find({date}).toArray()
        .then(results => {
            res.status(200).json({data: results});
        });
};

let postEntryForDate = (req, res) => {

};

MongoClient.connect(mongoUrl)
    .then(_db => {
        diary_db = _db;
        entry_collection = diary_db.collection('entry');
    })
    .then(() => {
        app.get('/api/getEntriesForDate', getEntriesForDate);
        app.post('/api/postEntryForDate', postEntryForDate);
        return new Promise((resolve, reject) => {
            app.listen(config.port, resolve);
        });
    })
    .then(() => {
        console.log('Listening on '+config.port);
    })
    .catch(err => {
        console.log('ERR: ', err);
        diary_db.close()
    });