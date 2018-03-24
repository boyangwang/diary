import { Button, Card, Form, Icon, Input, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import DraftToHtml from 'draftjs-to-html';
import * as _ from 'lodash';
import React from 'react';

import DigestEditorObject from 'components/DigestModule/DigestEditorObject';
import DigestTagsObject from 'components/DigestModule/DigestTagsObject';
import { EditorState } from 'draft-js';
import { connect } from 'react-redux';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { Digest, ErrResponse, PostDigestResponse } from 'utils/api';

class Props {
  public digest?: Digest;
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
class DigestFormValues {
  public id?: string;
  public createTimestamp: number;
  public lastModified: number;
  public title: string;
  public tags: string[];
  public content: EditorState;
}
class DigestFormContainer extends React.Component<
  Props & PropsDefaults & ReduxProps & FormComponentProps,
  State
> {
  public static defaultProps = new PropsDefaults();

  public handleSubmit = (e: any) => {
    e.preventDefault();
    const { user, onSubmit } = this.props;
    const { validateFields, resetFields } = this.props.form;
    if (!user) {
      return;
    }
    validateFields((validateErr: any, values: DigestFormValues) => {
      if (validateErr) {
        return;
      }
      const digest: Digest = Object.assign({}, values, {
        content: DraftToHtml(values.content),
        lastModified: Date.now(),
      });
      api
        .postDigest({ data: { digest, owner: user.username } })
        .then(
          (data: PostDigestResponse & ErrResponse) => {
            if (data.err) {
              message.warn('' + data.err);
            } else {
              if (data.data.digest) {
                dispatch({
                  type: 'POST_DIGEST',
                  payload: { digest: data.data.digest },
                });
              } else {
                dispatch({
                  type: 'UPDATE_DIGEST',
                  payload: { digest },
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
      onSubmit();
    });
  };

  public render() {
    const { getFieldDecorator } = this.props.form;
    const { buttonText, digest } = this.props;

    return (
      <Card>
        <Form onSubmit={this.handleSubmit} className="DigestFormContainer">
          <Form.Item>
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Title required' }],
              initialValue: _.get(digest, 'title') || '',
            })(<Input prefix={<Icon type="plus" />} placeholder="Title" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('tags', {
              rules: [],
              initialValue: _.get(digest, 'tags') || [],
              valuePropName: 'tags',
            })(<DigestTagsObject />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('content', {
              rules: [],
              initialValue: _.get(digest, 'content') || '',
            })(<DigestEditorObject />)}
          </Form.Item>
          <Form.Item className="hidden">
            {getFieldDecorator('createTimestamp', {
              rules: [],
              initialValue: _.get(digest, 'createTimestamp') || Date.now(),
            })(<Input type="hidden" />)}
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {buttonText}
          </Button>
        </Form>
      </Card>
    );
  }
}
const WrappedDigestFormContainer = Form.create()(DigestFormContainer);
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    user: state.user,
  };
})(WrappedDigestFormContainer as any);
