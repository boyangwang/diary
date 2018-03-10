import api from 'utils/api';
import util from 'utils/util';
import DayContainerEntryObject from 'components/DayContainerEntryObject';
import AddEntryFormContainer from 'components/AddEntryFormContainer';
import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Icon } from 'antd';
import classnames from 'classnames';

import './DayContainer.css';

class DayContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      err: null,
    };
  }

  getEntriesForDate() {
    const { entriesDateMap, date, dispatch, username } = this.props;
    if (!entriesDateMap[date])
      api.getEntries({ date, owner: username }).then(
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
    if (!entriesDateMap[date])
      return (
        <div className="DayContainerContentDiv">
          <Icon type="loading" />
        </div>
      );
    return (
      <div className="DayContainerContentDiv">
        <div className="sum">
          {entriesDateMap[date].reduce((prev, cur) => prev + cur.points || 0, 0)}
        </div>
        {entriesDateMap[date].map((entry) => {
          return <DayContainerEntryObject entry={entry} key={entry._id} />;
        })}
        <AddEntryFormContainer date={date} />
      </div>
    );
  }

  render() {
    const { date, highlight } = this.props;
    const isErr = this.state.err;
    const dateClassNames = classnames('date', { highlight });
    return (
      <div className="DayContainer">
        <div className={dateClassNames}>{date}</div>
        {isErr ? util.errComponent : this.renderContent()}
      </div>
    );
  }
}

export default connect((state) => {
  return {
    entriesDateMap: state.entriesDateMap,
    username: state.username,
  };
})(DayContainer);
