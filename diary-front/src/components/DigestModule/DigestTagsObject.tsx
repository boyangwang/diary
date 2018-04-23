import { Icon, Input, Tag, Tooltip } from 'antd';
import React from 'react';

import util from 'utils/util';

import './DigestTagsObject.css';

const tagColorPanel = [
  // "magenta",
  // "red",
  // "volcano",
  // "orange",
  // "gold",
  // "lime",
  // "green",
  // "cyan",
  // "blue",
  // "geekblue",
  // "purple",
  'rgba(242,122,119,1)',
  'rgba(119,242,122,1)',
  'rgba(122,119,242,1)',
  'rgba(249,145,87,1)',
  'rgba(249,87,145,1)',
  'rgba(145,249,87,1)',
  'rgba(145,87,249,1)',
  'rgba(87,249,145,1)',
  'rgba(87,145,249,1)',
  'rgba(240,192,96,1)',
  'rgba(240,96,192,1)',
  'rgba(192,240,96,1)',
  'rgba(192,96,240,1)',
  'rgba(96,240,192,1)',
  'rgba(96,192,240,1)',
  'rgba(144,192,144,1)',
  'rgba(144,144,192,1)',
  'rgba(192,144,144,1)',
  'rgba(96,192,192,1)',
  'rgba(192,96,192,1)',
  'rgba(192,192,96,1)',
  'rgba(96,144,192,1)',
  'rgba(96,192,144,1)',
  'rgba(144,96,192,1)',
  'rgba(144,192,96,1)',
  'rgba(192,96,144,1)',
  'rgba(192,144,96,1)',
  'rgba(192,144,192,1)',
  'rgba(192,192,144,1)',
  'rgba(144,192,192,1)',
  'rgba(210,123,83,1)',
  'rgba(210,83,123,1)',
  'rgba(123,210,83,1)',
  'rgba(123,83,210,1)',
  'rgba(83,210,123,1)',
  'rgba(83,123,210,1)',
];

class Props {
  public tags!: string[];
  public onChange?: (tags: string[]) => void;
  public editable?: boolean;
}
class State {
  public inputVisible: boolean;
  public inputValue: string;
}
class StateDefaults {
  public inputVisible = false;
  public inputValue = '';
}
class DigestTagsObject extends React.Component<Props, State> {
  public static defaultProps: Partial<Props> = {
    onChange: (tags: string[]) => {},
    editable: true,
  };
  public input: Input | null = null;

  constructor(props: Props) {
    super(props);
    this.state = Object.assign({}, new StateDefaults(), {
      tags: this.props.tags || [],
    });
  }

  public handleClose = (removedTag: string) => {
    const tags = this.props.tags.filter((tag) => tag !== removedTag);
    this.props.onChange!(tags);
  };

  public showInput = () => {
    this.setState(
      { inputVisible: true },
      () => this.input && this.input.focus()
    );
  };

  public handleInputChange = (e: any) => {
    this.setState({ inputValue: e.target.value });
  };

  public handleInputConfirm = () => {
    const state = this.state;
    const inputValue = state.inputValue;
    let tags = this.props.tags;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      inputVisible: false,
      inputValue: '',
    });
    this.props.onChange!(tags);
  };

  public saveInputRef = (input: Input | null) => (this.input = input);

  public render() {
    const { inputVisible, inputValue } = this.state;
    const { tags, editable } = this.props;

    return (
      <div className="DigestTagsObject">
        {tags.map((tag, index) => {
          const isLongTag = tag.length > 20;
          const tagElem = (
            <Tag
              key={tag}
              closable={editable}
              afterClose={() => this.handleClose(tag)}
              color={
                tagColorPanel[
                  Math.abs(util.stringHashCode(tag)) % tagColorPanel.length
                ]
              }
            >
              {isLongTag ? `${tag.slice(0, 40)}...` : tag}
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          );
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible &&
          editable && (
            <div onClick={this.showInput}>
              <Tag style={{ background: '#fff', borderStyle: 'dashed' }}>
                <Icon type="plus" /> New Tag
              </Tag>
            </div>
          )}
      </div>
    );
  }
}
export default DigestTagsObject;
