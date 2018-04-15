import './EntryView.css';

import { Button, Col, Collapse, Row } from 'antd';
import React from 'react';

import EntryFormContainer from 'components/EntryModule/EntryFormContainer';
import EntryTrendChartContainer from 'components/EntryModule/EntryTrendChartContainer';
import EntryWeekContainer from 'components/EntryModule/EntryWeekContainer';
import util from 'utils/util';

class State {
  public offset: number = 0;
}
class EntryView extends React.Component<{}, State> {
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
      <Collapse bordered={false} defaultActiveKey={['1']} className="cardlike">
        <Collapse.Panel
          header={<h2>EntryView</h2>}
          className="EntryView"
          key="1"
        >
          <EntryWeekContainer
            date={util.getTodayStringWithOffset(offset * 7)}
          />
          <Row type="flex" justify="space-between">
            <Col span={2} className="ArrowButtonColDiv">
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
            <Col span={2} className="ArrowButtonColDiv">
              <div className="ArrowButtonDiv">
                <Button
                  shape="circle"
                  icon="right"
                  onClick={this.handleArrowButtonClick('right')}
                />
              </div>
            </Col>
          </Row>
          <EntryTrendChartContainer offset={offset * 7} />
        </Collapse.Panel>
      </Collapse>
    );
  }
}
export default EntryView;
