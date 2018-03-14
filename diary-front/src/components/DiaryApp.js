import DiaryDateView from 'components/DiaryDateView';
import TodoView from 'components/TodoView';
import LoginView from 'components/LoginView';
import React from 'react';
import { connect } from 'react-redux';

class DiaryApp extends React.Component {
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
