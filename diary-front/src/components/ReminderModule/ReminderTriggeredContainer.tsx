import * as moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';

import { List } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { ErrResponse, GetRemindersResponse, Reminder } from 'utils/api';
import util from 'utils/util';

import ReminderMiniObject from 'components/ReminderModule/ReminderMiniObject';

import mylog from 'utils/mylog';
import './ReminderTriggeredContainer.css';

class ReduxProps {
  public reminders: Reminder[];
  public user: User | null;
  public resyncCounter: number;
}
class State {}
class ReminderTriggeredContainer extends React.Component<ReduxProps, State> {
  public getReminders() {
    const { user } = this.props;
    if (!user) {
      return;
    }
    api.getReminders({ owner: user.username }).then(
      (data: GetRemindersResponse & ErrResponse) => {
        dispatch({
          type: 'REMINDERS',
          payload: {
            reminders: data.data,
          },
        });
      },
      (err) => {
        this.setState({ err });
      }
    );
  }

  public componentWillMount() {
    this.getReminders();
  }

  public filterTriggeredReminders(reminders: Reminder[]) {
    const today = moment();
    return reminders.filter((reminder) => {
      if (reminder.cycleType === 'year') {
        const todayAndNextTwoDays = [
          util.getDateStringWithOffset().substring(5),
          util.getDateStringWithOffset(1).substring(5),
          util.getDateStringWithOffset(2).substring(5),
        ];
        return todayAndNextTwoDays.includes(reminder.cycleTime);
      } else if (reminder.cycleType === 'month') {
        return (
          today.format('D') === reminder.cycleTime ||
          today.daysInMonth() + 1 + +reminder.cycleTime === +today.format('D')
        );
      } else if (reminder.cycleType === 'week') {
        return today.format('E') === reminder.cycleTime;
      } else {
        mylog('Corrupted reminder - cycleType invalid');
      }
      return false;
    });
  }

  public render() {
    const { reminders } = this.props;
    let triggeredReminders = this.filterTriggeredReminders(reminders);
    triggeredReminders = triggeredReminders.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });
    return (
      <div className="ReminderTriggeredContainer">
        {triggeredReminders.map((reminder) => (
          <ReminderMiniObject reminder={reminder} />
        ))}
      </div>
    );
  }

  public componentDidUpdate(
    prevProps: ReduxProps,
    prevState: State,
    snapshot: any
  ) {
    if (this.props.resyncCounter !== prevProps.resyncCounter) {
      this.getReminders();
    }
  }
}
export default connect((state: ReduxState) => {
  return {
    reminders: state.reminders,
    user: state.user,
    resyncCounter: state.resyncCounter,
  };
})(ReminderTriggeredContainer);
