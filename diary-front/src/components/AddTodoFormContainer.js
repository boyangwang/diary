import React from 'react';
import { connect } from 'react-redux';
import { Card, Form, Icon, Input, InputNumber, Button, message } from 'antd';

import api from 'utils/api';
import util from 'utils/util';

class AddTodoFormContainer extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { user } = this.props;
    this.props.form.validateFields((err, values) => {
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
              this.props.dispatch({
                type: 'POST_TODO',
                payload: { todo: data.data.todo },
              });
            }
          },
          (err) => {
            message.warn('' + err);
          }
        )
        .then(() => this.props.form.resetFields());
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Card>
        <Form onSubmit={this.handleSubmit} className="AddTodoFormContainer">
          <Form.Item>
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Title required' }],
            })(<Input prefix={<Icon type="plus" />} placeholder="Title" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('priority', {
              rules: [{ required: true, message: 'Priority required' }],
            })(
              <InputNumber prefix={<Icon type="" />} placeholder="Priority" />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('content', {
              rules: [],
            })(<Input placeholder="Content" />)}
          </Form.Item>
          <Form.Item className="hidden">
            {getFieldDecorator('date', {
              rules: [],
              initialValue: util.getTodayStringWithOffset(),
            })(<Input type="hidden" />)}
          </Form.Item>
          <Form.Item className="hidden">
            {getFieldDecorator('check', {
              rules: [],
              initialValue: false,
            })(<Input type="hidden" />)}
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Add todo
          </Button>
        </Form>
      </Card>
    );
  }
}
const WrappedAddTodoFormContainer = Form.create()(AddTodoFormContainer);

export default connect((state) => {
  return {
    user: state.user,
  };
})(WrappedAddTodoFormContainer);
