import api from 'utils/api';
import mylog from 'utils/mylog';

const origOnerror = window.onerror;
window.onerror = (message, source, lineno, colno, errObj) => {
  mylog('window.onerror');
  let errJson = '';
  try {
    errJson = JSON.stringify(errObj);
  } catch (e) {
    errJson = e.toString();
  }
  const errReportObj = {
    message: message.toString(),
    source,
    lineno,
    colno,
    errJson,
    time: new Date().toISOString,
  };
  api.errReport({ err: errReportObj });
  window.alert(JSON.stringify(errReportObj));
  if (origOnerror && typeof origOnerror === 'function') {
    origOnerror(message, source, lineno, colno, errObj);
  }
};
