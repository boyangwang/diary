import DayContainer from 'components/DayContainer';
import util from 'utils/util';
import React from 'react';

import './WeekContainer.css';

class WeekContainer extends React.Component {
  render() {
    const { date } = this.props;
    const weekdays = util.getWeekdaysFromDateString(date);
    return (
      <div className="WeekContainer">
        {weekdays.map((d) => <DayContainer key={d} date={d} />)}
      </div>
    );
  }
}

export default WeekContainer;
