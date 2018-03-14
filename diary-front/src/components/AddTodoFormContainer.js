import api from 'utils/api';
import util from 'utils/util';
import React from 'react';
import { connect } from 'react-redux';
import { Form, Icon, Input, InputNumber, Button, message } from 'antd';
const FormItem = Form.Item;

class AddTodoFormContainer extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { user } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        api.postTodo({ data: { todo: values, owner: user.username } }).then(
          (data) => {
            if (data.err) {
              message.warn('' + data.err);
            } else {
              this.props.dispatch({
                type: 'POST_TODO',
                payload: { todo: values },
              });
            }
          },
          (err) => {
            message.warn('' + err);
          }
        );
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit} className="AddTodoFormContainer">
        <FormItem>
          {getFieldDecorator('title', {
            rules: [{ required: true, message: 'Title required' }],
          })(<Input prefix={<Icon type="plus" />} placeholder="Title" />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('priority', {
            rules: [{ required: true, message: 'Priority required' }],
          })(
            <InputNumber
              prefix={<Icon type="" />}
              placeholder="Priority"
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('content', {
            rules: [],
          })(<Input placeholder="Content" />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('date', {
            rules: [],
            initialValue: util.getTodayStringWithOffset(),
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('check', {
            rules: [],
            initialValue: false,
          })(<Input type="hidden" />)}
        </FormItem>
        <Button type="primary" htmlType="submit">
          Add entry
        </Button>
      </Form>
    );
  }
}
const WrappedAddTodoFormContainer = Form.create()(AddTodoFormContainer);

export default connect((state) => {
  return {
    user: state.user,
  };
})(WrappedAddTodoFormContainer);
