import appendQuery from 'append-query';
import * as H from 'history';
import { RouteComponentProps } from 'react-router-dom';

import { User } from 'reducers';
import fetch from 'utils/fetch';

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
  errReport: 'api/errReport',

  login: 'api/login',
  logout: 'api/logout',

  getEntries: 'api/getEntries',
  postEntry: 'api/postEntry',
  deleteEntry: 'api/deleteEntry',
  getCategoryFrequencyMap: 'api/getCategoryFrequencyMap',
  getStreaks: 'api/getStreaks',
  getHistoricalStreaks: 'api/getHistoricalStreaks',

  getTodo: 'api/getTodo',
  getTodos: 'api/getTodos',
  postTodo: 'api/postTodo',
  deleteTodo: 'api/deleteTodo',

  getReminder: 'api/getReminder',
  getReminders: 'api/getReminders',
  postReminder: 'api/postReminder',
  deleteReminder: 'api/deleteReminder',

  getDigest: 'api/getDigest',
  getDigests: 'api/getDigests',
  postDigest: 'api/postDigest',
  deleteDigest: 'api/deleteDigest',

  uploadImage: 'api/uploadImage',
};

export class FrequencyMap {
  [key: string]: number;
}
export class CommonPageProps {
  public match?: any;
  public location?: H.Location;
  public history?: H.History;
  public staticContext?: any;
}

export class ErrResponse {
  public err: any;
}
export class ApiTestResponse {
  public data: {
    user?: User;
    backendVersion: string;
  };
}
const apiTest = () => {
  return fetch(PREFIX + apis.apiTest, {
    credentials: 'same-origin',
  });
};
class ErrReportParams {
  public err: {
    message?: string;
    source?: any;
    lineno?: any;
    colno?: any;
    errJson?: any;
  };
}
const errReport = (params: ErrReportParams) => {
  return fetch(PREFIX + apis.errReport, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
};
class LoginParams {
  public username: string;
  public password: string;
}
export class LoginResponse {
  public data: {
    user: User;
  };
}
const login = (params: LoginParams) => {
  return fetch(PREFIX + apis.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(params),
  });
};
const logout = () => {
  return fetch(PREFIX + apis.logout, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  });
};

export class Entry {
  public _id?: string;
  public date: string;
  public title: string;
  public content: string;
  public points: number;
}
export class EntriesDateMap {
  [date: string]: Entry[];
}
export class EntriesDateStreaksMap {
  [date: string]: FrequencyMap;
}
export class Streak {
  public startDate: string;
  public endDate: string;
  public streaks: number;
}
export class EntriesHistoricalStreaksMap {
  [category: string]: Streak[];
}
class GetHistoricalStreaksParams {
  public owner: string;
}
export class GetHistoricalStreaksResponse {
  public data: EntriesHistoricalStreaksMap;
}
const getHistoricalStreaks = (
  params: GetHistoricalStreaksParams,
  options: AppendQueryOptions = {}
) => {
  const url = appendQuery(PREFIX + apis.getHistoricalStreaks, params, options);
  return fetch(url, {
    credentials: 'same-origin',
  });
};
class GetStreaksParams {
  public owner: string;
  public date: string;
}
export class GetStreaksResponse {
  public data: EntriesDateStreaksMap;
}
const getStreaks = (
  params: GetStreaksParams,
  options: AppendQueryOptions = {}
) => {
  const url = appendQuery(PREFIX + apis.getStreaks, params, options);
  return fetch(url, {
    credentials: 'same-origin',
  });
};
class GetCategoryFrequencyMapParams {
  public owner: string;
}
export class GetCategoryFrequencyMapResponse {
  public data: FrequencyMap;
}
const getCategoryFrequencyMap = (
  params: GetCategoryFrequencyMapParams,
  options: AppendQueryOptions = {}
) => {
  const url = appendQuery(
    PREFIX + apis.getCategoryFrequencyMap,
    params,
    options
  );
  return fetch(url, {
    credentials: 'same-origin',
  });
};
class GetEntriesParams {
  public date: string;
  public owner: string;
}
export class GetEntriesResponse {
  public data: Entry[];
}
const getEntries = (
  params: GetEntriesParams,
  options: AppendQueryOptions = {}
) => {
  const url = appendQuery(PREFIX + apis.getEntries, params, options);
  return fetch(url, {
    credentials: 'same-origin',
  });
};
class PostEntryParams {
  public data: {
    owner: string;
    entry: Entry;
  };
}
export class PostEntryResponse {
  public data: {
    entry?: Entry;
    n?: number;
    nModified?: number;
    ok?: number;
  };
}
const postEntry = (params: PostEntryParams) => {
  return fetch(PREFIX + apis.postEntry, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(params),
  });
};
class DeleteEntryParams {
  public data: {
    owner: string;
    entry: Entry;
  };
}
export class DeleteEntryResponse {
  public data: {
    entry: Entry;
  };
}
const deleteEntry = (params: DeleteEntryParams) => {
  return fetch(PREFIX + apis.deleteEntry, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(params),
  });
};

export class Todo {
  public _id?: string;
  public date: string;
  public dueDate?: string;
  public title: string;
  public content: string;
  public priority: number;
  public check: boolean;
}
class GetTodosParams {
  public owner: string;
}
class GetTodoParams {
  public owner: string;
  public _id: string;
}
export class GetTodosResponse {
  public data: Todo[];
}
const getTodos = (params: GetTodosParams) => {
  const url = appendQuery(PREFIX + apis.getTodos, params);
  return fetch(url, {
    credentials: 'same-origin',
  });
};
const getTodo = (params: GetTodoParams) => {
  const url = appendQuery(PREFIX + apis.getTodo, params);
  return fetch(url, {
    credentials: 'same-origin',
  });
};
class PostTodosParams {
  public data: {
    owner: string;
    todo: Todo;
  };
}
export class PostTodoResponse {
  public data: {
    todo?: Todo;
    n?: number;
    nModified?: number;
    ok?: number;
  };
}
const postTodo = (params: PostTodosParams) => {
  return fetch(PREFIX + apis.postTodo, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(params),
  });
};
class DeleteTodoParams {
  public data: {
    owner: string;
    todo: Todo;
  };
}
export class DeleteTodoResponse {
  public data: {
    todo: Todo;
  };
}
const deleteTodo = (params: DeleteTodoParams) => {
  return fetch(PREFIX + apis.deleteTodo, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(params),
  });
};

export class Reminder {
  public _id?: string;
  public createTimestamp: number;
  public title: string;
  public content: string;
  public cycleType: 'year' | 'month' | 'week';
  public cycleTime: string;
}
class GetRemindersParams {
  public owner: string;
}
class GetReminderParams {
  public owner: string;
  public _id: string;
}
export class GetRemindersResponse {
  public data: Reminder[];
}
const getReminders = (params: GetRemindersParams) => {
  const url = appendQuery(PREFIX + apis.getReminders, params);
  return fetch(url, {
    credentials: 'same-origin',
  });
};
const getReminder = (params: GetReminderParams) => {
  const url = appendQuery(PREFIX + apis.getReminder, params);
  return fetch(url, {
    credentials: 'same-origin',
  });
};
class PostReminderParams {
  public data: {
    owner: string;
    reminder: Reminder;
  };
}
export class PostReminderResponse {
  public data: {
    reminder?: Reminder;
    n?: number;
    nModified?: number;
    ok?: number;
  };
}
const postReminder = (params: PostReminderParams) => {
  return fetch(PREFIX + apis.postReminder, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(params),
  });
};
class DeleteReminderParams {
  public data: {
    owner: string;
    reminder: Reminder;
  };
}
export class DeleteReminderResponse {
  public data: {
    reminder: Reminder;
  };
}
const deleteReminder = (params: DeleteReminderParams) => {
  return fetch(PREFIX + apis.deleteReminder, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(params),
  });
};

export class Digest {
  public _id?: string;
  public createTimestamp: number;
  public lastModified: number;
  public title: string;
  public tags: string[];
  public content: string;
}
class GetDigestsParams {
  public owner: string;
}
class GetDigestParams {
  public owner: string;
  public _id: string;
}
export class GetDigestsResponse {
  public data: Digest[];
}
const getDigest = (params: GetDigestParams) => {
  const url = appendQuery(PREFIX + apis.getDigest, params);
  return fetch(url, {
    credentials: 'same-origin',
  });
};
const getDigests = (params: GetDigestsParams) => {
  const url = appendQuery(PREFIX + apis.getDigests, params);
  return fetch(url, {
    credentials: 'same-origin',
  });
};
class PostDigestParams {
  public data: {
    owner: string;
    digest: Digest;
  };
}
export class PostDigestResponse {
  public data: {
    digest?: Digest;
    n?: number;
    nModified?: number;
    ok?: number;
  };
}
const postDigest = (params: PostDigestParams) => {
  return fetch(PREFIX + apis.postDigest, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(params),
  });
};
class DeleteDigestParams {
  public data: {
    owner: string;
    digest: Digest;
  };
}
export class DeleteDigestResponse {
  public data: {
    digest: Digest;
  };
}
const deleteDigest = (params: DeleteDigestParams) => {
  return fetch(PREFIX + apis.deleteDigest, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(params),
  });
};

const uploadImage = (params: FormData, owner: string) => {
  return fetch(PREFIX + apis.uploadImage + '?owner=' + owner, {
    method: 'POST',
    credentials: 'same-origin',
    body: params,
  });
};

export default {
  apiTest,
  login,
  logout,
  errReport,

  getEntries,
  postEntry,
  deleteEntry,
  getCategoryFrequencyMap,
  getStreaks,
  getHistoricalStreaks,

  getTodo,
  getTodos,
  postTodo,
  deleteTodo,

  getReminder,
  getReminders,
  postReminder,
  deleteReminder,

  getDigest,
  getDigests,
  postDigest,
  deleteDigest,

  uploadImage,
};
