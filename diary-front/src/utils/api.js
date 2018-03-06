const PROTOCOL = process.env.REACT_APP_PROTOCOL;
const DOMAIN = process.env.REACT_APP_DOMAIN;
const PORT = process.env.REACT_APP_PORT;

const PREFIX = (PROTOCOL ? PROTOCOL + '://' : '')
  + (DOMAIN ? DOMAIN : '') + (PORT ? ':' + PORT : '') + '/';

const apis = {
  apiTest: 'api/apiTest',
  login: 'login'
};

const apiTest = () => {
  return new Promise((resolve, reject) => {
    fetch(PREFIX + apis.apiTest).then(res => {
      resolve(res.json());
    }, err => {
      reject(err);
    });
  });
};

const login = (params) => {
  return new Promise((resolve, reject) => {
    fetch(PREFIX + apis.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }).then(res => {
      resolve(res.json());
    }, err => {
      reject(err);
    });
  });
};

console.info('%c diary-front', "font-size: 16px");
apiTest().then(data => {
  console.log('apiTest: ', PREFIX + apis.apiTest, data);
}, err => {
  console.log('apiTest failed: ', err);
});

export default {
  apiTest, login
};