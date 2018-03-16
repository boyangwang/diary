import api from 'utils/api';
import DiaryDateView from 'components/DiaryDateView';
import TodoView from 'components/TodoView';
import LoginView from 'components/LoginView';
import React from 'react';
import { message } from 'antd';
import { connect } from 'react-redux';

class DiaryApp extends React.Component {
  componentWillMount() {
    api.apiTest().then(
      (data) => {
        console.log('apiTest: ', data);
        if (data.err) {
          message.warn('' + data.err);
        } else {
          this.props.dispatch({
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

  render() {
    const { user } = this.props;
    return (
      <div className="DiaryApp">
        <h1>DiaryApp</h1>
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

export default connect((state) => {
  return { user: state.user };
})(DiaryApp);
