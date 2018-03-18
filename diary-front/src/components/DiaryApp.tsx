import './DiaryApp.css';

import { message } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import DiaryDateView from 'components/DiaryDateView';
import LoginView from 'components/LoginView';
import TodoView from 'components/TodoView';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { ApiTestResponse, ErrResponse } from 'utils/api';

class ReduxProps {
  public user: User | null;
  public backendVersion: null | string;
}
class DiaryApp extends React.Component<ReduxProps> {
  public componentWillMount() {
    api.apiTest().then(
      (data: ApiTestResponse & ErrResponse) => {
        console.info('apiTest: ', data);
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
    const { user, backendVersion } = this.props;
    return (
      <div className="DiaryApp">
        <div className="DiaryAppTitleDiv">
          <h1>DiaryApp</h1>
          <h4 className="grey">{backendVersion}</h4>
        </div>
        {user ? (
          <div>
            <DiaryDateView />
            <TodoView />
          </div>
        ) : (
          <LoginView />
        )}
      </div>
    );
  }
}

export default connect((state: ReduxState) => {
  return {
    user: state.user,
    backendVersion: state.backendVersion,
  };
})(DiaryApp);
