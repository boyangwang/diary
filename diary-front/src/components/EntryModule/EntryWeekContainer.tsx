import React from 'react';

import { Collapse } from 'antd';

import util from 'utils/util';

import EntryDayContainer from 'components/EntryModule/EntryDayContainer';

import './EntryWeekContainer.css';

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
