import './EntryWeekContainer.css';

import { Collapse } from 'antd';
import React from 'react';

import EntryDayContainer from 'components/EntryModule/EntryDayContainer';
import util from 'utils/util';

class Props {
  public date: string;
}
class EntryWeekContainer extends React.Component<Props> {
  public render() {
    const { date } = this.props;
    const weekdays = util.getWeekdaysFromDateString(date);
    const todayString = util.getTodayStringWithOffset();

    return (
      <div className="EntryWeekContainer">
        <Collapse>
          <Collapse.Panel header="Weekdays" key="weekdays">
            <div className="EntryDaysDiv">
              {weekdays.map((d) => (
                <EntryDayContainer
                  key={d}
                  date={d}
                  highlight={d === todayString}
                />
              ))}
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}

export default EntryWeekContainer;
