import './DigestObject.css';

import React from 'react';

import { Button, List, message, Modal } from 'antd';
import DigestFormContainer from 'components/DigestModule/DigestFormContainer';
import { connect } from 'react-redux';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { DeleteDigestResponse, Digest, ErrResponse } from 'utils/api';

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
        <code>{JSON.stringify(this.props.digest)}</code>
      </List.Item>
    );
  }
}
export default connect((state: ReduxState) => {
  return {
    user: state.user,
  };
})(DigestObject);