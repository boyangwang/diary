import { FormComponentProps } from 'antd/lib/form/Form';
import * as _ from 'lodash';
import * as moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';

import {
  AutoComplete,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Switch,
} from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, {
  EntriesDateMap,
  Entry,
  ErrResponse,
  PostEntryResponse,
  FrequencyMap,
} from 'utils/api';
import util from 'utils/util';

import './EntryFormContainer.css';

class Props {
  public entry?: Entry;
  public buttonText?: string;
  public form?: any;
  public onSubmit?: () => void;
  public categoryFrequencyMap?: FrequencyMap | null;
}
class PropsDefaults extends Props {
  public buttonText: string = 'Add entry';
  public onSubmit: () => void = () => {};
}
class ReduxProps {
  public user: User | null;
  public entriesDateMap: EntriesDateMap;
}
class EntryFormValues {
  public _id?: string;
  public date: moment.Moment;
  public title: string;
  public content: string;
  public points: number;
}
class State {
  public useAllCategoryFrequencyMap: boolean = false;
}
class EntryFormContainer extends React.Component<
  Props & PropsDefaults & ReduxProps & FormComponentProps,
  State
> {
  public static defaultProps = new PropsDefaults();

  public constructor(props: Props & ReduxProps & FormComponentProps & PropsDefaults) {
    super(props);
    this.state = new State();
  }

  public handleSubmit = (e: any) => {
    e.preventDefault();
    const { user, onSubmit } = this.props;
    const { validateFields, resetFields } = this.props.form;
    if (!user) {
      return;
    }
    validateFields((validateErr: any, values: EntryFormValues) => {
      if (validateErr) {
        return;
      }
      const entry: Entry = Object.assign({}, values, {
        date: values.date.format(util.dateStringFormat),
      });
      api.postEntry({ data: { entry, owner: user.username } }).then(
        (data: PostEntryResponse & ErrResponse) => {
          if (data.err) {
            message.warn('' + data.err);
          } else {
            if (data.data.entry) {
              dispatch({
                type: 'POST_ENTRY',
                payload: { entry: data.data.entry },
              });
            } else {
              dispatch({
                type: 'UPDATE_ENTRY',
                payload: { entry },
              });
            }
            resetFields();
            onSubmit();
          }
        },
        (err) => {}
      );
    });
  };

  public getCategorySuggestions() {
    const { entriesDateMap, categoryFrequencyMap } = this.props;
    if (!entriesDateMap) {
      return [];
    }
    if (categoryFrequencyMap && this.state.useAllCategoryFrequencyMap) {
      return util.frequencyMapToSuggestionOptions(categoryFrequencyMap);
    }
    const partialCategoryFrequencyMap = {};

    Object.keys(entriesDateMap).forEach((date) => {
      const entries = entriesDateMap[date];
      entries.forEach((entry) => {
        partialCategoryFrequencyMap[entry.title] = partialCategoryFrequencyMap[entry.title]
          ? partialCategoryFrequencyMap[entry.title] + 1
          : 1;
      });
    });

    return util.frequencyMapToSuggestionOptions(partialCategoryFrequencyMap);
  }

  public incrementDecrementDate(offset: number) {
    const { setFieldsValue, getFieldValue } = this.props.form;
    setFieldsValue({
      date: getFieldValue('date').add(offset, 'days'),
    });
  }

  public render() {
    const { getFieldDecorator } = this.props.form;
    const { buttonText, entry } = this.props;

    return (
      <Card>
        <Form onSubmit={this.handleSubmit} className="EntryFormContainer">
          <Form.Item className="EntryFormCategoryRow">
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Title required' }],
              initialValue: _.get(entry, 'title'),
              normalize: (
                value: string,
                prevValue: string,
                allValues: string[]
              ) => {
                if (!value) {
                  return '';
                } else if (!_.isString(value)) {
                  return value;
                } else {
                  return value.toLocaleLowerCase();
                }
              },
            })(
              // 这里为什么要空的datasource? 因为antd type文件写错了 datasource必须 万幸children会覆盖
              <AutoComplete
                className="EntriesCategoryShowAutoComplete"
                placeholder="Title"
                dataSource={[]}
                optionLabelProp="value"
              >
                {this.getCategorySuggestions().map((t) => {
                  return (
                    <AutoComplete.Option key={t.title} value={t.title}>
                      <span className="EntryTitleOptionTitle">{t.title}</span>
                      <span className="EntryTitleOptionFrequency">
                        {t.frequency}
                      </span>
                    </AutoComplete.Option>
                  );
                })}
              </AutoComplete>
            )}
            <Switch
              className="EntriesCategoryShowSwitch"
              checkedChildren="All" unCheckedChildren="Cur"
              onChange={(checked) => { this.setState({ useAllCategoryFrequencyMap: checked }); }}
            />
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('points', {
              rules: [{ required: true, message: 'Points required' }],
              initialValue: _.get(entry, 'points') || 1,
            })(<InputNumber placeholder="Points" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('content', {
              rules: [],
              initialValue: _.get(entry, 'content'),
            })(<Input placeholder="Content" />)}
          </Form.Item>
          <Form.Item className="FlexFormItem">
            <div className="ArrowButtonDiv">
              <Button
                shape="circle"
                icon="left"
                onClick={() => this.incrementDecrementDate(-1)}
              />
            </div>
            {getFieldDecorator('date', {
              rules: [{ required: true, message: 'Date required' }],
              initialValue: _.get(entry, 'date')
                ? moment(_.get(entry, 'date'))
                : moment(),
            })(
              <DatePicker
              // if editing entry, we used to not allow change date
              // now allowed
              // disabled={!!_.get(entry, 'date')}
              />
            )}
            <div className="ArrowButtonDiv">
              <Button
                shape="circle"
                icon="right"
                onClick={() => this.incrementDecrementDate(1)}
              />
            </div>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {buttonText}
          </Button>
          <Button
            onClick={() => {
              this.props.form.resetFields();
            }}
          >
            Reset fields
          </Button>
          <Form.Item className="hidden">
            {getFieldDecorator('_id', {
              rules: [],
              initialValue: _.get(entry, '_id'),
            })(<Input type="hidden" />)}
          </Form.Item>
        </Form>
      </Card>
    );
  }
}
const WrappedEntryFormContainer = Form.create()(EntryFormContainer);

export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    user: state.user,
    entriesDateMap: state.entriesDateMap,
  };
})(WrappedEntryFormContainer);
