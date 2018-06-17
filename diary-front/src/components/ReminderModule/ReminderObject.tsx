import React from 'react';
import { connect } from 'react-redux';

import { Alert, Button, Checkbox, List, message, Modal } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, {
  DeleteReminderResponse,
  ErrResponse,
  GetRemindersResponse,
  PostReminderResponse,
  Reminder,
} from 'utils/api';

import ReminderFormContainer from './ReminderFormContainer';

import './ReminderObject.css';

class Props {
  public reminder: Reminder;
}
class ReduxProps {
  public user: User | null;
}
class State {
  public editVisible: boolean = false;
}
class ReminderObject extends React.Component<Props & ReduxProps, State> {
  constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public syncItem(): void {
    const { reminder, user } = this.props;

    api.getReminder({ owner: user!.username, _id: reminder._id! }).then(
      (data: GetRemindersResponse & ErrResponse) => {
        if (data.data && data.data[0]) {
          dispatch({
            type: 'UPDATE_REMINDER',
            payload: { reminder: data.data[0] },
          });
        }
      },
      (err) => {}
    );
  }

  public deleteReminder() {
    const { reminder, user } = this.props;
    if (!user) {
      return;
    }
    api.deleteReminder({ data: { owner: user.username, reminder } }).then(
      (data: DeleteReminderResponse & ErrResponse) => {
        if (data.err) {
          message.warn('' + data.err);
        } else if (data.data.reminder) {
          dispatch({
            type: 'DELETE_REMINDER',
            payload: { reminder: data.data.reminder },
          });
        }
      },
      (err) => {}
    );
  }

  public render() {
    const { reminder } = this.props;
    return (
      <List.Item
        className="ReminderObject"
        actions={[
          <Button
            className="editButton"
            key="edit"
            icon="edit"
            size="large"
            onClick={() =>
              this.setState({
                editVisible: true,
              })
            }
          />,
          <Button
            className="syncButton"
            key="sync"
            icon="reload"
            size="large"
            onClick={() => this.syncItem()}
          />,
          <Button
            className="deleteButton"
            key="delete"
            icon="delete"
            type="danger"
            size="large"
            onClick={() => {
              Modal.confirm({
                title: 'Confirm delete?',
                okText: 'Delete',
                cancelText: 'Cancel',
                onOk: this.deleteReminder.bind(this),
              });
            }}
          />,
        ]}
      >
        <List.Item.Meta
          avatar={
            <div className="createTimestamp">
              {new Date(reminder.createTimestamp)
                .toISOString()
                .substring(0, 10)}
            </div>
          }
          title={
            <div>
              <h3 className="title">{reminder.title}</h3>
              <Alert
                className="cycleInfo"
                message={reminder.cycleType + ' | ' + reminder.cycleTime}
                type="success"
              />
              {reminder.cycleType === 'since' && (
                <Alert
                  className="cycleInfo"
                  message={moment().diff(reminder.cycleTime, 'days') + 'Days'}
                  type="success"
                />
              )}
            </div>
          }
          description={
            <div>
              <div className="_id grey">{reminder._id}</div>
            </div>
          }
        />
        <div className="content">{reminder.content}</div>
        <Modal
          visible={this.state.editVisible}
          onCancel={() =>
            this.setState({
              editVisible: false,
            })
          }
          footer={null}
          closable={false}
        >
          <ReminderFormContainer
            reminder={reminder}
            buttonText={'Edit reminder'}
            onSubmit={() =>
              this.setState({
                editVisible: false,
              })
            }
          />
        </Modal>
      </List.Item>
    );
  }
}
export default connect((state: ReduxState) => {
  return {
    user: state.user,
  };
})(ReminderObject);
