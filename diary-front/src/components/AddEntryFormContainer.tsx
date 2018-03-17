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

import { Action, ReduxState, User } from 'reducers';
import api, { Entry, PostEntryResponse } from 'utils/api';
import util from 'utils/util';

class Props {
  public entry?: Entry;
  public buttonText: string;
  public onSubmit: () => void;

  public form?: any;
}
class ReduxProps {
  public dispatch: (action: Action) => void;
  public user: User | null;
}
class AddEntryFormValues {
  public _id?: string;
  public date: moment.Moment;
  public title: string;
  public content: string;
  public points: number;
}
class AddEntryFormContainer extends React.Component<Props & ReduxProps & FormComponentProps, {}> {
  public static defaultProps = {
    buttonText: 'Add entry',
    onSubmit: () => {},
  };

  public handleSubmit = (e: any) => {
    e.preventDefault();
    const { user, onSubmit } = this.props;
    const { validateFields, resetFields } = this.props.form;
    if (!user) {
      return;
    }
    validateFields((validateErr: any, values: AddEntryFormValues) => {
      if (validateErr) {
        return;
      }
      const entry: Entry = Object.assign({}, values, {
        date: values.date.format(util.dateStringFormat)
      });
      api
        .postEntry({ data: { entry, owner: user.username } })
        .then(
          (data: PostEntryResponse) => {
            if (data.err) {
              message.warn('' + data.err);
            } else {
              if (data.data.entry) {
                this.props.dispatch({
                  type: 'POST_ENTRY',
                  payload: { entry: data.data.entry },
                });
              } else {
                this.props.dispatch({
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
        <Form onSubmit={this.handleSubmit} className="AddEntryFormContainer">
          <Form.Item>
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Title required' }],
              initialValue: _.get(entry, 'title'),
            })(<Input prefix={<Icon type="plus" />} placeholder="Title" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('points', {
              rules: [{ required: true, message: 'Points required' }],
              initialValue: _.get(entry, 'points'),
            })(
              <InputNumber placeholder="Points" />
            )}
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
                : null,
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
const WrappedAddEntryFormContainer = Form.create()(AddEntryFormContainer);

export default connect((state: ReduxState) => {
  return {
    user: state.user,
  };
})(WrappedAddEntryFormContainer as any);
