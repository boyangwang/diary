import './EntryWeekContainer.css';

import { Card, Collapse } from 'antd';
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
      <Card title="EntryWeekContainer" className="EntryWeekContainerCard">
        <Collapse>
          <Collapse.Panel header="Weekdays" key="weekdays">
            <div className="EntryWeekContainer">
              {weekdays.map((d) => (
                <EntryDayContainer key={d} date={d} highlight={d === todayString} />
              ))}
            </div>
          </Collapse.Panel>
        </Collapse>
      </Card>
    );
  }
}

export default EntryWeekContainer;
