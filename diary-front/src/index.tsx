import 'antd/dist/antd.css';
import './index.css';

import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

// TODO: SW requires https
// import registerServiceWorker from './registerServiceWorker';
// registerServiceWorker();
import store from 'reducers/store';
import mylog from 'utils/mylog';
import DiaryApp from './components/DiaryApp';
import './utils/errReport';

ReactDOM.render(
  <Provider store={store}>
    <DiaryApp />
  </Provider>,
  document.getElementById('root')
);

mylog('diary-front');
