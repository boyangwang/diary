import './WeekContainer.css';

import React from 'react';
import { Card } from 'antd';

import util from 'utils/util';
import DayContainer from 'components/DayContainer';

class WeekContainer extends React.Component {
  render() {
    const { date } = this.props;
    const weekdays = util.getWeekdaysFromDateString(date);
    const todayString = util.getTodayStringWithOffset();

    return (
      <Card title="WeekContainer" className="WeekContainerCard">
        <div className="WeekContainer">
          {weekdays.map((d) => (
            <DayContainer key={d} date={d} highlight={d === todayString} />
          ))}
        </div>
      </Card>
    );
  }
}

export default WeekContainer;
