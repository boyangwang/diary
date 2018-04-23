import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import registerServiceWorker from './registerServiceWorker';
registerServiceWorker();
import store from 'reducers/store';
import mylog from 'utils/mylog';
import DiaryApp from './components/DiaryApp';
import './utils/errReport';

import 'antd/dist/antd.css';
import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <DiaryApp />
  </Provider>,
  document.getElementById('root')
);

mylog('diary-front');

(document as any).getElementById('loadingDiv').remove();
