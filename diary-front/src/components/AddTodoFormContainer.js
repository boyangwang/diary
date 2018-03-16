import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Card, Form, Icon, Input, InputNumber, Button, message } from 'antd';

import api from 'utils/api';
import util from 'utils/util';

class AddTodoFormContainer extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { user, onSubmit } = this.props;
    const { validateFields, resetFields } = this.props.form;
    validateFields((err, values) => {
      if (err) {
        return;
      }
      api
        .postTodo({ data: { todo: values, owner: user.username } })
        .then(
          (data) => {
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

  render() {
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
              <InputNumber prefix={<Icon type="" />} placeholder="Priority" />
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
              initialValue: _.get(todo, 'date') || util.getTodayStringWithOffset(),
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
AddTodoFormContainer.defaultProps = {
  buttonText: 'Add todo',
  onSubmit: () => {},
};
const WrappedAddTodoFormContainer = Form.create()(AddTodoFormContainer);

export default connect((state) => {
  return {
    user: state.user,
  };
})(WrappedAddTodoFormContainer);
