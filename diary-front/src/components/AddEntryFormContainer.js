import api from 'utils/api';
import React from 'react';
import { connect } from 'react-redux';
import { Form, Icon, Input, InputNumber, Button, message, DatePicker, Card } from 'antd';
const FormItem = Form.Item;

class AddEntryFormContainer extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { date, user } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        api.postEntry({ data: { entry: values, owner: user.username } }).then(
          (data) => {
            if (data.err) {
              message.warn('' + data.err);
            } else {
              this.props.dispatch({
                type: 'postEntry',
                payload: { entry: values, date },
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
    const { date } = this.props;

    return (
      <Card>
        <Form onSubmit={this.handleSubmit} className="AddEntryFormContainer">
          <FormItem>
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Title required' }],
            })(<Input prefix={<Icon type="plus" />} placeholder="Title" />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('points', {
              rules: [{ required: true, message: 'Points required' }],
            })(
              <InputNumber
                prefix={<Icon type="hourglass" />}
                placeholder="Points"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('content', {
              rules: [],
            })(<Input placeholder="Content" />)}
          </FormItem>
          {!date && <DatePicker onChange={(date, dateString) => {
            this.props.form.setFieldsValue({ date: dateString })
          }} />}
          <Button type="primary" htmlType="submit">
            Add entry
          </Button>
          <FormItem className="hidden">
            {getFieldDecorator('date', {
              rules: [],
              initialValue: date,
            })(<Input type="hidden" />)}
          </FormItem>
        </Form>
      </Card>
    );
  }
}
const WrappedAddEntryFormContainer = Form.create()(AddEntryFormContainer);

export default connect((state) => {
  return {
    user: state.user,
  };
})(WrappedAddEntryFormContainer);
