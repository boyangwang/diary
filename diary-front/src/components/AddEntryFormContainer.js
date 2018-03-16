import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
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

import api from 'utils/api';
import util from 'utils/util';

class AddEntryFormContainer extends React.Component {
  handleSubmit = (e) => {
    const { user, onSubmit } = this.props;
    const { validateFields, resetFields } = this.props.form;

    e.preventDefault();
    validateFields((err, values) => {
      if (err) {
        return;
      }
      values.date = values.date.format(util.dateStringFormat);
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
              <InputNumber
                prefix={<Icon type="hourglass" />}
                placeholder="Points"
              />
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
