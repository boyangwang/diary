import React from 'react';
import { connect } from 'umi';

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
    const sinceReminders = reminders.filter(
      (r: Reminder) => r.cycleType === 'since'
    );
    const nonSinceReminders = reminders.filter(
      (r: Reminder) => r.cycleType !== 'since'
    );

    return (
      <div className="RemindersContainer">
        <ReminderListContainer
          reminders={sinceReminders.sort((a, b) => {
            return -1 * a.cycleTime.localeCompare(b.cycleTime);
          })}
          headerText="Since Reminders - sorted by first day"
        />
        <ReminderListContainer
          reminders={nonSinceReminders.sort((a, b) => {
            return a.title.localeCompare(b.title);
          })}
          headerText="Non-since Reminders - sorted by title"
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
