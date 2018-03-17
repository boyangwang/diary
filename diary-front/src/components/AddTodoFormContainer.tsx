import { Button, Card, Form, Icon, Input, InputNumber, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import * as _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

import { Action, ReduxState, User } from 'reducers';
import api, { PostTodoResponse, Todo } from 'utils/api';
import util from 'utils/util';

class Props {
  public todo?: Todo;
  public buttonText: string;
  public onSubmit: () => void;

  public form?: any;
}
class ReduxProps {
  public dispatch: (action: Action) => void;
  public user: User | null;
}
class AddTodoFormValues {
  public _id?: string;
  public date: string;
  public title: string;
  public content: string;
  public priority: number;
  public check: boolean;
}
class AddTodoFormContainer extends React.Component<Props & ReduxProps & FormComponentProps, {}> {
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
    validateFields((validateErr: any, values: AddTodoFormValues) => {
      if (validateErr) {
        return;
      }
      api
        .postTodo({ data: { todo: values, owner: user.username } })
        .then(
          (data: PostTodoResponse) => {
            if (data.err) {
              message.warn('' + data.err);
            } else {
              if (data.data.todo) {
                this.props.dispatch({
                  type: 'POST_TODO',
                  payload: { todo: data.data.todo },
                });
              } else {
                this.props.dispatch({
                  type: 'UPDATE_TODO',
                  payload: { todo: values },
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
        <Form onSubmit={this.handleSubmit} className="AddTodoFormContainer">
          <Form.Item>
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Title required' }],
              initialValue: _.get(todo, 'title'),
            })(<Input prefix={<Icon type="plus" />} placeholder="Title" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('priority', {
              rules: [{ required: true, message: 'Priority required' }],
              initialValue: _.get(todo, 'priority'),
            })(
              <InputNumber placeholder="Priority" />
            )}
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
const WrappedAddTodoFormContainer = Form.create()(AddTodoFormContainer);

export default connect((state: ReduxState) => {
  return {
    user: state.user,
  };
})(WrappedAddTodoFormContainer as any);
