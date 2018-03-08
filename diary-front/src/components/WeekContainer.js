import DayContainer from 'components/DayContainer';
import util from 'utils/util';
import React from 'react';

import './WeekContainer.css';

class WeekContainer extends React.Component {
  render() {
    const { date } = this.props;
    const weekdays = util.getWeekdaysFromDateString(date);
    const todayString = util.getTodayStringWithOffset();

    return (
      <div className="WeekContainer">
        {weekdays.map((d) => (
          <DayContainer key={d} date={d} highlight={d === todayString} />
        ))}
      </div>
    );
  }
}

export default WeekContainer;
