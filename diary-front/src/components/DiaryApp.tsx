import React from 'react';
import { connect } from 'react-redux';

import { Layout, message } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { ApiTestResponse, ErrResponse } from 'utils/api';
import mylog from 'utils/mylog';
import util from 'utils/util';

import DiaryHeaderContainer from 'components/DiaryHeaderContainer';
import DiaryLoginView from 'components/DiaryLoginView';
import DigestView from 'components/DigestModule/DigestView';
import EntryView from 'components/EntryModule/EntryView';
import TodoView from 'components/TodoModule/TodoView';

import './DiaryApp.css';

class ReduxProps {
  public user: User | null;
}
class State {
  public activeTab: string = 'entry';
}
class DiaryApp extends React.Component<ReduxProps, State> {
  public constructor(props: ReduxProps) {
    super(props);
    this.state = new State();
  }

  public componentWillMount() {
    util.syncUrlParamWithState({
      urlParamName: 'tab',
      stateName: 'activeTab',
      isUrlToState: true,
      state: this.state,
      setState: this.setState.bind(this),
    });

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
          <DiaryHeaderContainer
            activeTab={activeTab}
            onChangeTab={(tab: string) => async () => {
              await this.setState({ activeTab: tab });
              util.syncUrlParamWithState({
                urlParamName: 'tab',
                stateName: 'activeTab',
                state: this.state,
                setState: this.setState.bind(this),
              });
            }}
          />
          <Layout.Content>
            {user ? (
              <div>
                {activeTab === 'entry' && <EntryView />}
                {activeTab === 'todo' && <TodoView />}
                {activeTab === 'digest' && <DigestView />}
              </div>
            ) : (
              <DiaryLoginView />
            )}
          </Layout.Content>
        </Layout>
      </div>
    );
  }
}

export default connect((state: ReduxState) => {
  return {
    user: state.user,
  };
})(DiaryApp);
