import React from 'react';
import { connect } from 'react-redux';

import { Checkbox, Collapse, List } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { Digest, ErrResponse, GetDigestsResponse } from 'utils/api';
import util from 'utils/util';

import DigestAllContainer from 'components/DigestModule/DigestAllContainer';
import DigestFormContainer from 'components/DigestModule/DigestFormContainer';
import DigestObject from 'components/DigestModule/DigestObject';
import DigestSearchContainer from 'components/DigestModule/DigestSearchContainer';

class State {}
class ReduxProps {
  public digests: Digest[];
  public user: User | null;
}
class DigestView extends React.Component<ReduxProps, State> {
  constructor(props: ReduxProps) {
    super(props);
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

    return (
      <div className="DigestsContainer">
        <DigestSearchContainer digests={digests} />
        <DigestAllContainer digests={digests} />
      </div>
    );
  }

  public render() {
    const { digests } = this.props;

    return (
      <div className="DigestView">
        <h2>DigestView</h2>
        {digests.length === 0 ? 'Loading or empty...' : this.renderContent()}
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
