console.info('%c diary-front', "font-size: 16px");

fetch('/api/apiTest').then(data => {
  console.log('apiTest: ', data.text());
}, err => {
  console.log('apiTest failed: ', err);
});

export default {

};