import React from 'react';

import { connect } from 'react-redux';
import { ReduxState, User } from 'reducers';
import { Digest } from 'utils/api';

class Props {
  public digest: Digest;
  public onCheckChange?: (e: any) => void;
}
class ReduxProps {
  public user: User | null;
}
class State {
  public editVisible: boolean = false;
}
class DigestObject extends React.Component<Props & ReduxProps, State> {
  public render() {
    return JSON.stringify(this.props.digest);
  }
}
export default connect((state: ReduxState) => {
  return {
    user: state.user,
  };
})(DigestObject);
