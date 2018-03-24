import {
  Button,
  Card,
  DatePicker,
  Form,
  Icon,
  Input,
  InputNumber,
  message,
} from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import * as _ from 'lodash';
import * as moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { Entry, ErrResponse, PostEntryResponse } from 'utils/api';
import util from 'utils/util';

class Props {
  public entry?: Entry;
  public buttonText?: string;
  public form?: any;
  public onSubmit?: () => void;
}
class PropsDefaults {
  public buttonText: string = 'Add entry';
  public onSubmit: () => void = () => {};
}
class ReduxProps {
  public user: User | null;
}
class EntryFormValues {
  public _id?: string;
  public date: moment.Moment;
  public title: string;
  public content: string;
  public points: number;
}
class EntryFormContainer extends React.Component<
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
    validateFields((validateErr: any, values: EntryFormValues) => {
      if (validateErr) {
        return;
      }
      const entry: Entry = Object.assign({}, values, {
        date: values.date.format(util.dateStringFormat),
      });
      api
        .postEntry({ data: { entry, owner: user.username } })
        .then(
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
            }
          },
          (err) => {
            message.warn('' + err);
          }
        )
        .then(() => {
          resetFields();
          onSubmit();
        });
    });
  };

  public render() {
    const { getFieldDecorator } = this.props.form;
    const { buttonText, entry } = this.props;

    return (
      <Card>
        <Form onSubmit={this.handleSubmit} className="EntryFormContainer">
          <Form.Item>
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
            })(<Input prefix={<Icon type="plus" />} placeholder="Title" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('points', {
              rules: [{ required: true, message: 'Points required' }],
              initialValue: _.get(entry, 'points') || 2,
            })(<InputNumber placeholder="Points" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('content', {
              rules: [],
              initialValue: _.get(entry, 'content'),
            })(<Input placeholder="Content" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('date', {
              rules: [{ required: true, message: 'Date required' }],
              initialValue: _.get(entry, 'date')
                ? moment(_.get(entry, 'date'))
                : moment(),
            })(
              // if editing entry, do not allow change date (for now)
              <DatePicker disabled={!!_.get(entry, 'date')} />
            )}
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {buttonText}
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
  };
})(WrappedEntryFormContainer as any);
