import { FormComponentProps } from 'antd/lib/form/Form';
import * as _ from 'lodash';
import * as moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';

import {
  Button,
  Card,
  DatePicker,
  Form,
  Icon,
  Input,
  InputNumber,
  message,
  Select,
} from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { ErrResponse, PostReminderResponse, Reminder } from 'utils/api';
import util from 'utils/util';

class Props {
  public reminder?: Reminder;
  public buttonText?: string;
  public form?: any;
  public onSubmit?: () => void;
}
class PropsDefaults {
  public buttonText: string = 'Add reminder';
  public onSubmit: () => void = () => {};
}
class ReduxProps {
  public user: User | null;
}
class ReminderFormContainer extends React.Component<
  Props & PropsDefaults & ReduxProps & FormComponentProps,
  {}
> {
  public static defaultProps = new PropsDefaults();

  public handleSubmit = (e: any) => {
    e.preventDefault();
    const { user, onSubmit } = this.props;
    const { validateFields, resetFields } = this.props.form;
    if (!user) {
      return;
    }
    validateFields((validateErr: any, reminder: Reminder) => {
      if (validateErr) {
        return;
      }
      api.postReminder({ data: { reminder, owner: user.username } }).then(
        (data: PostReminderResponse & ErrResponse) => {
          if (data.err) {
            message.warn('' + data.err);
          } else {
            if (data.data.reminder) {
              dispatch({
                type: 'POST_REMINDER',
                payload: { reminder: data.data.reminder },
              });
            } else {
              dispatch({
                type: 'UPDATE_REMINDER',
                payload: { reminder },
              });
            }
          }
          resetFields();
          onSubmit();
        },
        (err) => {}
      );
    });
  };

  public render() {
    const { getFieldDecorator } = this.props.form;
    const { buttonText, reminder } = this.props;

    return (
      <Card>
        <Form onSubmit={this.handleSubmit} className="ReminderFormContainer">
          <Form.Item>
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Title required' }],
              initialValue: _.get(reminder, 'title'),
            })(<Input prefix={<Icon type="plus" />} placeholder="Title" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('content', {
              rules: [],
              initialValue: _.get(reminder, 'content'),
            })(<Input placeholder="Content" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('cycleType', {
              rules: [{ required: true, message: 'cycleType required' }],
              initialValue: _.get(reminder, 'cycleType'),
            })(
              <Select placeholder="cycleType">
                <Select.Option value="year">Year</Select.Option>
                <Select.Option value="month">Month</Select.Option>
                <Select.Option value="week">Week</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('cycleTime', {
              rules: [
                { required: true, message: 'cycleTime required' },
                {
                  validator: (rule: any, value: any, callback: any) => {
                    const cycleType = this.props.form.getFieldValue(
                      'cycleType'
                    );
                    switch (cycleType) {
                      case 'year':
                        if (
                          !/^(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/.test(
                            value
                          )
                        ) {
                          callback(
                            'Invalid. Year cycleTime should be like 01-01 12-31'
                          );
                        }
                        break;
                      case 'month':
                        if (!/^-?([1-9]|1[0-9]|2[0-9]|3[0-1])$/.test(value)) {
                          callback(
                            'Invalid. Month cycleTime should be like -1 -10 30 5'
                          );
                        }
                        break;
                      case 'week':
                        if (!/^[1-7]$/.test(value)) {
                          callback(
                            'Invalid. Week cycleTime should be like 1 2 3 4'
                          );
                        }
                        break;
                      default:
                    }
                    callback();
                  },
                },
              ],
              initialValue: _.get(reminder, 'cycleTime'),
            })(
              <Input.TextArea
                placeholder={`Year: 01-01 12-31\nMonth: 1 30 31 -1\nWeek: 1 7\n`}
                autosize={{ minRows: 3, maxRows: 3 }}
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('createTimestamp', {
              rules: [],
              initialValue: moment(
                _.get(reminder, 'createTimestamp') || Date.now()
              ),
            })(<DatePicker showTime={true} format="YYYY-MM-DD HH:mm:ss" />)}
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
              initialValue: _.get(reminder, '_id'),
            })(<Input type="hidden" />)}
          </Form.Item>
        </Form>
      </Card>
    );
  }
}
const WrappedReminderFormContainer = Form.create()(ReminderFormContainer);

export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    user: state.user,
  };
})(WrappedReminderFormContainer);
