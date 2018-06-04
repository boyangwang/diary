const moment = require('./diary-front/node_modules/moment');

const dateStringFormat = 'YYYY-MM-DD';

const getDateStringWithOffset = (offset, date) => {
  offset = offset ? offset : 0;
  const baseDate = date ? moment(date) : moment();
  return baseDate.add(offset, 'days').format(dateStringFormat);
};

module.exports = {
  dateStringFormat,
  getDateStringWithOffset,
};
