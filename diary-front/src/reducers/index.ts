import * as _ from 'lodash';
import { Entry, Todo } from 'utils/api';

class State {
  public user: null | {
    username: string;
  };
  public backendVersion: null | string;
  public frontendVersion: null | string;
  public entriesDateMap: {
    [date: string]: Entry[];
  };
  public todos: Todo[];
}
const INITIAL_STATE: State = {
  user: null,
  backendVersion: null,
  frontendVersion: null,
  entriesDateMap: {},
  todos: [],
};
export default (state: State = INITIAL_STATE,
  action: { type: string; payload: any }) => {
  if (action.type === 'LOGIN') {
    return { ...state, user: action.payload.user };
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
  } else {
    return state;
  }
};
