import { Icon, Input, Tag, Tooltip } from 'antd';
import React from 'react';

class Props {
  public tags?: string[];
  public onChange?: (tags: string[]) => void;
}
class State {
  public tags: string[];
  public inputVisible: boolean;
  public inputValue: string;
}
class StateDefaults {
  public tags = [];
  public inputVisible = false;
  public inputValue = '';
}
class DigestTagsObject extends React.Component<Props, State> {
  public static defaultProps: Partial<Props> = {
    onChange: (tags: string[]) => {},
  };
  public input: Input | null = null;

  constructor(props: Props) {
    super(props);
    this.state = Object.assign({}, new StateDefaults(), {
      tags: this.props.tags || [],
    });
  }

  public handleClose = (removedTag: string) => {
    const tags = this.state.tags.filter((tag) => tag !== removedTag);
    this.setState({ tags });
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
    let tags = this.state.tags;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: '',
    });
    this.props.onChange!(tags);
  };

  public saveInputRef = (input: Input | null) => (this.input = input);

  public render() {
    const { inputVisible, inputValue } = this.state;
    const tags = this.state.tags;
    return (
      <div>
        {tags.map((tag, index) => {
          const isLongTag = tag.length > 20;
          const tagElem = (
            <Tag
              key={tag}
              closable={true}
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
export default DigestTagsObject;
