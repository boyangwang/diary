import React from 'react';
import { connect } from 'react-redux';

import { Button, Checkbox, Collapse, List, Row } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { Digest, ErrResponse, GetDigestsResponse } from 'utils/api';
import util from 'utils/util';

import DigestAllListContainer from 'components/DigestModule/DigestAllListContainer';
import DigestFormContainer from 'components/DigestModule/DigestFormContainer';
import DigestObject from 'components/DigestModule/DigestObject';
import DigestSearchListContainer from 'components/DigestModule/DigestSearchListContainer';

class State {}
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
      (err) => {}
    );
  }

  public componentWillMount() {
    this.getDigests();
  }

  public renderContent() {
    const { digests } = this.props;

    return (
      <div className="DigestsContainer">
        <DigestSearchListContainer digests={digests} />
        <DigestAllListContainer digests={digests} />
      </div>
    );
  }

  public render() {
    const { digests } = this.props;

    return (
      <div className="DigestView">
        <Row type="flex" style={{ alignItems: 'center' }}>
          <h2>DigestView</h2>
          <Button
            onClick={() => localStorage.removeItem('diary.digest.unsavedDraft')}
          >
            Clear unsaved draft
          </Button>
        </Row>
        {digests.length === 0 ? 'Loading or empty...' : this.renderContent()}
        <DigestFormContainer
          unsavedDraft={
            localStorage.getItem('diary.digest.unsavedDraft') || null
          }
        />
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
