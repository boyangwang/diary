import React from 'react';

class DayContainerEntryObject extends React.Component {
  render() {
    const { entry } = this.props;
    return (
      <div className="DayContainerEntryObject">
        <div className="_id">{entry._id}</div>
        <div className="title">{entry.title}</div>
        <div className="points">{entry.points}</div>
        <div className="content">{entry.content}</div>
      </div>
    );
  }
}

export default DayContainerEntryObject;
