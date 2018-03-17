import { Icon } from 'antd';
import * as moment from 'moment';
import React from 'react';

const dateStringFormat = 'YYYY-MM-DD';

export default {
  dateStringFormat,
  getTodayStringWithOffset: (offset: number | undefined) => {
    offset = offset ? offset : 0;
    return moment()
      .add(offset, 'days')
      .format(dateStringFormat);
  },
  getWeekdaysFromDateString: (date: string) => {
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
  errComponent: (<Icon type="exclamation-circle-o" />),
};
