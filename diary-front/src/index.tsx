import 'url-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';

import { unregister } from './registerServiceWorker';
unregister();
import store from 'reducers/store';
import mylog from 'utils/mylog';
import './utils/errReport';

import DiaryApp from './components/DiaryApp';

import 'antd/dist/antd.css';
import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <DiaryApp />
    </Router>
  </Provider>,
  document.getElementById('root')
);

mylog('diary-front');

(document as any).getElementById('loadingDiv').remove();
