import { message } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import EntryTrendChartTooltipContent, {
  TooltipPayload,
} from 'components/EntryModule/EntryTrendChartTooltipContent';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { Entry, ErrResponse, GetEntriesResponse } from 'utils/api';
import util from 'utils/util';

const barLowValue = 8;
const barHighValue = 12;
const barLowColor = '#006600';
const barHighColor = '#990000';
const chartColorPanel = [
  'rgba(242,122,119,1)',
  'rgba(119,242,122,1)',
  'rgba(122,119,242,1)',
  'rgba(249,145,87,1)',
  'rgba(249,87,145,1)',
  'rgba(145,249,87,1)',
  'rgba(145,87,249,1)',
  'rgba(87,249,145,1)',
  'rgba(87,145,249,1)',
  'rgba(240,192,96,1)',
  'rgba(240,96,192,1)',
  'rgba(192,240,96,1)',
  'rgba(192,96,240,1)',
  'rgba(96,240,192,1)',
  'rgba(96,192,240,1)',
  'rgba(144,192,144,1)',
  'rgba(144,144,192,1)',
  'rgba(192,144,144,1)',
  'rgba(96,192,192,1)',
  'rgba(192,96,192,1)',
  'rgba(192,192,96,1)',
  'rgba(96,144,192,1)',
  'rgba(96,192,144,1)',
  'rgba(144,96,192,1)',
  'rgba(144,192,96,1)',
  'rgba(192,96,144,1)',
  'rgba(192,144,96,1)',
  'rgba(192,144,192,1)',
  'rgba(192,192,144,1)',
  'rgba(144,192,192,1)',
  'rgba(210,123,83,1)',
  'rgba(210,83,123,1)',
  'rgba(123,210,83,1)',
  'rgba(123,83,210,1)',
  'rgba(83,210,123,1)',
  'rgba(83,123,210,1)',
];

class Props {}
class ReduxProps {
  public entriesDateMap: {
    [date: string]: Entry[];
  };
  public user: User | null;
}
class State {
  public isLoading: boolean = true;
  public err: any;
  public last14Days: string[] = new Array(14)
    .fill(0)
    .map((_, i) => i)
    .map((offset) => util.getTodayStringWithOffset(-offset))
    .reverse();
}
class EntryTrendChartContainer extends React.Component<ReduxProps, State> {
  constructor(props: ReduxProps) {
    super(props);
    this.state = new State();
  }

  public componentDidMount() {
    const { entriesDateMap, user } = this.props;
    const { last14Days } = this.state;

    if (!user) {
      return;
    }
    const missingDays = last14Days.filter(
      (dateString) => !entriesDateMap[dateString]
    );
    if (missingDays.length === 0) {
      return this.setState({ isLoading: false });
    }
    api
      .getEntries(
        {
          owner: user.username,
          date: missingDays.join(','),
        },
        { encodeComponents: false }
      )
      .then(
        (data: GetEntriesResponse & ErrResponse) => {
          if (data.err) {
            message.warn('' + data.err);
          } else {
            const newEntriesByDate: {
              [date: string]: Entry[];
            } = {};
            missingDays.forEach((date) => {
              newEntriesByDate[date] = [];
            });
            data.data.forEach((entry) => {
              newEntriesByDate[entry.date].push(entry);
            });
            dispatch({
              type: 'ENTRIES_FOR_DATE',
              payload: newEntriesByDate,
            });
            this.setState({ isLoading: false });
          }
        },
        (err) => {
          this.setState({ err });
        }
      );
  }

  public getChartDataAndAreasFromDaysAndEntriesDateMap(
    days: string[],
    entriesDateMap: {
      [date: string]: Entry[];
    }
  ): any {
    const allKeys = new Set();
    const chartData = days
      .map((date) => {
        const entries = entriesDateMap[date];
        const res = {
          date,
          _barLow: barLowValue,
          _barHigh: barHighValue,
          Sum: 0,
        };
        entries.forEach((entry) => {
          allKeys.add(entry.title);
          res[entry.title] = res[entry.title]
            ? res[entry.title] + entry.points
            : entry.points;
        });
        return res;
      })
      .map((dataPoint) => {
        allKeys.forEach((key) => {
          dataPoint[key] = dataPoint[key] || 0;
        });
        return dataPoint;
      });
    const areas = [...allKeys.keys(), '_barLow', '_barHigh']
      .sort()
      .map((key) => {
        const colorIdx =
          Math.abs(util.stringHashCode(key)) % chartColorPanel.length;
        const props = {
          type: 'linear' as 'linear',
          dataKey: key,
          stackId: '3',
          stroke: chartColorPanel[colorIdx],
          fill: util.setOpacity(chartColorPanel[colorIdx], 0.36),
          dot: false,
          label: {
            formatter: (label: number | string) => {
              if (+label === 0) {
                return null;
              }
              return +label;
            },
            position: 'right',
          },
        };
        if (key === '_barLow') {
          Object.assign(props, {
            stackId: '1',
            stroke: barLowColor,
            fill: 'transparent',
            dot: false,
            strokeWidth: 2,
            strokeDasharray: '5 5',
            strokeOpacity: 0.8,
            label: false,
          });
        } else if (key === '_barHigh') {
          Object.assign(props, {
            stackId: '2',
            stroke: barHighColor,
            fill: 'transparent',
            dot: false,
            strokeWidth: 2,
            strokeDasharray: '5 5',
            strokeOpacity: 0.8,
            label: false,
          });
        }
        return <Area key={key} {...props} />;
      });
    return { areas, chartData };
  }

  public render() {
    const { entriesDateMap } = this.props;
    const { last14Days, isLoading, err } = this.state;
    if (isLoading) {
      return <h1>EntryTrendChartContainer loading...</h1>;
    } else if (err) {
      return util.errComponent;
    }
    const {
      chartData,
      areas,
    } = this.getChartDataAndAreasFromDaysAndEntriesDateMap(
      last14Days,
      entriesDateMap
    );

    return (
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 16, left: -20, bottom: 12 }}
        >
          <XAxis dataKey="date" padding={{ left: 10, right: 10 }} />
          <YAxis padding={{ top: 10, bottom: 0 }} />
          <Legend
            wrapperStyle={{
              marginLeft: '20px',
              padding: '10px 10px 10px 10px',
            }}
          />
          <Tooltip
            itemStyle={{
              paddingTop: 0,
              paddingBottom: 0,
              height: '20px',
            }}
            wrapperStyle={{
              padding: '0 10px',
              overflow: 'hidden',
              maxHeight: '220px',
            }}
            cursor={true}
            itemSorter={(a: any, b: any) => b.value - a.value}
            content={(props: any) => (
              <EntryTrendChartTooltipContent
                {...props}
                filter={(data: TooltipPayload) => {
                  if (
                    data.name === '_barLow' ||
                    data.name === '_barHigh' ||
                    data.value === 0
                  ) {
                    return false;
                  }
                  return true;
                }}
              />
            )}
          />
          <CartesianGrid strokeDasharray="3 3" />
          {areas}
        </AreaChart>
      </ResponsiveContainer>
    );
  }
}

export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    entriesDateMap: state.entriesDateMap,
    user: state.user,
  };
})(EntryTrendChartContainer as any);