import React from 'react';
import { connect } from 'react-redux';
import util from '../utils/util';
import DayContainer from './DayContainer';
import Login from './Login';

class Diary extends React.Component {
    render() {
        const { username } = this.props;
        return (
            <div className="diary-app">
                <h1>Diary</h1>
                {username ? <DayContainer date={util.getTodayString()} />
                    : <Login />}
            </div>
        );
    }
};

export default connect((state) => {
    return { username: state.username }
})(Diary);
