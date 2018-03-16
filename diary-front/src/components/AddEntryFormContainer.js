import api from 'utils/api';
import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import {
  Form,
  Icon,
  Input,
  InputNumber,
  Button,
  message,
  DatePicker,
  Card,
} from 'antd';
const FormItem = Form.Item;

class AddEntryFormContainer extends React.Component {
  handleSubmit = (e) => {
    const { date, user, onSubmit } = this.props;
    const { validateFields, resetFields } = this.props.form;

    e.preventDefault();
    validateFields((err, values) => {
      if (err) {
        return;
      }
      api
        .postEntry({ data: { entry: values, owner: user.username } })
        .then(
          (data) => {
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
                  payload: { entry: values },
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
    const { date, buttonText, entry } = this.props;

    return (
      <Card>
        <Form onSubmit={this.handleSubmit} className="AddEntryFormContainer">
          <FormItem>
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Title required' }],
              initialValue: _.get(entry, 'title') || date,
            })(<Input prefix={<Icon type="plus" />} placeholder="Title" />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('points', {
              rules: [{ required: true, message: 'Points required' }],
              initialValue: _.get(entry, 'points') || date,
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
              initialValue: _.get(entry, 'content') || date,
            })(<Input placeholder="Content" />)}
          </FormItem>
          {!date && (
            <DatePicker
              onChange={(date, dateString) => {
                this.props.form.setFieldsValue({ date: dateString });
              }}
            />
          )}
          <Button type="primary" htmlType="submit">
            {buttonText}
          </Button>
          <FormItem className="hidden">
            {getFieldDecorator('date', {
              rules: [],
              initialValue: _.get(entry, 'date') || date,
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem className="hidden">
            {getFieldDecorator('_id', {
              rules: [],
              initialValue: _.get(entry, '_id'),
            })(<Input type="hidden" />)}
          </FormItem>
        </Form>
      </Card>
    );
  }
}
AddEntryFormContainer.defaultProps = {
  buttonText: 'Add entry',
  onSubmit: () => {},
};

const WrappedAddEntryFormContainer = Form.create()(AddEntryFormContainer);

export default connect((state) => {
  return {
    user: state.user,
  };
})(WrappedAddEntryFormContainer);
