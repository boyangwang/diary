import { Button, Form, Icon, Input, message } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { FormComponentProps } from 'antd/lib/form';
import { dispatch } from 'reducers/store';
import api, { ErrResponse, LoginResponse } from 'utils/api';

class Props {
  public form?: any;
}
class State {
  public loading: boolean = false;
}
class LoginFormValues {
  public username: string;
  public password: string;
}
class NormalLoginForm extends React.Component<
  Props & FormComponentProps,
  State
> {
  constructor(props: Props & FormComponentProps) {
    super(props);
    this.state = new State();
  }

  public handleSubmit = (e: any) => {
    this.setState({ loading: true });
    e.preventDefault();
    this.props.form.validateFields(
      (validateErr: any, values: LoginFormValues) => {
        if (!validateErr) {
          api.login(values).then(
            (data: LoginResponse & ErrResponse) => {
              if (data.err) {
                message.warn('' + data.err);
              } else {
                dispatch({
                  type: 'LOGIN',
                  payload: { user: data.data.user },
                });
              }
              this.setState({ loading: false });
            },
            (err) => {
              message.warn('' + err);
              this.setState({ loading: false });
            }
          );
        }
      }
    );
  };

  public render() {
    const { getFieldDecorator } = this.props.form;
    const { loading } = this.state;
    return (
      <Form onSubmit={this.handleSubmit} className="LoginView">
        <Form.Item>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password"
            />
          )}
        </Form.Item>
        <Form.Item>
          {/* {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(
            <Checkbox>Remember me</Checkbox>
          )} */}
          {/* <a className="login-form-forgot" href="">Forgot password</a> */}
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Log in
          </Button>
          <Button
            className="login-form-button"
            icon=""
            href="/api/oauth/github"
            onClick={() => this.setState({ loading: true })}
          >
            <Icon type="github" /> Log in using GitHub{' '}
            {loading && <Icon type="loading" />}
          </Button>
          {/* Or <a href="">register now!</a> */}
        </Form.Item>
      </Form>
    );
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

export default connect()(WrappedNormalLoginForm);
