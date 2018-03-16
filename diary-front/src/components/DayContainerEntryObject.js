import './DayContainerEntryObject.css';

import api from 'utils/api';
import AddEntryFormContainer from './AddEntryFormContainer';

import React from 'react';
import { connect } from 'react-redux';

import { message, Modal, Card, Alert, Button } from 'antd';

class DayContainerEntryObject extends React.Component {
  state = { editVisible: false, deleteVisible: false };

  deleteEntry() {
    const { entry, user } = this.props;
    api.deleteEntry({data: { owner: user.username, entry }}).then(
      (data) => {
        if (data.err) {
          message.warn('' + data.err);
        } else {
          this.props.dispatch({
            type: 'DELETE_ENTRY',
            payload: { entry: data.data.entry, },
          });
        }
      },
      (err) => {
        message.warn('' + err);
      }
    );
  }

  render() {
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
          <Button className="EntryEditButton" icon="edit" size="large"
            onClick={() => this.setState({
              editVisible: true,
            })}
          />
          <Button className="EntryDeleteButton"
            icon="delete" type="danger" size="large"
            onClick={() => {
              Modal.confirm({
                title: 'Confirm delete?',
                okText: "Delete",
                cancelText: "Cancel",
                onOk: this.deleteEntry.bind(this),
              });
            }}
          />
        </div>
        <Modal
          visible={this.state.editVisible}
          onCancel={() => this.setState({
            editVisible: false,
          })}
          footer={null}
          closable={false}
        >
          <AddEntryFormContainer
            date={entry.date}
            entry={entry}
            buttonText={'Edit entry'}
            onSubmit={() => this.setState({
              editVisible: false,
            })}
          />
        </Modal>
      </Card>
    );
  }
}

export default connect((state) => {
  return {
    user: state.user,
  };
})(DayContainerEntryObject);
