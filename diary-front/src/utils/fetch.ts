import 'isomorphic-fetch';

import { notification } from 'antd';

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
      if (!res.ok) {
        notification.warning({
          key,
          message: 'URL: ' + url.replace(/$https?:\/\/[^/]+/, ''),
          description: 'Error: ' + res.statusText,
        });
      }
      return res;
    },
    (err) => {
      notification.close(key);
      notification.warning({
        key,
        message: 'URL: ' + url.replace(/$https?:\/\/[^/]+/, ''),
        description: 'Error: ' + err,
      });
      throw err;
    }
  );
};
