import './WeekContainer.css';

import { Card, Collapse } from 'antd';
import React from 'react';

import DayContainer from 'components/DayContainer';
import util from 'utils/util';

class Props {
  public date: string;
}
class WeekContainer extends React.Component<Props> {
  public render() {
    const { date } = this.props;
    const weekdays = util.getWeekdaysFromDateString(date);
    const todayString = util.getTodayStringWithOffset();

    return (
      <Card title="WeekContainer" className="WeekContainerCard">
        <Collapse>
          <Collapse.Panel
            header="Weekdays"
            key="weekdays"
          >
            <div className="WeekContainer">
              {weekdays.map((d) => (
                <DayContainer key={d} date={d} highlight={d === todayString} />
              ))}
            </div>
          </Collapse.Panel>
        </Collapse>
      </Card>
    );
  }
}

export default WeekContainer;
