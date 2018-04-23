import * as _ from 'lodash';

import { Digest, Entry, Todo } from 'utils/api';

export class User {
  public username: string;
}
export class ReduxState {
  public user: null | User;
  public backendVersion: null | string;
  public frontendVersion: null | string;
  public entriesDateMap: {
    [date: string]: Entry[];
  };
  public todos: Todo[];
  public digests: Digest[];
}
const INITIAL_STATE: ReduxState = {
  user: null,
  backendVersion: null,
  frontendVersion: null,
  entriesDateMap: {},
  todos: [],
  digests: [],
};
export class Action {
  public type: string;
  public payload: any;
}
export default (state: ReduxState = INITIAL_STATE, action: Action) => {
  if (action.type === 'LOGIN') {
    return { ...state, user: action.payload.user };
  } else if (action.type === 'LOGOUT') {
    return { ...INITIAL_STATE };
  } else if (action.type === 'VERSION') {
    return {
      ...state,
      backendVersion: action.payload.backendVersion || state.backendVersion,
      frontendVersion: action.payload.frontendVersion || state.frontendVersion,
    };
  } else if (action.type === 'ENTRIES_FOR_DATE') {
    return {
      ...state,
      entriesDateMap: { ...state.entriesDateMap, ...action.payload },
    };
  } else if (action.type === 'POST_ENTRY') {
    const date = action.payload.entry.date;
    const newEntriesArr = _.isArray(state.entriesDateMap[date])
      ? state.entriesDateMap[date].slice()
      : [];
    newEntriesArr.push(action.payload.entry);
    return {
      ...state,
      entriesDateMap: {
        ...state.entriesDateMap,
        [date]: newEntriesArr,
      },
    };
  } else if (action.type === 'UPDATE_ENTRY') {
    const date = action.payload.entry.date;
    let newEntriesArr = _.isArray(state.entriesDateMap[date])
      ? state.entriesDateMap[date].slice()
      : [];
    const findIndex = newEntriesArr.findIndex(
      (entry) => entry._id === action.payload.entry._id
    );
    newEntriesArr = [
      ...newEntriesArr.slice(0, findIndex),
      action.payload.entry,
      ...newEntriesArr.slice(findIndex + 1),
    ];
    return {
      ...state,
      entriesDateMap: {
        ...state.entriesDateMap,
        [date]: newEntriesArr,
      },
    };
  } else if (action.type === 'DELETE_ENTRY') {
    const date = action.payload.entry.date;
    let newEntriesArr = _.isArray(state.entriesDateMap[date])
      ? state.entriesDateMap[date].slice()
      : [];
    const findIndex = newEntriesArr.findIndex(
      (entry) => entry._id === action.payload.entry._id
    );
    newEntriesArr = [
      ...newEntriesArr.slice(0, findIndex),
      ...newEntriesArr.slice(findIndex + 1),
    ];
    return {
      ...state,
      entriesDateMap: {
        ...state.entriesDateMap,
        [date]: newEntriesArr,
      },
    };
  } else if (action.type === 'TODOS') {
    return {
      ...state,
      ...action.payload,
    };
  } else if (action.type === 'POST_TODO') {
    return {
      ...state,
      todos: [...state.todos, action.payload.todo],
    };
  } else if (action.type === 'UPDATE_TODO') {
    let newTodosArr = _.isArray(state.todos) ? state.todos.slice() : [];
    const findIndex = newTodosArr.findIndex(
      (todo) => todo._id === action.payload.todo._id
    );
    newTodosArr = [
      ...newTodosArr.slice(0, findIndex),
      action.payload.todo,
      ...newTodosArr.slice(findIndex + 1),
    ];
    return {
      ...state,
      todos: newTodosArr,
    };
  } else if (action.type === 'DELETE_TODO') {
    let newTodosArr = _.isArray(state.todos) ? state.todos.slice() : [];
    const findIndex = newTodosArr.findIndex(
      (todo) => todo._id === action.payload.todo._id
    );
    newTodosArr = [
      ...newTodosArr.slice(0, findIndex),
      ...newTodosArr.slice(findIndex + 1),
    ];
    return {
      ...state,
      todos: newTodosArr,
    };
  } else if (action.type === 'DIGESTS') {
    return {
      ...state,
      ...action.payload,
    };
  } else if (action.type === 'POST_DIGEST') {
    return {
      ...state,
      digests: [...state.digests, action.payload.digest],
    };
  } else if (action.type === 'UPDATE_DIGEST') {
    let newDigestsArr = _.isArray(state.digests) ? state.digests.slice() : [];
    const findIndex = newDigestsArr.findIndex(
      (digest) => digest._id === action.payload.digest._id
    );
    newDigestsArr = [
      ...newDigestsArr.slice(0, findIndex),
      action.payload.digest,
      ...newDigestsArr.slice(findIndex + 1),
    ];
    return {
      ...state,
      digests: newDigestsArr,
    };
  } else if (action.type === 'DELETE_DIGEST') {
    let newDigestsArr = _.isArray(state.digests) ? state.digests.slice() : [];
    const findIndex = newDigestsArr.findIndex(
      (digest) => digest._id === action.payload.digest._id
    );
    newDigestsArr = [
      ...newDigestsArr.slice(0, findIndex),
      ...newDigestsArr.slice(findIndex + 1),
    ];
    return {
      ...state,
      digests: newDigestsArr,
    };
  } else {
    return state;
  }
};
