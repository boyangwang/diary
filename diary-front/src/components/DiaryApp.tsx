import './DiaryApp.css';

import { Layout, message } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import DiaryLoginView from 'components/DiaryLoginView';
import DigestView from 'components/DigestModule/DigestView';
import EntryView from 'components/EntryModule/EntryView';
import TodoView from 'components/TodoModule/TodoView';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { ApiTestResponse, ErrResponse } from 'utils/api';
import mylog from 'utils/mylog';
import DiaryHeaderContainer from 'components/DiaryHeaderContainer';

class ReduxProps {
  public user: User | null;
}
class DiaryApp extends React.Component<ReduxProps> {
  public componentWillMount() {
    api.apiTest().then(
      (data: ApiTestResponse & ErrResponse) => {
        mylog('apiTest: ', data);
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
      (err) => {
        message.warn('' + err);
      }
    );
  }

  public render() {
    const { user } = this.props;
    return (
      <div className="DiaryApp">
        <Layout>
          <Layout.Header>
            <DiaryHeaderContainer />
          </Layout.Header>
          <Layout.Content>
            {user ? (
              <div>
                <EntryView />
                <TodoView />
                <DigestView />
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
