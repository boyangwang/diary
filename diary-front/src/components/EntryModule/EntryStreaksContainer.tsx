import React from 'react';
import { connect } from 'react-redux';

import { Card, Table, Tag } from 'antd';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';
import { EntriesDateMap, EntriesDateStreaksMap } from 'utils/api';
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
}
class State {}
class EntryStreaksContainer extends React.Component<Props & ReduxProps, State> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public getStreaksDataSource(): any[] {
    const { entriesDateMap, entriesDateStreaksMap, date } = this.props;
    const todayStreaksMap = entriesDateStreaksMap[date];
    if (!todayStreaksMap) {
      return [];
    }
    const streaks = Object.keys(todayStreaksMap)
      .map((category) => {
        return {
          streaks: todayStreaksMap[category],
          category,
          todayfulfilled: (entriesDateMap[date] || []).some(
            (entry) => entry.title === category
          ),
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
    return (
      <div className="EntryStreaksContainer">
        <Table
          columns={columns}
          dataSource={dataSource}
          size="small"
          pagination={false}
        />
      </div>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    entriesDateMap: state.entriesDateMap,
    entriesDateStreaksMap: state.entriesDateStreaksMap,
  };
})(EntryStreaksContainer);
