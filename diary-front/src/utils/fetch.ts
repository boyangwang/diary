import 'isomorphic-fetch';

import { notification } from 'antd';
import api from 'utils/api';
import mylog from 'utils/mylog';

notification.config({
  placement: 'bottomRight',
  bottom: 40,
  duration: 0,
});
let counter = 0;

export default (url: string, opt: any) => {
  const key = 'xhr-notification-' + counter++;
  notification.open({
    key,
    message: 'URL: ' + url.replace(/$https?:\/\/[^/]+/, ''),
    description: 'waiting...',
  });

  return fetch(url, opt).then(
    (res) => {
      notification.close(key);
      if (res.ok) {
        return res.json();
      } else {
        return res.text().then((text) => {
          const err = res.status + ' | ' + text;
          mylog('fetch err non-network path ' + err);
          notification.warning({
            key,
            message: 'URL: ' + url.replace(/$https?:\/\/[^/]+/, ''),
            description: 'Error non-network: ' + err,
          });
          throw { data: { err } };
        });
      }
    },
    (err) => {
      mylog('fetch err network path ' + err);
      notification.close(key);
      notification.warning({
        key,
        message: 'URL: ' + url.replace(/$https?:\/\/[^/]+/, ''),
        description: 'Error network: ' + err,
      });
      throw { data: { err } };
    }
  );
};
