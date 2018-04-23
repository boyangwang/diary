import { FormComponentProps } from 'antd/lib/form/Form';
import { EditorState } from 'draft-js';
import * as _ from 'lodash';
import * as moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';

import { Button, Card, DatePicker, Form, Icon, Input, message } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { Digest, ErrResponse, PostDigestResponse } from 'utils/api';
import util from 'utils/util';

import DigestEditorObject, {
  draftToHtml,
  EmptyState,
  htmlToDraft,
} from 'components/DigestModule/DigestEditorObject';
import DigestTagsObject from 'components/DigestModule/DigestTagsObject';

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
  public editorState: EditorState;
  public tags: string[];
}
class DigestFormValues {
  public id?: string;
  public createTimestamp: moment.Moment;
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

  constructor(props: Props & PropsDefaults & ReduxProps & FormComponentProps) {
    super(props);
    const editorValue = (this.props.digest && this.props.digest.content) || '';
    const editorState = htmlToDraft(editorValue);

    const tags = (this.props.digest && this.props.digest.tags) || [];
    this.state = { editorState, tags };
  }

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
        content: draftToHtml(values.content),
        lastModified: Date.now(),
        // because time picker is only up to second
        createTimestamp: values.createTimestamp.unix() * 1000,
        tags: values.tags.sort(util.compare),
      });
      api.postDigest({ data: { digest, owner: user.username } }).then(
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
            resetFields();
            if (!this.props.digest) {
              this.setState({
                editorState: EmptyState,
                tags: [],
              });
            }
            onSubmit();
          }
        },
        (err) => {}
      );
    });
  };

  public uploadImage(file: any) {
    const form = new FormData();
    const { user } = this.props;
    if (!user) {
      return;
    }
    const filename = `digest-${
      user.username
    }-${new Date().toISOString()}-${util.genRandomString()}`;
    // file is File object type
    form.append('image', file, filename);
    return api.uploadImage(form, user.username).then(
      (data: any) => {
        if (data.err) {
          message.warn('' + data.err);
          throw data.err;
        } else {
          return data;
        }
      },
      (err: any) => {
        throw err;
      }
    );
  }

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
            {getFieldDecorator('createTimestamp', {
              rules: [],
              initialValue: moment(
                _.get(digest, 'createTimestamp') || Date.now()
              ),
            })(<DatePicker showTime={true} format="YYYY-MM-DD HH:mm:ss" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('tags', {
              rules: [],
              initialValue: _.get(digest, 'tags') || [],
              normalize: (value: string[]) => {
                if (value && value.length) {
                  return value
                    .map((tag) => tag.toLocaleLowerCase())
                    .map((tag) => {
                      let chars = tag.split('');
                      chars = chars.filter((c) => /^[0-9a-z-]$/.test(c));
                      return chars.join('');
                    })
                    .filter((tag) => tag !== '');
                }
                return value;
              },
            })(
              <DigestTagsObject
                tags={this.state.tags}
                onChange={(tags: string[]) => {
                  this.setState({ tags });
                }}
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('content', {
              rules: [],
              initialValue: _.get(digest, 'content') || '',
            })(
              <DigestEditorObject
                editorState={this.state.editorState}
                onEditorStateChange={(editorState) => {
                  this.setState({ editorState });
                }}
                editorStyle={{ minHeight: '360px' }}
                toolbar={{
                  image: {
                    uploadCallback: this.uploadImage.bind(this),
                    previewImage: true,
                  },
                }}
              />
            )}
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {buttonText}
          </Button>
          <Form.Item className="hidden">
            {getFieldDecorator('_id', {
              rules: [],
              initialValue: _.get(digest, '_id'),
            })(<Input type="hidden" />)}
          </Form.Item>
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
