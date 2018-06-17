import React from 'react';
import { connect } from 'react-redux';
import * as moment from "moment";

import { Alert, Button, Checkbox, List, message, Modal } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { Reminder } from 'utils/api';

import './ReminderMiniObject.css';

class Props {
  public reminder: Reminder;
}
class ReduxProps {}
class State {}
class ReminderMiniObject extends React.Component<Props & ReduxProps, State> {
  constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public render() {
    const { reminder } = this.props;
    return (
      <div className="ReminderMiniObject">
        <i className="anticon anticon-exclamation-circle-o ant-notification-notice-icon-warning" />
        <span className="title">{reminder.title}</span>
        <span className="cycle">
          {(reminder.cycleType !== 'since' ? '' : moment().diff(reminder.cycleTime, 'days') + ' days ') + reminder.cycleType + ' | ' + reminder.cycleTime}
        </span>
        <span className="content">{reminder.content}</span>
      </div>
    );
  }
}
export default connect((state: ReduxState) => {
  return {};
})(ReminderMiniObject);
