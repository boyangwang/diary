import React from 'react';
import util from '../util';
import DayContainer from './DayContainer';

const Diary = () => {
    return (
        <div className="diary-app">
            <h1>Diary</h1>
            <DayContainer date={util.getTodayString()} />
        </div>
    );
};

export default Diary;
