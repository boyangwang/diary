import './DiaryApp.css';

import { Button, Layout, Menu, message } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import DigestView from 'components/DigestModule/DigestView';
import EntryView from 'components/EntryModule/EntryView';
import LoginView from 'components/LoginView';
import TodoView from 'components/TodoModule/TodoView';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { ApiTestResponse, ErrResponse } from 'utils/api';
import mylog from 'utils/mylog';

class ReduxProps {
  public user: User | null;
  public backendVersion: null | string;
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

  public logout() {
    api.logout().then(() => {
      dispatch({
        type: 'LOGOUT',
        payload: { user: null },
      });
    });
  }

  public render() {
    const { user, backendVersion } = this.props;
    return (
      <div className="DiaryApp">
        <Layout>
          <Layout.Header>
            <div className="DiaryAppTitleDiv logo">
              <h1>DiaryApp</h1>
              <h4 className="grey">{backendVersion}</h4>
            </div>
            <Menu theme="light" mode="horizontal">
              <Menu.Item key="sync">
                <Button onClick={() => window.location.reload()}>Sync</Button>
              </Menu.Item>
              <Menu.Item key="issue">
                <Button>
                  <a
                    target="_blank"
                    href="https://github.com/boyangwang/diary/issues/new"
                  >
                    Issue
                  </a>
                </Button>
              </Menu.Item>
              {user && (
                <Menu.Item key="logout">
                  <Button onClick={this.logout}>Logout</Button>
                </Menu.Item>
              )}
            </Menu>
          </Layout.Header>
          <Layout.Content>
            {user ? (
              <div>
                <EntryView />
                <TodoView />
                <DigestView />
              </div>
            ) : (
              <LoginView />
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
    backendVersion: state.backendVersion,
  };
})(DiaryApp);
