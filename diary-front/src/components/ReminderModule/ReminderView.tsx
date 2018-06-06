import React from 'react';
import { connect } from 'react-redux';

import { Collapse, List } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { ErrResponse, GetRemindersResponse, Reminder } from 'utils/api';
import util from 'utils/util';

import ReminderFormContainer from 'components/ReminderModule/ReminderFormContainer';
import ReminderListContainer from 'components/ReminderModule/ReminderListContainer';
import ReminderObject from 'components/ReminderModule/ReminderObject';

import './ReminderView.css';

class ReduxProps {
  public reminders: Reminder[];
  public user: User | null;
  public resyncCounter: number;
}
class State {}
class ReminderView extends React.Component<ReduxProps, State> {
  public renderContent() {
    const { reminders } = this.props;

    return (
      <div className="RemindersContainer">
        <ReminderListContainer
          reminders={reminders.sort((a, b) => {
            return a.title.localeCompare(b.title);
          })}
          headerText="Reminders - sorted by title"
        />
      </div>
    );
  }

  public render() {
    const { reminders } = this.props;

    return (
      <div className="ReminderView">
        <h2>ReminderView</h2>

        <ReminderFormContainer />
        {reminders.length === 0 ? 'Empty' : this.renderContent()}
      </div>
    );
  }
}
export default connect((state: ReduxState) => {
  return {
    reminders: state.reminders,
    user: state.user,
    resyncCounter: state.resyncCounter,
  };
})(ReminderView);
