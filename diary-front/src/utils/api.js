const PROTOCOL = process.env.REACT_APP_PROTOCOL;
const DOMAIN = process.env.REACT_APP_DOMAIN;
const PORT = process.env.REACT_APP_PORT;

const PREFIX = (PROTOCOL ? PROTOCOL + '://' : '')
  + (DOMAIN ? DOMAIN : '') + (PORT ? ':' + PORT : '') + '/api';

const apis = {
  apiTest: '/apiTest'
};

console.info('%c diary-front', "font-size: 16px");

fetch(PREFIX + '/apiTest').then(res => {
  res.text().then(data => {
    console.log('apiTest: ', PREFIX + apis.apiTest, data);
  });
}, err => {
  console.log('apiTest failed: ', err);
});

export default {

};