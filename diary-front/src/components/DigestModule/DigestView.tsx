import { Collapse, List } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import DigestFormContainer from 'components/DigestModule/DigestFormContainer';
import DigestObject from 'components/DigestModule/DigestObject';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { Digest, ErrResponse, GetDigestsResponse } from 'utils/api';
import util from 'utils/util';

class State {
  public currentPage: number = 1;
  public pageSize: number = 4;
  public err: any;
}
class ReduxProps {
  public digests: Digest[];
  public user: User | null;
}
class DigestView extends React.Component<ReduxProps, State> {
  constructor(props: ReduxProps) {
    super(props);
    this.state = new State();
  }

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
    const { currentPage, pageSize } = this.state;
    const sortedByModifiedThenCreated = digests.sort((a, b) => {
      return (
        util.compare(a.lastModified, b.lastModified) * -10 +
        util.compare(a.createTimestamp, b.createTimestamp) * -1
      );
    });
    const currentPageDigests = sortedByModifiedThenCreated.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
    return (
      <div className="DigestsContainer">
        <Collapse>
          <Collapse.Panel header="Digests" key="unchecked">
            <List
              dataSource={currentPageDigests}
              renderItem={(digest: Digest) => <DigestObject digest={digest} />}
              pagination={{
                pageSize,
                current: currentPage,
                total: sortedByModifiedThenCreated.length,
                showTotal: (total: number) => `Total ${total} digests`,
                onChange: (newPage: number) =>
                  this.setState({ currentPage: newPage }),
              }}
            />
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }

  public render() {
    const { digests } = this.props;

    return (
      <div className="DigestView">
        <h2>DigestView</h2>
        {digests.length === 0 ? 'Empty' : this.renderContent()}
        <DigestFormContainer />
      </div>
    );
  }
}
export default connect((state: ReduxState) => {
  return {
    digests: state.digests,
    user: state.user,
  };
})(DigestView as any);
