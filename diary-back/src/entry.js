const isomorphicUtil = require('../../isomorphicUtil');
const { ObjectId } = require('mongodb').ObjectId;

let app, db;

module.exports = {
  init: (passedApp, passedDb) => {
    app = passedApp;
    db = passedDb;
  },
  validateParams: async (ctx, next) => {
    let invalid;
    if (ctx.method === 'GET' && !ctx.request.query) {
      invalid = true;
    } else if (
      ctx.method === 'POST' &&
      (!ctx.request.body || !ctx.request.body.data)
    ) {
      invalid = true;
    }
    if (invalid) {
      ctx.response.status = 400;
      ctx.response.body = { err: 'Missing param' };
    } else {
      await next();
    }
  },
  validateOwner: async (ctx, next) => {
    let owner, errMsg;
    if (ctx.method === 'GET') {
      ({ owner } = ctx.request.query);
    } else {
      ({ owner } = ctx.request.body.data);
    }
    if (!owner) {
      errMsg = 'Missing param';
    } else if (!/^[A-Za-z0-9]+$/.test(owner)) {
      errMsg = 'Illegal param';
    }
    if (errMsg) {
      ctx.response.status = 400;
      ctx.response.body = { err: errMsg };
    } else {
      await next();
    }
  },
  validateDate: async (ctx, next) => {
    let { date } = ctx.request.query,
      errMsg;
    if (!date) {
      errMsg = 'Missing param';
    } else if (!/^(\d{4}-\d{2}-\d{2},)*(\d{4}-\d{2}-\d{2})$/.test(date)) {
      errMsg = 'Illegal param';
    }
    if (errMsg) {
      ctx.response.status = 400;
      ctx.response.body = { err: errMsg };
    } else {
      await next();
    }
  },
  validateEntry: async (ctx, next) => {
    let { entry } = ctx.request.body.data,
      errMsg;
    if (!entry) {
      errMsg = 'Missing param';
    }
    if (errMsg) {
      ctx.response.status = 400;
      ctx.response.body = { err: errMsg };
    } else {
      await next();
    }
  },
  /**
   * returns categoryFrequencyMap for all dates
   * @param {*} req req.query.owner
   * @param {*} res
   */
  getCategoryFrequencyMap: async (ctx, next) => {
    const { owner } = ctx.request.query;

    const categoryFrequencyMap = {};
    let ownerEntryCollection = db.collection(`entry_${owner}`);
    let results = await (await ownerEntryCollection.find({})).toArray();
    results.forEach((entry) => {
      categoryFrequencyMap[entry.title] = categoryFrequencyMap[entry.title]
        ? categoryFrequencyMap[entry.title] + 1
        : 1;
    });

    ctx.response.body = { data: categoryFrequencyMap };
  },
  /**
   * returns all historical streaks for this owner
   * @param {*} req req.query.owner
   * @param {*} res
   */
  getHistoricalStreaks: async (ctx, next) => {
    const { owner, date } = ctx.request.query;

    // structure:
    // { someCategory: [{startDate: '1970-01-01', endDate: '1970-01-30' or null, streaks: 30}, {...}] }
    const streaksMap = {};
    let ownerEntryCollection = db.collection(`entry_${owner}`);
    let entries = await (await ownerEntryCollection.find({})).toArray();
    let categories = new Set();

    entries.forEach((entry) => categories.add(entry.title));
    Array.from(categories).forEach((category) => {
      let allMyEntries = entries.filter((entry) => entry.title === category);
      allMyEntries.sort((a, b) => a.date.localeCompare(b.date));
      if (!allMyEntries.length) return;
      let myEntryStreaks = [];
      let startDate, endDate, streaks, nextDayStr;
      for (let i = 0; i < allMyEntries.length; i++) {
        if (startDate && allMyEntries[i].date === nextDayStr) {
          streaks++;
          endDate = nextDayStr;
          nextDayStr = isomorphicUtil.getDateStringWithOffset(1, nextDayStr);
        } else if (startDate && allMyEntries[i].date === endDate) {
          // this means we have 2 same category records on same day, no-op
        } else {
          if (startDate) myEntryStreaks.push({ startDate, endDate, streaks });
          startDate = allMyEntries[i].date;
          endDate = allMyEntries[i].date;
          nextDayStr = isomorphicUtil.getDateStringWithOffset(1, startDate);
          streaks = 1;
        }
      }
      // we always have a non-ended streak (because length == 0 case already handled)
      myEntryStreaks.push({ startDate, endDate, streaks });
      streaksMap[category] = myEntryStreaks;
    });

    ctx.response.body = {
      data: streaksMap,
    };
  },
  /**
   * returns all continuous streaks for this owner
   * @param {*} req req.query.owner req.query.date
   * @param {*} res
   */
  getStreaks: async (ctx, next) => {
    const { owner, date } = ctx.request.query;

    const streaksMap = {};
    let ownerEntryCollection = db.collection(`entry_${owner}`);
    let entries = await (await ownerEntryCollection.find({})).toArray();

    // first get all from yesterday - they are the only possible streak candidates
    const baseDateYesterday = isomorphicUtil.getDateStringWithOffset(-1, date);
    let yesterdayEntries = entries.filter((e) => e.date === baseDateYesterday);
    for (let yesterdayEntry of yesterdayEntries) {
      let streakOn = true,
        streaks = 1;
      let currentCheckDate = isomorphicUtil.getDateStringWithOffset(
        -1,
        baseDateYesterday
      );
      while (streakOn) {
        streakOn = entries.some(
          (e) => e.date === currentCheckDate && e.title === yesterdayEntry.title
        );
        if (streakOn) {
          streaks++;
          currentCheckDate = isomorphicUtil.getDateStringWithOffset(
            -1,
            currentCheckDate
          );
        }
      }
      streaksMap[yesterdayEntry.title] = streaks;
    }
    ctx.response.body = {
      data: streaksMap,
    };
  },
  /**
   * returns a list of entries for specified date, or empty
   * @param {*} req req.query.date req.query.owner
   * @param {*} res
   */
  getEntries: async (ctx, next) => {
    const { date, owner } = ctx.request.query;

    let ownerEntryCollection = db.collection(`entry_${owner}`);
    const dates = date.split(',');
    let results = await (
      await ownerEntryCollection.find({
        $or: dates.map((date) => {
          return { date };
        }),
      })
    ).toArray();
    ctx.response.body = { data: results };
  },
  /**
   * add a new entry to date, or update an existing entry
   * - if new, your entry must have no _id
   * - if update, your entry must have _id. If that _id is not found, nothing happens
   * - if new entry is identical to old, nothing happens
   * @param {*} req req.body.data.entry req.body.data.owner
   * @param {*} res
   */
  postEntry: async (ctx, next) => {
    let { entry, owner } = ctx.request.body.data;
    let ownerEntryCollection = db.collection(`entry_${owner}`);
    if (!entry._id) {
      let result = await ownerEntryCollection.insertOne(entry);
      ctx.response.status = 200;
      ctx.response.body = { data: { entry } };
    } else {
      const processedId =
        entry._id.length === 24 ? new ObjectId(entry._id) : entry._id;
      delete entry._id;
      let result = await ownerEntryCollection.updateOne(
        { _id: processedId },
        { $set: { ...entry } }
      );
      ctx.response.status = 200;
      ctx.response.body = { data: result };
    }
  },
  deleteEntry: async (ctx, next) => {
    let { owner, entry } = ctx.request.body.data;
    let ownerEntryCollection = db.collection(`entry_${owner}`);
    const processedId =
      entry._id.length === 24 ? new ObjectId(entry._id) : entry._id;
    let result = await ownerEntryCollection.findOneAndDelete({
      _id: processedId,
    });
    ctx.response.status = 200;
    ctx.response.body = { data: { entry: result.value } };
  },
};
