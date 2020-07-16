import React from 'react';
import { connect } from 'umi';

import { Button, Checkbox, Collapse, List, Row } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { Digest, ErrResponse, GetDigestsResponse } from 'utils/api';
import util from 'utils/util';

import DigestAllListContainer from '@/pages/Lanting/DigestAllListContainer';
import DigestFormContainer from '@/pages/Lanting/DigestFormContainer';
import DigestObject from '@/pages/Lanting/DigestObject';
import DigestSearchListContainer from '@/pages/Lanting/DigestSearchListContainer';

class State {}
class ReduxProps {
  public digests: Digest[];
  public user: User | null;
  public resyncCounter: number;
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
        <DigestAllListContainer digests={digests} />
        <DigestSearchListContainer digests={digests} />
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

        <DigestFormContainer
          unsavedDraft={
            localStorage.getItem('diary.digest.unsavedDraft') || null
          }
        />

        {digests.length === 0 ? 'Loading or empty...' : this.renderContent()}
      </div>
    );
  }

  public componentDidUpdate(
    prevProps: ReduxProps,
    prevState: State,
    snapshot: any
  ) {
    if (this.props.resyncCounter !== prevProps.resyncCounter) {
      this.getDigests();
    }
  }
}
export default connect((state: ReduxState) => {
  return {
    digests: state.digests,
    user: state.user,
    resyncCounter: state.resyncCounter,
  };
})(DigestView);
