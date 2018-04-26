import { SelectValue } from 'antd/lib/select';
import React from 'react';
import { connect } from 'react-redux';

import { Icon, Input, Select, Tooltip } from 'antd';

import { ReduxState } from 'reducers';
import { Digest, FrequencyMap } from 'utils/api';
import util from 'utils/util';

import Tag from 'components/common/Tag';

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
  public tags: string[];
  public editable?: boolean = true;
  public onChange?: (tags: string[]) => void = (tags: string[]) => {};
}
class ReduxProps {
  public digests: Digest[];
}
class State {
  public inputVisible: boolean = false;
  public inputValue: string = '';
}
class DigestTagsObject extends React.Component<Props & ReduxProps, State> {
  public static defaultProps = new Props();
  public input: Select | null = null;

  constructor(props: Props & ReduxProps) {
    super(props);
    this.state = Object.assign({}, new State(), {
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

  public handleInputChange = (value: SelectValue) => {
    this.setState({ inputValue: value as string });
  };

  public handleSelect = async (value: SelectValue) => {
    await this.setState({ inputValue: value as string });
    this.handleInputConfirm();
  };

  public handleInputConfirm = (e?: any) => {
    const { inputValue } = this.state;
    let tags = this.props.tags;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    setTimeout(
      this.setState({
        inputVisible: false,
        inputValue: '',
      }),
      100
    );
    this.props.onChange!(tags);
  };

  public saveInputRef = (input: Select | null) => (this.input = input);

  public getSuggestions() {
    const { digests } = this.props;
    const map: FrequencyMap = {};

    digests.forEach((d) => {
      d.tags.forEach((t) => {
        map[t] = map[t] ? map[t] + 1 : 1;
      });
    });

    return util.frequencyMapToSuggestionOptions(map).map((sugestion) => (
      <Select.Option key={sugestion.title}>
        <span className="DigestTagOptionTitle">{sugestion.title}</span>
        <span className="DigestTagOptionFrequency">{sugestion.frequency}</span>
      </Select.Option>
    ));
  }

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
        <Select
          className="DigestTagsSelect"
          style={{ display: inputVisible ? 'inline-block' : 'none' }}
          dropdownClassName="DigestTagsSelectDropDown"
          ref={this.saveInputRef}
          mode="combobox"
          filterOption={true}
          size="small"
          value={inputValue}
          defaultValue=""
          optionLabelProp="value"
          onSelect={this.handleSelect}
          onChange={this.handleInputChange}
          onBlur={this.handleInputConfirm}
        >
          {this.getSuggestions()}
        </Select>
        {!inputVisible &&
          editable && (
            <div onClick={this.showInput}>
              <Tag style={{ background: '#fff', borderStyle: 'dashed' }}>
                <a><Icon type="plus" /> New Tag</a>
              </Tag>
            </div>
          )}
      </div>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    digests: state.digests,
  };
})(DigestTagsObject as any);
