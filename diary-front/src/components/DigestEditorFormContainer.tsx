import { Button, Card, Form, Icon, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import DraftToHtml from 'draftjs-to-html';
import React from 'react';

import DigestEditorObject from 'components/DigestEditorObject';
import DigestTagsObject from 'components/DigestTagsObject';
import { connect } from 'react-redux';
import { ReduxState, User } from 'reducers';

class Props {
  public buttonText?: string;
  public form?: any;
  public onSubmit?: () => void;
}
class PropsDefaults {
  public buttonText: string = 'Save digest';
  public onSubmit: () => void = () => {};
}
class ReduxProps {
  public user: User | null;
}
class State {
  public editorState: string;
}
class FormValues {
  public title: string;
  public content: any;
}
class DigestEditorFormContainer extends React.Component<
  Props & PropsDefaults & ReduxProps & FormComponentProps,
  State
> {
  public static defaultProps = new PropsDefaults();

  public handleSubmit = (e: any) => {
    e.preventDefault();
    const { user, onSubmit } = this.props;
    const { validateFields } = this.props.form;
    if (!user) {
      return;
    }
    validateFields((validateErr: any, values: FormValues) => {
      if (validateErr) {
        return;
      }
      if (values.content) {
        values.content = DraftToHtml(values.content);
      }
      onSubmit();
      console.log('XXX values', values);
    });
  };

  public render() {
    const { getFieldDecorator } = this.props.form;
    const { buttonText } = this.props;

    return (
      <Card>
        <Form onSubmit={this.handleSubmit} className="DigestEditorFormContainer">
          <Form.Item>
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Title required' }],
              initialValue: '',
            })(<Input prefix={<Icon type="plus" />} placeholder="Title" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('tags', {
              rules: [],
              initialValue: '',
              valuePropName: 'tags',
            })(<DigestTagsObject />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('content', {
              rules: [],
              initialValue: '',
            })(<DigestEditorObject />)}
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {buttonText}
          </Button>
        </Form>
      </Card>
    );
  }
}
const WrappedDigestEditorFormContainer = Form.create()(DigestEditorFormContainer);
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    user: state.user,
  };
})(WrappedDigestEditorFormContainer as any);
