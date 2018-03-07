import DiaryDateView from 'components/DiaryDateView';
import LoginView from 'components/LoginView';
import React from 'react';
import { connect } from 'react-redux';

class DiaryApp extends React.Component {
  render() {
    const { username } = this.props;
    return (
      <div className="DiaryApp">
        <h1>DiaryApp</h1>
        {username ? <DiaryDateView /> : <LoginView />}
      </div>
    );
  }
}

export default connect((state) => {
  return { username: state.username };
})(DiaryApp);
