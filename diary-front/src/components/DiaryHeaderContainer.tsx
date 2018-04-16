import './DiaryHeaderContainer.css';

import { Button, Dropdown, Layout, Menu } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api from 'utils/api';

class ReduxProps {
  public user: User | null;
  public backendVersion: null | string;
}
class Props {
  public activeTab: string;
  public onChangeTab: any = (tab: string) => () => {};
}
class DiaryHeaderContainer extends React.Component<Props & ReduxProps> {
  public logout() {
    api.logout().then(() => {
      dispatch({
        type: 'LOGOUT',
        payload: { user: null },
      });
    });
  }

  public renderNoLoginHeader() {
    const { user, backendVersion } = this.props;

    return (
      <Layout.Header className="DiaryHeaderContainer noLogin">
        <div className="DiaryAppTitleDiv logo">
          <h1>DiaryApp</h1>
          <h4 className="grey">
            {process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'}
          </h4>
          &nbsp;
          <h4 className="grey">v{backendVersion}</h4>
        </div>
        <Menu theme="light" mode="horizontal">
          <Menu.Item key="username">{user && user.username}</Menu.Item>
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

  public renderLoginHeader() {
    const { user, backendVersion, onChangeTab, activeTab } = this.props;

    const userMenuItem = (
      <Menu className="UserMenuContainer">
        <Menu.Item key="0">
          <div className="DiaryAppTitleDiv logo">
            <h1>DiaryApp</h1>
            <h4 className="grey">
              {process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'}&nbsp;v{
                backendVersion
              }
            </h4>
          </div>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="username">{user && user.username}</Menu.Item>
        <Menu.Item key="sync">
          <a onClick={() => window.location.reload()}>Sync</a>
        </Menu.Item>
        <Menu.Item key="issue">
          <a
            target="_blank"
            href="https://github.com/boyangwang/diary/issues/new"
          >
            Issue
          </a>
        </Menu.Item>
        <Menu.Item key="logout">
          <a onClick={this.logout}>Logout</a>
        </Menu.Item>
      </Menu>
    );

    return (
      <Layout.Header className="DiaryHeaderContainer">
        <Menu theme="light" mode="horizontal">
          <Menu.Item
            key="entry"
            className={
              'DiaryHeaderMenuItemContainer' +
              (activeTab === 'entry' ? ' active' : '')
            }
          >
            <Button className="typeButton" onClick={onChangeTab('entry')}>
              E
            </Button>
          </Menu.Item>
          <Menu.Item
            key="todo"
            className={
              'DiaryHeaderMenuItemContainer' +
              (activeTab === 'todo' ? ' active' : '')
            }
          >
            <Button className="typeButton" onClick={onChangeTab('todo')}>
              T
            </Button>
          </Menu.Item>
          <Menu.Item
            key="digest"
            className={
              'DiaryHeaderMenuItemContainer' +
              (activeTab === 'digest' ? ' active' : '')
            }
          >
            <Button className="typeButton" onClick={onChangeTab('digest')}>
              D
            </Button>
          </Menu.Item>
          <Menu.Item key="user" className="DiaryHeaderMenuItemContainer user">
            <Dropdown
              overlay={userMenuItem}
              trigger={['click']}
              placement="topRight"
            >
              <Button className="userButton" icon="user" />
            </Dropdown>
          </Menu.Item>
        </Menu>
      </Layout.Header>
    );
  }

  public render() {
    const { user } = this.props;
    if (!user) {
      return this.renderNoLoginHeader();
    } else {
      return this.renderLoginHeader();
    }
  }
}

export default connect((state: ReduxState) => {
  return {
    user: state.user,
    backendVersion: state.backendVersion,
  };
})(DiaryHeaderContainer);
