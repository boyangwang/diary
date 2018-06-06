import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';

import { Layout, message } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { ApiTestResponse, CommonPageProps, ErrResponse } from 'utils/api';
import mylog from 'utils/mylog';
import util from 'utils/util';

import DiaryHeaderContainer from 'components/DiaryHeaderContainer';
import DiaryLoginView from 'components/DiaryLoginView';
import DigestSingleView from 'components/DigestModule/DigestSingleView';
import DigestView from 'components/DigestModule/DigestView';
import EntryView from 'components/EntryModule/EntryView';
import ReminderView from 'components/ReminderModule/ReminderView';
import ReminderTriggeredContainer from 'components/ReminderModule/ReminderTriggeredContainer';
import TodoView from 'components/TodoModule/TodoView';

import './DiaryApp.css';

class Props extends CommonPageProps {}
class ReduxProps {
  public user: User | null;
}
class State {
  public activeTab: string = 'entry';
}
class DiaryApp extends React.Component<Props & ReduxProps, State> {
  public static defaultProps = new Props();

  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public componentWillMount() {
    api.apiTest().then(
      (data: ApiTestResponse & ErrResponse) => {
        if (data.err) {
          message.warn('' + data.err);
        } else {
          dispatch({
            type: 'VERSION',
            payload: { backendVersion: data.data.backendVersion },
          });
          dispatch({
            type: 'LOGIN',
            payload: { user: data.data.user },
          });
        }
      },
      (err) => {}
    );
  }

  public render() {
    const { user } = this.props;
    const { activeTab } = this.state;

    return (
      <div className="DiaryApp">
        <Layout>
          <DiaryHeaderContainer />
          <Layout.Content>
            {user && <ReminderTriggeredContainer />}
            {user ? (
              <Switch>
                <Route path="/entry" component={EntryView} />
                <Route path="/todo" component={TodoView} />
                <Route path="/reminder" component={ReminderView} />
                <Route path="/digest/:id" component={DigestSingleView} />
                <Route path="/digest" component={DigestView} />
                <Redirect to="/entry" exact={true} push={false} />
              </Switch>
            ) : (
              <DiaryLoginView />
            )}
          </Layout.Content>
        </Layout>
      </div>
    );
  }
}

export default withRouter(connect<ReduxProps, {}, Props>(
  (state: ReduxState) => {
    return {
      user: state.user,
    };
  }
)(DiaryApp) as any);
