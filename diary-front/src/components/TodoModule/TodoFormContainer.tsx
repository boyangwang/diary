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
import api, { ErrResponse, PostTodoResponse, Todo } from 'utils/api';
import util from 'utils/util';

class Props {
  public todo?: Todo;
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
class TodoFormValues {
  public _id?: string;
  public date: string;
  public title: string;
  public content: string;
  public priority: number;
  public check: boolean;
  public dueDate?: moment.Moment;
}
class TodoFormContainer extends React.Component<
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
    validateFields((validateErr: any, values: TodoFormValues) => {
      if (validateErr) {
        return;
      }
      const todo: Todo = Object.assign({}, values, {
        dueDate: values.dueDate
          ? values.dueDate.format(util.dateStringFormat)
          : null,
      });
      api
        .postTodo({ data: { todo, owner: user.username } })
        .then(
          (data: PostTodoResponse & ErrResponse) => {
            if (data.err) {
              message.warn('' + data.err);
            } else {
              if (data.data.todo) {
                dispatch({
                  type: 'POST_TODO',
                  payload: { todo: data.data.todo },
                });
              } else {
                dispatch({
                  type: 'UPDATE_TODO',
                  payload: { todo },
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
    const { buttonText, todo } = this.props;

    return (
      <Card>
        <Form onSubmit={this.handleSubmit} className="TodoFormContainer">
          <Form.Item>
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Title required' }],
              initialValue: _.get(todo, 'title'),
            })(<Input prefix={<Icon type="plus" />} placeholder="Title" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('priority', {
              rules: [{ required: true, message: 'Priority required' }],
              initialValue: _.get(todo, 'priority') || 12,
            })(<InputNumber placeholder="Priority" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('dueDate', {
              rules: [],
              initialValue: _.get(todo, 'dueDate')
                ? moment(_.get(todo, 'dueDate'))
                : moment(),
            })(<DatePicker placeholder="Due date" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('content', {
              rules: [],
              initialValue: _.get(todo, 'content'),
            })(<Input placeholder="Content" />)}
          </Form.Item>
          <Form.Item className="hidden">
            {getFieldDecorator('date', {
              rules: [],
              initialValue:
                _.get(todo, 'date') || util.getTodayStringWithOffset(),
            })(<Input type="hidden" />)}
          </Form.Item>
          <Form.Item className="hidden">
            {getFieldDecorator('check', {
              rules: [],
              initialValue: _.get(todo, 'check') || false,
            })(<Input type="hidden" />)}
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {buttonText}
          </Button>
          <Form.Item className="hidden">
            {getFieldDecorator('_id', {
              rules: [],
              initialValue: _.get(todo, '_id'),
            })(<Input type="hidden" />)}
          </Form.Item>
        </Form>
      </Card>
    );
  }
}
const WrappedTodoFormContainer = Form.create()(TodoFormContainer);

export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    user: state.user,
  };
})(WrappedTodoFormContainer as any);
