import React from 'react';

import { Collapse } from 'antd';

import util from 'utils/util';

import EntryDayContainer from 'components/EntryModule/EntryDayContainer';

import './EntryWeekContainer.css';

class Props {
  public dateRange: string[];
  public highlights?: {
    [date: string]: React.ReactNode;
  } = {};
  public hasCollapsePanel?: boolean = true;
}
class EntryWeekContainer extends React.Component<Props> {
  public static defaultProps = new Props();

  public render() {
    const { dateRange, hasCollapsePanel, highlights } = this.props;
    const todayString = util.getTodayStringWithOffset();

    let content = (
      <div className="EntryDaysDiv">
        {dateRange.length === 0
          ? 'Empty data'
          : dateRange.map((d) => (
              <EntryDayContainer
                key={d}
                date={d}
                todayMark={d === todayString}
                highlight={highlights![d]}
              />
            ))}
      </div>
    );

    if (hasCollapsePanel) {
      content = (
        <Collapse>
          <Collapse.Panel header="Days details" key="details">
            {content}
          </Collapse.Panel>
        </Collapse>
      );
    }

    return <div className="EntryWeekContainer">{content}</div>;
  }
}

export default EntryWeekContainer;
