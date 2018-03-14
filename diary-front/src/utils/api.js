import appendQuery from 'append-query';

const PROTOCOL = process.env.REACT_APP_PROTOCOL;
const DOMAIN = process.env.REACT_APP_DOMAIN;
const PORT = process.env.REACT_APP_PORT;

const PREFIX =
  (PROTOCOL ? PROTOCOL + '://' : '') +
  (DOMAIN ? DOMAIN : '') +
  (PORT ? ':' + PORT : '') +
  '/';

const apis = {
  apiTest: 'api/apiTest',
  login: 'api/login',
  
  getEntries: 'api/getEntries',
  postEntry: 'api/postEntry',
  
  getTodos: 'api/getTodos',
  postTodo: 'api/postTodo',

  errReport: 'api/errReport',
};

const apiTest = () => {
  return new Promise((resolve, reject) => {
    fetch(PREFIX + apis.apiTest).then(
      (res) => {
        resolve(res.json());
      },
      (err) => {
        reject(err);
      }
    );
  });
};

const login = (params) => {
  return new Promise((resolve, reject) => {
    fetch(PREFIX + apis.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(params),
    }).then(
      (res) => {
        resolve(res.json());
      },
      (err) => {
        reject(err);
      }
    );
  });
};

const getEntries = (params) => {
  const url = appendQuery(PREFIX + apis.getEntries, params);
  return new Promise((resolve, reject) => {
    fetch(url, {
      credentials: 'same-origin',
    }).then(
      (res) => {
        resolve(res.json());
      },
      (err) => {
        reject(err);
      }
    );
  });
};

const postEntry = (params) => {
  return new Promise((resolve, reject) => {
    fetch(PREFIX + apis.postEntry, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(params),
    }).then(
      (res) => {
        resolve(res.json());
      },
      (err) => {
        reject(err);
      }
    );
  });
};

const getTodos = (params) => {
  const url = appendQuery(PREFIX + apis.getTodos, params);
  return new Promise((resolve, reject) => {
    fetch(url, {
      credentials: 'same-origin',
    }).then(
      (res) => {
        resolve(res.json());
      },
      (err) => {
        reject(err);
      }
    );
  });
};

const postTodo = (params) => {
  return new Promise((resolve, reject) => {
    fetch(PREFIX + apis.postTodo, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(params),
    }).then(
      (res) => {
        resolve(res.json());
      },
      (err) => {
        reject(err);
      }
    );
  });
};

const errReport = (params) => {
  return new Promise((resolve, reject) => {
    fetch(PREFIX + apis.errReport, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }).then(
      (res) => {
        resolve(res.json());
      },
      (err) => {
        reject(err);
      }
    );
  });
};

console.info('%c diary-front', 'font-size: 16px');
apiTest().then(
  (data) => {
    console.log('apiTest: ', PREFIX + apis.apiTest, data);
  },
  (err) => {
    console.log('apiTest failed: ', err);
  }
);

export default {
  apiTest,
  login,
  getEntries,
  postEntry,
  errReport,
  getTodos,
  postTodo,
};
