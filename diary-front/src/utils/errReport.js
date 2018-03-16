import api from './api';

const origOnerror = window.onerror;
window.onerror = (message, source, lineno, colno, errObj) => {
  console.info('window.onerror');
  let errJson = '';
  try {
    errJson = JSON.stringify(errObj);
  } catch (e) {
    errJson = e.toString();
  }
  const errReportObj = {
    message,
    source,
    lineno,
    colno,
    errJson,
  };
  api.errReport(errReportObj);
  window.alert(JSON.stringify(errReportObj));
  origOnerror(message, source, lineno, colno, errObj);
};
