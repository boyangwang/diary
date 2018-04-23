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
  public highlight: boolean = false;
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

  public getEntriesForDate() {
    const { entriesDateMap, date, user } = this.props;
    if (!user) {
      return;
    }
    if (!entriesDateMap[date]) {
      api.getEntries({ date, owner: user.username }).then(
        (data: GetEntriesResponse & ErrResponse) => {
          if (data.err) {
            message.warn('' + data.err);
          } else {
            dispatch({
              type: 'ENTRIES_FOR_DATE',
              payload: {
                [date]: data.data,
              },
            });
          }
        },
        (err) => {
          this.setState({ err });
        }
      );
    }
  }

  public componentWillMount() {
    this.getEntriesForDate();
  }

  public componentDidMount() {
    const { highlight } = this.props;
    if (highlight && this.selfComponent) {
      (window as any).todayContainer = ReactDOM.findDOMNode(this.selfComponent);
    }
  }

  public componentWillReceiveProps(nextProps: Props & ReduxProps) {
    if (nextProps.date !== this.props.date) {
      this.getEntriesForDate();
    }
  }

  public renderContent() {
    const { date, entriesDateMap } = this.props;
    if (!entriesDateMap[date]) {
      return (
        <div className="EntryDayContainerContentDiv">
          <Icon type="loading" />
        </div>
      );
    }
    return (
      <div className="EntryDayContainerContentDiv">
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
    const { date, highlight } = this.props;
    const isErr = this.state.err;
    const dateClassNames = classnames('date', { highlight });
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
})(EntryDayContainer as any);
