import { Icon, Input, Tag, Tooltip } from 'antd';
import React from 'react';

class Props {}
class State {
  public inputVisible: boolean;
  public inputValue: string;
}
class StateDefaults {
  public tags = [];
  public inputVisible = false;
  public inputValue = '';
}
class DigestTags extends React.Component<{}, State> {
  public tags: string[] = [];
  public input: Input | null = null;

  constructor(props: Props) {
    super(props);
    this.state = new StateDefaults();
  }

  public handleClose = (removedTag: string) => {
    const tags = this.tags.filter((tag) => tag !== removedTag);
    console.log(tags);
    this.tags = tags;
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
  };

  public saveInputRef = (input: Input | null) => (this.input = input);

  public render() {
    const { inputVisible, inputValue } = this.state;
    const tags = this.tags;
    return (
      <div>
        {tags.map((tag, index) => {
          const isLongTag = tag.length > 20;
          const tagElem = (
            <Tag
              key={tag}
              closable={index !== 0}
              afterClose={() => this.handleClose(tag)}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
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
        {!inputVisible && (
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
export default DigestTags;
