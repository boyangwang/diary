const moment = require('moment');

export const dateStringFormat = 'YYYY-MM-DD';

export const getDateStringWithOffset = (offset, date) => {
  offset = offset ? offset : 0;
  const baseDate = date ? moment(date) : moment();
  return baseDate.add(offset, 'days').format(dateStringFormat);
};
