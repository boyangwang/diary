import { Icon } from 'antd';
import * as _ from 'lodash';
import * as moment from 'moment';
import React from 'react';
import mylog from 'utils/mylog';

const dateStringFormat = 'YYYY-MM-DD';

export default {
  isNumOrStrAndNotNaN: (a: any) => {
    return (_.isNumber(a) || _.isString(a)) && !_.isNaN(a);
  },
  setOpacity: (s: string, a: number) => {
    return s.substring(0, s.lastIndexOf(',') + 1) + a + ')';
  },
  stringHashCode: (s: string) => {
    let hash = 0;
    if (s.length === 0) {
      return hash;
    }
    for (let i = 0; i < s.length; i++) {
      const chr = s.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },
  dateStringFormat,
  getTodayStringWithOffset: (offset?: number) => {
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
  errComponent: <Icon type="exclamation-circle-o" />,
  compare: (
    a: number | string | undefined,
    b: number | string | undefined
  ): 0 | 1 | -1 => {
    if (_.isNil(a)) {
      // b is bigger
      return -1;
    } else if (_.isNil(b)) {
      return 1;
    }
    if (_.isNumber(a)) {
      const res = (a as number) - (b as number);
      return res > 0 ? 1 : res < 0 ? -1 : 0;
    } else if (_.isString(b)) {
      const res = (a as string).localeCompare(b as string);
      return res > 0 ? 1 : res < 0 ? -1 : 0;
    } else {
      mylog('Error: compare not number nor string?');
      return 0;
    }
  },
  compareDate(
    a: string | undefined,
    b: string | undefined,
    isDescending: boolean = false
  ) {
    let res;
    if (_.isNil(a)) {
      // b is bigger
      return 1;
    } else if (_.isNil(b)) {
      return -1;
    } else {
      const tempRes = a.localeCompare(b);
      res = tempRes > 0 ? 1 : tempRes < 0 ? -1 : 0;
    }
    if (isDescending) {
      return res * -1;
    } else {
      return res;
    }
  },
};
