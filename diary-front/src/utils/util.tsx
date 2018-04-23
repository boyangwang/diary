import * as _ from 'lodash';
import * as moment from 'moment';
import React from 'react';

import { Icon } from 'antd';

import mylog from 'utils/mylog';

const dateStringFormat = 'YYYY-MM-DD';

const base64Chars = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '+',
  '/',
];

const compare = <T extends {}>(a: T, b: T): 0 | 1 | -1 => {
  if (_.isNil(a) && _.isNil(b)) {
    return 0;
  }
  if (_.isNil(a)) {
    // b is bigger
    return -1;
  } else if (_.isNil(b)) {
    return 1;
  }
  if (_.isBoolean(a) && _.isBoolean(b)) {
    if (a === b) {
      return 0;
    }
    if (a) {
      return 1;
    }
    return -1;
  } else if (_.isNumber(a) && _.isNumber(b)) {
    const res = (a as number) - (b as number);
    return res > 0 ? 1 : res < 0 ? -1 : 0;
  } else if (_.isString(a) && _.isString(b)) {
    const res = (a as string).localeCompare(b as string);
    return res > 0 ? 1 : res < 0 ? -1 : 0;
  } else if (moment.isMoment(a) && moment.isMoment(b)) {
    if (a.isAfter(b)) {
      return 1;
    } else if (a.isBefore(b)) {
      return -1;
    } else {
      return 0;
    }
  } else {
    mylog('Error: compare not number nor string nor boolean?');
    return 0;
  }
};

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
  genRandomString: (digits: number = 6) => {
    const randValues = window.crypto.getRandomValues(new Uint32Array(digits));
    if (!randValues) {
      mylog('window.crypto.getRandomValues returned null');
      return '';
    }
    const result = [];
    for (let i = 0; i < digits; i++) {
      result.push(base64Chars[randValues[i] % 64]);
    }
    return result.join('');
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
  compare,
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
  findCurrentPageItems: (
    items: any[],
    pageSize: number,
    currentPage: number
  ) => {
    return items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  },
  syncUrlParamWithState: ({
    urlParamName,
    stateName,
    isUrlToState,
    state,
    setState,
  }: {
    urlParamName: string;
    stateName: string;
    isUrlToState?: boolean;
    state: any;
    setState: (arg: any) => void;
  }) => {
    const urlObj = new URL(location.href);
    const { searchParams } = urlObj;
    const urlValue = searchParams.get(urlParamName);
    const stateValue = state[stateName];
    if (!stateValue && !urlValue) {
      return;
    } else if (!stateValue) {
      setState({
        [stateName]: urlValue,
      });
    } else if (!urlValue) {
      searchParams.set(urlParamName, stateValue);
      window.history.replaceState(
        {},
        '',
        `${location.pathname}?${searchParams}`
      );
    } else {
      if (isUrlToState) {
        setState({
          [stateName]: urlValue,
        });
      } else {
        searchParams.set(urlParamName, stateValue);
        window.history.replaceState(
          {},
          '',
          `${location.pathname}?${searchParams}`
        );
      }
    }
  },
};
