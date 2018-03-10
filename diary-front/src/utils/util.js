import moment from 'moment';
import React from 'react';
import { Icon } from 'antd';
const dateStringFormat = 'YYYY-MM-DD';

export default {
  getTodayStringWithOffset: (offset) => {
    offset = offset ? offset : 0;
    return moment()
      .add(offset, 'days')
      .format(dateStringFormat);
  },
  getWeekdaysFromDateString: (date) => {
    const firstDay = moment(date).startOf('isoWeek');
    const res = [];
    for (let i = 0; i < 7; i++) {
      res.push(
        firstDay
          .clone()
          .add(i, 'days')
          .format(dateStringFormat)
      );
    }
    return res;
  },
  errComponent: <Icon type="exclamation-circle-o" />,
};
