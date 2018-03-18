import './DayContainerEntryObject.css';

import { Alert, Button, Card, message, Modal } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { DeleteEntryResponse, Entry, ErrResponse } from 'utils/api';
import AddEntryFormContainer from './AddEntryFormContainer';

class Props {
  public entry: Entry;
}
class ReduxProps {
  public user: User | null;
}
class State {
  public editVisible: boolean = false;
}
class DayContainerEntryObject extends React.Component<
  Props & ReduxProps,
  State
> {
  constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public deleteEntry() {
    const { entry, user } = this.props;
    if (!user) {
      return;
    }
    api.deleteEntry({ data: { owner: user.username, entry } }).then(
      (data: DeleteEntryResponse & ErrResponse) => {
        if (data.err) {
          message.warn('' + data.err);
        } else if (data.data.entry) {
          dispatch({
            type: 'DELETE_ENTRY',
            payload: { entry: data.data.entry },
          });
        }
      },
      (err) => {
        message.warn('' + err);
      }
    );
  }

  public render() {
    const { entry } = this.props;
    return (
      <Card className="DayContainerEntryObject">
        <h4 className="title">{entry.title}</h4>
        <div className="_id grey">{entry._id}</div>
        <div className="points">
          <Alert message={entry.points} type="success" />
        </div>
        <div className="content">{entry.content}</div>
        <div className="actionButtonDiv">
          <Button
            className="EntryEditButton"
            icon="edit"
            size="large"
            onClick={() =>
              this.setState({
                editVisible: true,
              })
            }
          />
          <Button
            className="EntryDeleteButton"
            icon="delete"
            type="danger"
            size="large"
            onClick={() => {
              Modal.confirm({
                title: 'Confirm delete?',
                okText: 'Delete',
                cancelText: 'Cancel',
                onOk: this.deleteEntry.bind(this),
              });
            }}
          />
        </div>
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
          <AddEntryFormContainer
            entry={entry}
            buttonText={'Edit entry'}
            onSubmit={() =>
              this.setState({
                editVisible: false,
              })
            }
          />
        </Modal>
      </Card>
    );
  }
}

export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    user: state.user,
  };
})(DayContainerEntryObject as any);
