import WeekContainer from 'components/WeekContainer';
import util from 'utils/util';
import React from 'react';
import { Button, Row, Col } from 'antd';

import './DiaryDateView.css';

class DiaryDateView extends React.Component {
  constructor() {
    super();
    this.state = {
      offset: 0,
    };
  }

  handleArrowButtonClick = (direction) => () => {
    this.setState({
      offset: this.state.offset + (direction === 'left' ? -1 : +1),
    });
  };

  render() {
    const { offset } = this.state;
    return (
      <Row className="DiaryDateView" type="flex" justify="space-between">
        <Col span="2">
          <div className="ArrowButtonDiv">
            <Button
              shape="circle"
              icon="left"
              onClick={this.handleArrowButtonClick('left')}
            />
          </div>
        </Col>
        <Col span="20">
          <WeekContainer date={util.getTodayStringWithOffset(offset * 7)} />
        </Col>
        <Col span="2">
          <div className="ArrowButtonDiv">
            <Button
              shape="circle"
              icon="right"
              onClick={this.handleArrowButtonClick('right')}
            />
          </div>
        </Col>
      </Row>
    );
  }
}

export default DiaryDateView;
