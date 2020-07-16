import React from 'react';

import { Alert, Button, Col, List, message, Modal, Row } from 'antd';
import { Link } from 'react-router-dom';

import { connect } from 'umi';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, {
  DeleteDigestResponse,
  Digest,
  ErrResponse,
  GetDigestsResponse,
} from 'utils/api';

import DigestEditorObject, {
  htmlToDraft,
} from '@/pages/Lanting/DigestEditorObject';
import DigestFormContainer from '@/pages/Lanting/DigestFormContainer';
import DigestTagsObject from './DigestTagsObject';

import './DigestObject.css';

class Props {
  public digest: Digest;
  public highlight?: React.ReactNode;
  public editorHeight?: string;
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

  public syncItem(): void {
    const { digest, user } = this.props;
    if (!user) {
      return;
    }
    api.getDigest({ owner: user.username, _id: digest._id! }).then(
      (data: GetDigestsResponse & ErrResponse) => {
        if (data.data && data.data[0]) {
          dispatch({
            type: 'UPDATE_DIGEST',
            payload: {
              digest: data.data[0],
            },
          });
        }
      },
      (err) => {}
    );
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
      (err) => {}
    );
  }

  public render() {
    const { digest, highlight, editorHeight } = this.props;
    const shortenedLastModified = new Date(digest.lastModified)
      .toISOString()
      .substring(0, 16);
    const shortenedCreateTimestamp = new Date(digest.createTimestamp)
      .toISOString()
      .substring(0, 16);

    const modalWidth = Math.min(window.innerWidth - 60, 1200);

    return (
      <List.Item
        className="DigestObject"
        actions={[
          <Link key="openInSingle" target="_blank" to={'/digest/' + digest._id}>
            <Button
              className="openInSingleButton"
              key="openInSingle"
              icon="export"
              size="large"
            />
          </Link>,
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
            className="syncButton"
            key="sync"
            icon="reload"
            size="large"
            onClick={() => this.syncItem()}
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
          className="DigestEditFormModal"
          visible={this.state.editVisible}
          onCancel={() =>
            this.setState({
              editVisible: false,
            })
          }
          footer={null}
          closable={true}
          width={modalWidth}
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
        {highlight && (
          <Row type="flex" className="DigestRow">
            <div className="highlight">{highlight}</div>
          </Row>
        )}
        <Row type="flex" className="DigestRow">
          <div className="lastModified">
            {'Last modified: ' + shortenedLastModified}
          </div>
          <div className="createTimestamp">
            {'Created: ' + shortenedCreateTimestamp}
          </div>
          {/* <div className="_id grey">{digest._id}</div> */}
        </Row>
        <Row type="flex" className="DigestRow">
          <h3 className="title">{digest.title}</h3>
          <DigestTagsObject tags={digest.tags} editable={false} />
        </Row>
        <Row type="flex" className="DigestRow">
          <Col span={24}>
            <DigestEditorObject
              editorState={htmlToDraft(digest.content)}
              readOnly={true}
              toolbarStyle={{ display: 'none' }}
              editorStyle={{ maxHeight: editorHeight || '180px' }}
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
