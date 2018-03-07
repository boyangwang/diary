import 'promise-polyfill/src/polyfill';
import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import reducer from './reducers';
import DiaryApp from './components/DiaryApp';
import api from './utils/api';
// TODO: SW requires https
// import registerServiceWorker from './registerServiceWorker';
// registerServiceWorker();

import 'antd/dist/antd.css';

const store = createStore(
  reducer,
  compose(
    applyMiddleware(
      thunkMiddleware, // lets us dispatch() functions
      createLogger()
    ),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

ReactDOM.render(
  <Provider store={store}>
    <DiaryApp />
  </Provider>,
  document.getElementById('root')
);
