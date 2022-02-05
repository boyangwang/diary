import React from 'react';
import { connect } from 'react-redux';

import { Button, Checkbox, Collapse, List, Row } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { CommonPageProps, Digest, ErrResponse, GetDigestsResponse } from 'utils/api';
import util from 'utils/util';

import DigestAllListContainer from 'components/DigestModule/DigestAllListContainer';
import DigestFormContainer from 'components/DigestModule/DigestFormContainer';
import DigestObject from 'components/DigestModule/DigestObject';
import DigestSearchListContainer from 'components/DigestModule/DigestSearchListContainer';

class Props extends CommonPageProps {}
class State {}
class ReduxProps {
  public digests: Digest[];
  public user: User | null;
  public resyncCounter: number;
}
class DigestSingleView extends React.Component<Props & ReduxProps, State> {
  public id: string;

  constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
    this.id = props.match.params && props.match.params.id;
  }

  public getDigest(): void {
    const { user } = this.props;
    if (!user || !this.id) {
      return;
    }
    if (!this.id) {
      return;
    }
    api.getDigest({ owner: user.username, _id: this.id }).then(
      (data: GetDigestsResponse & ErrResponse) => {
        if (data.data && data.data[0]) {
          dispatch({
            // Why not use DIGESTS action? We can, but if it's opened in the same window, it will ease all state.digests arr
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

  public componentWillMount() {
    this.getDigest();
  }

  public renderContent() {
    const { digests } = this.props;
    if (!this.id) {
      return 'No digest';
    }
    const digest = digests.find((d) => d._id === this.id);
    if (!digest) {
      return 'No digest';
    }

    return (
      <div className="DigestsContainer">
        <DigestObject digest={digest} editorHeight="768px" />
      </div>
    );
  }

  public render() {
    const { digests } = this.props;

    return (
      <div className="DigestView">
        <Row type="flex" style={{ alignItems: 'center' }}>
          <h2>DigestView</h2>
          <Button onClick={() => localStorage.removeItem('diary.digest.unsavedDraft')}>Clear unsaved draft</Button>
        </Row>
        {digests.length === 0 ? 'Loading or empty...' : this.renderContent()}
      </div>
    );
  }

  public componentDidUpdate(prevProps: ReduxProps, prevState: State, snapshot: any) {
    if (this.props.resyncCounter !== prevProps.resyncCounter) {
      this.getDigest();
    }
  }
}
export default connect((state: ReduxState) => {
  return {
    digests: state.digests,
    user: state.user,
    resyncCounter: state.resyncCounter,
  };
})(DigestSingleView);
