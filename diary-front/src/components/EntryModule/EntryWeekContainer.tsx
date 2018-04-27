import React from 'react';

import { Collapse } from 'antd';

import util from 'utils/util';

import EntryDayContainer from 'components/EntryModule/EntryDayContainer';

import './EntryWeekContainer.css';

class Props {
  public dateRange: string[];
}
class EntryWeekContainer extends React.Component<Props> {
  public render() {
    const { dateRange } = this.props;
    const todayString = util.getTodayStringWithOffset();

    return (
      <div className="EntryWeekContainer">
        <Collapse>
          <Collapse.Panel header="Days details" key="details">
            <div className="EntryDaysDiv">
              {dateRange.map((d) => (
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
