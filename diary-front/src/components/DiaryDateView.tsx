import './DiaryDateView.css';

import { Button, Col, Row } from 'antd';
import React from 'react';

import EntryFormContainer from 'components/EntryFormContainer';
import DiaryTrendChartContainer from 'components/DiaryTrendChartContainer';
import WeekContainer from 'components/WeekContainer';
import util from 'utils/util';

class State {
  public offset: number = 0;
}
class DiaryDateView extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = new State();
  }

  public handleArrowButtonClick = (direction: 'left' | 'right') => () => {
    this.setState({
      offset: this.state.offset + (direction === 'left' ? -1 : +1),
    });
  };

  public render() {
    const { offset } = this.state;
    return (
      <div className="DiaryDateView">
        <Row type="flex" justify="space-between">
          <Col span={2}>
            <div className="ArrowButtonDiv">
              <Button
                shape="circle"
                icon="left"
                onClick={this.handleArrowButtonClick('left')}
              />
            </div>
          </Col>
          <Col span={20}>
            <EntryFormContainer />
          </Col>
          <Col span={2}>
            <div className="ArrowButtonDiv">
              <Button
                shape="circle"
                icon="right"
                onClick={this.handleArrowButtonClick('right')}
              />
            </div>
          </Col>
        </Row>
        <DiaryTrendChartContainer />
        <WeekContainer date={util.getTodayStringWithOffset(offset * 7)} />
      </div>
    );
  }
}
export default DiaryDateView;
