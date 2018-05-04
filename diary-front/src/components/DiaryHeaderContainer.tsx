import React from 'react';
import { connect } from 'react-redux';
import { Link, NavLink, withRouter } from 'react-router-dom';

import { Button, Dropdown, Icon, Layout, Menu } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { CommonPageProps } from 'utils/api';
import util from 'utils/util';

import './DiaryHeaderContainer.css';

class ReduxProps {
  public user: User | null;
  public backendVersion: null | string;
}
class Props extends CommonPageProps {
  public onChangeTab?: any = (tab: string) => () => {};
}
class DiaryHeaderContainer extends React.Component<Props & ReduxProps> {
  public static defaultProps = new Props();

  public logout() {
    api.logout().then(
      () => {
        dispatch({
          type: 'LOGOUT',
          payload: { user: null },
        });
      },
      (err) => {}
    );
  }

  public sync() {
    window.location.reload();
    // dispatch({
    //   type: 'SYNC',
    // });
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
          <Menu.Item key="about">
            <Button
              onClick={() => {
                try {
                  (window as any).diary.animate();
                } catch (e) {}
              }}
            >
              About
            </Button>
          </Menu.Item>
        </Menu>
      </Layout.Header>
    );
  }

  public renderLoginHeader() {
    const { user, backendVersion, onChangeTab, match } = this.props;

    const userMenuItem = (
      <Menu className="UserMenuContainer">
        <Menu.Item>
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

        <Menu.ItemGroup
          title={
            <div key="username" className="usernameDiv">
              <Icon type="user" />&nbsp;{user && user.username}
            </div>
          }
          className="usernameItemGroup"
        >
          <Menu.Item key="sync">
            <a onClick={this.sync}>Sync</a>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="issue">
            <a
              target="_blank"
              href="https://github.com/boyangwang/diary/issues/new"
            >
              Issue
            </a>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="about">
            <a
              onClick={() => {
                try {
                  (window as any).diary.animate();
                } catch (e) {}
              }}
            >
              About
            </a>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout">
            <a onClick={this.logout}>Logout</a>
          </Menu.Item>
        </Menu.ItemGroup>
      </Menu>
    );

    return (
      <Layout.Header className="DiaryHeaderContainer">
        <Menu theme="light" mode="horizontal">
          <Menu.Item key="entry" className="DiaryHeaderMenuItemContainer">
            <NavLink className="NavLink" to="/entry">
              E
            </NavLink>
          </Menu.Item>
          <Menu.Item key="todo" className="DiaryHeaderMenuItemContainer">
            <NavLink className="NavLink" to="/todo">
              T
            </NavLink>
          </Menu.Item>
          <Menu.Item key="digest" className="DiaryHeaderMenuItemContainer">
            <NavLink className="NavLink" to="/digest">
              D
            </NavLink>
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

export default util.wrappedWithRouter(
  connect<ReduxProps, {}, Props>((state: ReduxState) => {
    return {
      user: state.user,
      backendVersion: state.backendVersion,
    };
  })(DiaryHeaderContainer)
);
