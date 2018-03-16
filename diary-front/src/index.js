import 'antd/dist/antd.css';
import './index.css';

import 'promise-polyfill/src/polyfill';
import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

// TODO: SW requires https
// import registerServiceWorker from './registerServiceWorker';
// registerServiceWorker();
import './utils/errReport';
import reducer from './reducers';
import DiaryApp from './components/DiaryApp';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(
      thunkMiddleware, // lets us dispatch() functions
      createLogger()
    )
  )
);

ReactDOM.render(
  <Provider store={store}>
    <DiaryApp />
  </Provider>,
  document.getElementById('root')
);

console.info('%c diary-front', 'font-size: 16px');
