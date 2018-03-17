import 'antd/dist/antd.css';
import './index.css';

import 'isomorphic-fetch';
import 'promise-polyfill/src/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

// TODO: SW requires https
// import registerServiceWorker from './registerServiceWorker';
// registerServiceWorker();
import DiaryApp from './components/DiaryApp';
import reducer from './reducers';
import './utils/errReport';

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
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
