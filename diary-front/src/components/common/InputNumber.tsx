import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

import { Button, Form, Input } from 'antd';

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
  public input: Input | null = null;

  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public handleInputChange = (newVal: number) => {
    const { onChange } = this.props;

    this.setState({ value: newVal });
    newVal = +newVal;
    if (
      _.isNumber(newVal) &&
      _.isFinite(newVal) &&
      _.isInteger(newVal) &&
      newVal >= 1
    ) {
      onChange(newVal);
    }
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
          ref={(ref) => (this.input = ref)}
          size="large"
          value={value}
          // defaultValue={value}
          onChange={(e: any) => this.handleInputChange(e.target.value)}
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
