import React from 'react';
import { connect } from 'umi';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';
import util from 'utils/util';

import './TodoReminderContainer.css';

class Props {}
class ReduxProps {}
class State {
  public showReminderView: boolean = false;
}
class TodoReminderContainer extends React.Component<Props & ReduxProps, State> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public render() {
    return <div className="TodoReminderContainer" />;
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {};
})(TodoReminderContainer);
