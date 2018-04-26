import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

import { Button, Input } from 'antd';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';

import './InputNumber.css';

class Props {
  public onChange: (newVal: any) => void;
  public suffix: string;
  public prefix: string;
}
class ReduxProps {}
class State {
  public value = 2;
}
class DiaryInputNumber extends React.Component<Props & ReduxProps, State> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public handleInputChange = (e: any) => {
    const { onChange } = this.props;
    const newVal = +e.target.value;
    if (
      !(
        _.isNumber(newVal) &&
        _.isFinite(newVal) &&
        _.isInteger(newVal) &&
        newVal >= 1
      )
    ) {
      return;
    }
    this.setState({ value: +newVal });
    onChange(newVal);
  };

  public render() {
    const { prefix, suffix } = this.props;
    const { value } = this.state;

    return (
      <div className="DiaryInputNumber">
        <div className="ArrowButtonDiv">
          <Button
            disabled={value <= 1}
            shape="circle"
            icon="left"
            onClick={() => this.handleInputChange(value - 1)}
          />
        </div>
        <Input
          size="large"
          defaultValue={value}
          onChange={this.handleInputChange}
          addonAfter={suffix}
          addonBefore={prefix}
        />
        <div className="ArrowButtonDiv">
          <Button
            shape="circle"
            icon="right"
            onClick={() => this.handleInputChange(value + 1)}
          />
        </div>
      </div>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {};
})(DiaryInputNumber);
