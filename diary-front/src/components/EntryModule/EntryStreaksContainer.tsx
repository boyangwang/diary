import React from 'react';
import { connect } from 'react-redux';

import { Card, Table, Tag, Row } from 'antd';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';
import {
  EntriesDateMap,
  EntriesDateStreaksMap,
  EntriesHistoricalStreaksMap,
  Streak,
} from 'utils/api';
import util from 'utils/util';

import './EntryStreaksContainer.css';

const columns = [
  {
    title: 'Category',
    dataIndex: 'category',
  },
  {
    title: 'Streaks',
    dataIndex: 'streaks',
  },
  {
    title: 'Longest historical record',
    dataIndex: 'longest',
    render: (streak: Streak) => {
      if (!streak) {
        return null;
      }
      return (
        <div className="StreakObject">
          <span>{streak.streaks}</span>
          <span> | </span>
          <span>
            {streak.startDate} - {streak.endDate}
          </span>
        </div>
      );
    },
  },
  {
    title: 'TodayFulfilled',
    dataIndex: 'todayfulfilled',
    render: (isYes: boolean) => {
      return isYes ? (
        <span>
          <Tag color="#87d068">Yes</Tag>
        </span>
      ) : (
        <span>
          <Tag color="Silver">No</Tag>
        </span>
      );
    },
  },
];
class Props {
  public date: string;
}
class ReduxProps {
  public entriesDateMap: EntriesDateMap;
  public entriesDateStreaksMap: EntriesDateStreaksMap;
  public entriesHistoricalStreaksMap: EntriesHistoricalStreaksMap;
}
class State {
  public showHistoricalStreaks: boolean = false;
}
class EntryStreaksContainer extends React.Component<Props & ReduxProps, State> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public getStreaksDataSource(): any[] {
    const {
      entriesDateMap,
      entriesDateStreaksMap,
      date,
      entriesHistoricalStreaksMap,
    } = this.props;
    const todayStreaksMap = entriesDateStreaksMap[date];
    if (!todayStreaksMap) {
      return [];
    }
    const streaks = Object.keys(todayStreaksMap)
      .map((category) => {
        let longest: Streak | null = null;
        (entriesHistoricalStreaksMap[category] || []).forEach((streak) => {
          if (!longest || streak.streaks > longest.streaks) {
            longest = streak;
          }
        });
        return {
          streaks: todayStreaksMap[category],
          category,
          todayfulfilled: (entriesDateMap[date] || []).some(
            (entry) => entry.title === category
          ),
          longest,
        };
      })
      .sort((a, b) => {
        return (
          util.compare(a.streaks, b.streaks) * -100 +
          util.compare(a.todayfulfilled, b.todayfulfilled) * -10 +
          util.compare(a.category, b.category) * 1
        );
      });

    return streaks;
  }

  public render() {
    const dataSource = this.getStreaksDataSource();
    const { entriesHistoricalStreaksMap } = this.props;

    return (
      <div className="EntryStreaksContainer">
        <Table
          rowKey="category"
          columns={columns}
          dataSource={dataSource}
          size="small"
          pagination={false}
        />
        <Row type="flex" justify="end">
          <a
            className="ToggleHistoricalStreaksLink"
            onClick={() =>
              this.setState({
                showHistoricalStreaks: !this.state.showHistoricalStreaks,
              })
            }
          >
            Toggle historical streaks
          </a>
        </Row>
        {this.state.showHistoricalStreaks && (
          <pre className="HistoricalStreaksContainer">
            {JSON.stringify(entriesHistoricalStreaksMap, null, 2)}
          </pre>
        )}
      </div>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    entriesDateMap: state.entriesDateMap,
    entriesDateStreaksMap: state.entriesDateStreaksMap,
    entriesHistoricalStreaksMap: state.entriesHistoricalStreaksMap,
  };
})(EntryStreaksContainer);
