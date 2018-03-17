import './DayContainer.css';

import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Badge, Icon, Card } from 'antd';

import api from 'utils/api';
import util from 'utils/util';
import DayContainerEntryObject from 'components/DayContainerEntryObject';

class DayContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      err: null,
    };
  }

  getEntriesForDate() {
    const { entriesDateMap, date, dispatch, user } = this.props;
    if (!entriesDateMap[date]) {
      api.getEntries({ date, owner: user.username }).then(
        (data) => {
          dispatch({
            type: 'ENTRIES_FOR_DATE',
            payload: {
              [date]: data.data,
            },
          });
        },
        (err) => {
          this.setState({ err });
        }
      );
    }
  }

  componentWillMount() {
    this.getEntriesForDate();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.date !== this.props.date) {
      this.getEntriesForDate();
    }
  }

  renderContent() {
    const { date, entriesDateMap } = this.props;
    if (!entriesDateMap[date]) {
      return (
        <div className="DayContainerContentDiv">
          <Icon type="loading" />
        </div>
      );
    }
    return (
      <div className="DayContainerContentDiv">
        {entriesDateMap[date].map((entry) => {
          return <DayContainerEntryObject entry={entry} key={entry._id} />;
        })}
      </div>
    );
  }

  renderSum() {
    const { date, entriesDateMap } = this.props;
    let sum = !entriesDateMap[date]
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
        <Badge showZero count={sum} />
      </div>
    );
  }

  render() {
    const { date, highlight } = this.props;
    const isErr = this.state.err;
    const dateClassNames = classnames('date', { highlight });
    return (
      <Card
        className="DayContainer"
        title={<div className={dateClassNames}>{date}</div>}
        extra={this.renderSum()}
      >
        {isErr ? util.errComponent : this.renderContent()}
      </Card>
    );
  }
}

export default connect((state) => {
  return {
    entriesDateMap: state.entriesDateMap,
    user: state.user,
  };
})(DayContainer);
