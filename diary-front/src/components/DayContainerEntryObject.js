import './DayContainerEntryObject.css';

import AddEntryFormContainer from './AddEntryFormContainer';

import React from 'react';
import { Modal, Card, Alert, Button } from 'antd';

class DayContainerEntryObject extends React.Component {
  state = { visible: false };

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
        <Button className="EntryEditButton" icon="edit"
          onClick={() => this.setState({
            visible: true,
          })}
        />
        <Modal
          visible={this.state.visible}
          onCancel={() => this.setState({
            visible: false,
          })}
          footer={null}
          closable={false}
        >
          <AddEntryFormContainer
            date={entry.date}
            entry={entry}
            buttonText={'Edit entry'}
            onSubmit={() => this.setState({
              visible: false,
            })}
          />
        </Modal>
      </Card>
    );
  }
}

export default DayContainerEntryObject;
