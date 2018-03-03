import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch'

import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import reducer from './reducers'
import Diary from './containers/Diary';
import api from './utils/api';
// TODO: SW requires https
// import registerServiceWorker from './registerServiceWorker';
// registerServiceWorker();

const store = createStore(
    reducer,
    applyMiddleware(
      thunkMiddleware, // lets us dispatch() functions
      createLogger()
    )
);

ReactDOM.render(
    <Provider store={store}>
        <Diary />
    </Provider>, document.getElementById('root'));

