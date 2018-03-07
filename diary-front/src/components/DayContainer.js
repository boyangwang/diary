import api from 'utils/api';
import util from 'utils/util';
import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Icon } from 'antd';

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
    return !entriesDateMap[date] ? (
      <Icon type="loading" />
    ) : (
      JSON.stringify(entriesDateMap[date])
    );
  }

  render() {
    const { date } = this.props;
    const isErr = this.state.err;
    return (
      <div className="DayContainer">
        {date}
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
