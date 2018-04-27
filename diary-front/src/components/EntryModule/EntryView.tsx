import * as moment from 'moment';
import React from 'react';

import { Button, Col, Row } from 'antd';

import util from 'utils/util';

import DiaryInputNumber from 'components/common/InputNumber';
import EntryFormContainer from 'components/EntryModule/EntryFormContainer';
import EntryTrendChartContainer from 'components/EntryModule/EntryTrendChartContainer';
import EntryWeekContainer from 'components/EntryModule/EntryWeekContainer';

import './EntryView.css';

class State {
  public tipOffset: number = 0;
  public lastDaysRange: number = 14;
}
class EntryView extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = new State();
  }

  public handleArrowButtonClick = (direction: 'left' | 'right') => () => {
    this.setState({
      tipOffset: this.state.tipOffset + (direction === 'left' ? -1 : +1),
    });
  };

  public handleDaysRangeChange = async (newVal: number) => {
    await this.setState({ lastDaysRange: newVal * 7 });
  };

  public render() {
    const { tipOffset, lastDaysRange } = this.state;
    const tipDayString = util.getTodayStringWithOffset(tipOffset);
    const tailDayString = moment(tipDayString)
      .add(-(lastDaysRange - 1), 'days')
      .format(util.dateStringFormat);
    const dateRange = util.getDateStringsFromDateRange(
      tipOffset,
      lastDaysRange
    );

    return (
      <div className="EntryView">
        <Row type="flex" style={{ alignItems: 'center' }}>
          <h2>EntryView</h2>
        </Row>
        <EntryWeekContainer dateRange={dateRange} />
        <Row type="flex" justify="space-between">
          <Col span={24}>
            <EntryFormContainer />
          </Col>
        </Row>
        <Row
          type="flex"
          style={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <Col className="ArrowButtonColDiv">
            <div className="ArrowButtonDiv">
              <Button
                shape="circle"
                icon="left"
                onClick={this.handleArrowButtonClick('left')}
              />
            </div>
          </Col>
          <Col>
            <span>{`${tailDayString} - ${tipDayString}`}</span>
          </Col>
          <Col className="ArrowButtonColDiv">
            <div className="ArrowButtonDiv">
              <Button
                shape="circle"
                icon="right"
                onClick={this.handleArrowButtonClick('right')}
              />
            </div>
          </Col>
        </Row>
        <Row
          type="flex"
          style={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <DiaryInputNumber
            onChange={this.handleDaysRangeChange}
            suffix="weeks"
            prefix="Drawing"
          />
        </Row>
        <EntryTrendChartContainer dateRange={dateRange} />
      </div>
    );
  }
}
export default EntryView;
