import classnames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import { Badge, Card, Icon, message } from 'antd';

import ReactDOM from 'react-dom';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { Entry, ErrResponse, GetEntriesResponse } from 'utils/api';
import util from 'utils/util';

import EntryDayContainerEntryObject from 'components/EntryModule/EntryDayObject';

import './EntryDayContainer.css';

class Props {
  public date: string;
  public todayMark: boolean = false;
  public highlight?: React.ReactNode;
}
class ReduxProps {
  public entriesDateMap: {
    [date: string]: Entry[];
  };
  public user: User | null;
}
class State {
  public err: null | any = null;
}
class EntryDayContainer extends React.Component<Props & ReduxProps, State> {
  public static defaultProps = new Props();
  public selfComponent: React.Component | null = null;

  constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public componentWillMount() {}

  public componentDidMount() {}

  public componentWillReceiveProps(nextProps: Props & ReduxProps) {}

  public renderContent() {
    const { date, entriesDateMap, highlight } = this.props;
    if (!entriesDateMap[date]) {
      return (
        <div className="EntryDayContainerContentDiv">
          <Icon type="loading" />
        </div>
      );
    }
    return (
      <div className="EntryDayContainerContentDiv">
        {highlight || null}
        {entriesDateMap[date].map((entry) => {
          return <EntryDayContainerEntryObject entry={entry} key={entry._id} />;
        })}
      </div>
    );
  }

  public renderSum() {
    const { date, entriesDateMap } = this.props;
    const sum = !entriesDateMap[date]
      ? 0
      : entriesDateMap[date].reduce((prev, cur) => prev + cur.points || 0, 0);

    let sumClasses = 'sum ';
    if (sum === 0) {
      sumClasses += 'grey';
    } else if (sum >= 12) {
      sumClasses += 'green';
    } else {
      sumClasses += 'blue';
    }
    return (
      <div className={sumClasses}>
        <Badge showZero={true} count={sum} />
      </div>
    );
  }

  public render() {
    const { date, todayMark } = this.props;
    const isErr = this.state.err;
    const dateClassNames = classnames('date', { todayMark });
    return (
      <Card
        ref={(ref) => (this.selfComponent = ref)}
        className="EntryDayContainer"
        title={<div className={dateClassNames}>{date}</div>}
        extra={this.renderSum()}
      >
        {isErr ? util.errComponent : this.renderContent()}
      </Card>
    );
  }
}

export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    entriesDateMap: state.entriesDateMap,
    user: state.user,
  };
})(EntryDayContainer);
