import { Tag, Input, Tooltip, Icon } from 'antd';
import React from 'react';

class Props {}
class State {
  inputVisible: boolean;
  inputValue: string;
}
class StateDefaults {
  tags = [];
  inputVisible = false;
  inputValue = '';
}
class DigestTags extends React.Component<{}, State> {
  public tags: string[] = [];
  input: Input | null = null;

  constructor(props: Props) {
    super(props);
    this.state = new StateDefaults();
  }

  handleClose = (removedTag: string) => {
    const tags = this.tags.filter(tag => tag !== removedTag);
    console.log(tags);
    this.tags = tags;
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input && this.input.focus());
  }

  handleInputChange = (e: any) => {
    this.setState({ inputValue: e.target.value });
  }

  handleInputConfirm = () => {
    const state = this.state;
    const inputValue = state.inputValue;
    let tags = this.tags;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    console.log(tags);
    this.setState({
      inputVisible: false,
      inputValue: '',
    });
    this.tags = tags;
  }

  saveInputRef = (input: Input | null) => this.input = input

  render() {
    const { inputVisible, inputValue } = this.state;
    const tags = this.tags;
    return (
      <div>
        {tags.map((tag, index) => {
          const isLongTag = tag.length > 20;
          const tagElem = (
            <Tag key={tag} closable={index !== 0} afterClose={() => this.handleClose(tag)}>
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </Tag>
          );
          return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
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
        {!inputVisible && (
          <div onClick={this.showInput}>
            <Tag
              style={{ background: '#fff', borderStyle: 'dashed' }}
            >
              <Icon type="plus" /> New Tag
            </Tag>
          </div>
        )}
      </div>
    );
  }
}
export default DigestTags;
