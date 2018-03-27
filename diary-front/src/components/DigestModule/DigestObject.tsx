import './DigestObject.css';

import React from 'react';

import { Button, List, message, Modal, Row, Alert, Col } from 'antd';
import DigestFormContainer from 'components/DigestModule/DigestFormContainer';
import { connect } from 'react-redux';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { DeleteDigestResponse, Digest, ErrResponse } from 'utils/api';
import DigestTagsObject from './DigestTagsObject';
import DigestEditorObject, { htmlToDraft } from 'components/DigestModule/DigestEditorObject';

class Props {
  public digest: Digest;
}
class ReduxProps {
  public user: User | null;
}
class State {
  public editVisible: boolean = false;
}
class DigestObject extends React.Component<Props & ReduxProps, State> {
  constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public deleteDigest() {
    const { digest, user } = this.props;
    if (!user) {
      return;
    }
    api.deleteDigest({ data: { owner: user.username, digest } }).then(
      (data: DeleteDigestResponse & ErrResponse) => {
        if (data.err) {
          message.warn('' + data.err);
        } else if (data.data.digest) {
          dispatch({
            type: 'DELETE_DIGEST',
            payload: { digest: data.data.digest },
          });
        }
      },
      (err) => {
        message.warn('' + err);
      }
    );
  }

  public render() {
    const { digest } = this.props;

    return (
      <List.Item
        className="DigestObject"
        actions={[
          <Button
            className="editButton"
            key="edit"
            icon="edit"
            size="large"
            onClick={() =>
              this.setState({
                editVisible: true,
              })
            }
          />,
          <Button
            className="deleteButton"
            key="delete"
            icon="delete"
            type="danger"
            size="large"
            onClick={() => {
              Modal.confirm({
                title: 'Confirm delete?',
                okText: 'Delete',
                cancelText: 'Cancel',
                onOk: this.deleteDigest.bind(this),
              });
            }}
          />,
        ]}
      >
        <Modal
          visible={this.state.editVisible}
          onCancel={() =>
            this.setState({
              editVisible: false,
            })
          }
          footer={null}
          closable={false}
        >
          <DigestFormContainer
            digest={digest}
            buttonText={'Edit digest'}
            onSubmit={() =>
              this.setState({
                editVisible: false,
              })
            }
          />
        </Modal>
        <Row type="flex" className="DigestRow">
          <div className="createTimestamp">
            <Alert message={new Date(digest.createTimestamp).toISOString()} type="success" />
          </div>
          <h3 className="title">{digest.title}</h3>
          <div className="_id grey">{digest._id}</div>
        </Row>
        <Row type="flex" className="DigestRow">
          <div className="lastModified">
            <Alert message={'Last modified:' + new Date(digest.lastModified).toISOString()} type="success" />
          </div>
          <DigestTagsObject tags={digest.tags} editable={false} />
        </Row>
        <Row type="flex" className="DigestRow">
          <Col span={24}>
          <DigestEditorObject
            editorState={htmlToDraft(digest.content)}
            readOnly={true}
            toolbarStyle={{display: 'none'}}
          />
          </Col>
        </Row>
        {/* <code>{JSON.stringify(this.props.digest)}</code> */}
      </List.Item>
    );
  }
}
export default connect((state: ReduxState) => {
  return {
    user: state.user,
  };
})(DigestObject);
