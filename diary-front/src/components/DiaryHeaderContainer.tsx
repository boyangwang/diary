import './DiaryHeaderContainer.css';

import { Button, Layout, Menu } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api from 'utils/api';

class ReduxProps {
  public user: User | null;
  public backendVersion: null | string;
}
class DiaryHeaderContainer extends React.Component<ReduxProps> {
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
      <Layout.Header className="DiaryHeaderContainer">
        <div className="DiaryAppTitleDiv logo">
          <h1>DiaryApp</h1>
          <h4 className="grey">{backendVersion}</h4>
        </div>
        <Menu theme="light" mode="horizontal">
          <Menu.Item key="username">
            {user && user.username}
          </Menu.Item>
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
    );
  }
}

export default connect((state: ReduxState) => {
  return {
    user: state.user,
    backendVersion: state.backendVersion,
  };
})(DiaryHeaderContainer);
