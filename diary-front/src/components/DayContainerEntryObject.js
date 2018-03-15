import React from 'react';
import { Card, Alert } from 'antd';

import './DayContainerEntryObject.css';

class DayContainerEntryObject extends React.Component {
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
      </Card>
    );
  }
}

export default DayContainerEntryObject;
