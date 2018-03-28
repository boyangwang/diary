import { Collapse, List } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import DigestFormContainer from 'components/DigestModule/DigestFormContainer';
import DigestObject from 'components/DigestModule/DigestObject';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { Digest, ErrResponse, GetDigestsResponse } from 'utils/api';
import util from 'utils/util';

class ReduxProps {
  public digests: Digest[];
  public user: User | null;
}
class DigestView extends React.Component<ReduxProps, {}> {
  public getDigests() {
    const { user } = this.props;
    if (!user) {
      return;
    }
    api.getDigests({ owner: user.username }).then(
      (data: GetDigestsResponse & ErrResponse) => {
        dispatch({
          type: 'DIGESTS',
          payload: {
            digests: data.data,
          },
        });
      },
      (err) => {
        this.setState({ err });
      }
    );
  }

  public componentWillMount() {
    this.getDigests();
  }

  public renderContent() {
    const { digests } = this.props;
    const sortedByModifiedThenCreated = digests.sort((a, b) => {
      return (
        util.compare(a.lastModified, b.lastModified) * -10 +
        util.compare(a.createTimestamp, b.createTimestamp) * -1
      );
    });
    return (
      <div className="DigestsContainer">
        <List
          dataSource={sortedByModifiedThenCreated}
          renderItem={(digest: Digest) => <DigestObject digest={digest} />}
        />
      </div>
    );
  }

  public render() {
    const { digests } = this.props;

    return (
      <Collapse bordered={false} defaultActiveKey={['1']} className="cardlike">
        <Collapse.Panel
          header={<h2>DigestView</h2>}
          className="DigestView"
          key="1"
        >
          {digests.length === 0 ? 'Empty' : this.renderContent()}
          <DigestFormContainer />
        </Collapse.Panel>
      </Collapse>
    );
  }
}
export default connect((state: ReduxState) => {
  return {
    digests: state.digests,
    user: state.user,
  };
})(DigestView as any);
