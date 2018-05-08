import * as _ from 'lodash';

import { Digest, EntriesDateMap, Entry, Todo } from 'utils/api';
import util from 'utils/util';

export class User {
  public username: string;
}
export class ReduxState {
  public user: null | User;
  public backendVersion: null | string;
  public entriesDateMap: EntriesDateMap;
  public todos: Todo[];
  public digests: Digest[];
  public resyncCounter: number;
}
const INITIAL_STATE: ReduxState = {
  user: null,
  backendVersion: null,
  entriesDateMap: {},
  todos: [],
  digests: [],
  resyncCounter: 0,
};
export class Action {
  public type: string;
  public payload: any;
}
export default (state: ReduxState = INITIAL_STATE, action: Action) => {
  if (action.type === 'LOGIN') {
    return { ...state, user: action.payload.user };
  } else if (action.type === 'LOGOUT') {
    return {
      ...INITIAL_STATE,
      backendVersion: state.backendVersion,
    };
  } else if (action.type === 'SYNC') {
    return {
      ...state,
      resyncCounter: state.resyncCounter + 1,
    };
  } else if (action.type === 'VERSION') {
    return {
      ...state,
      backendVersion: action.payload.backendVersion || state.backendVersion,
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
    // here need to account for case of changing date
    // when update_entry, _id doesn't change and always exist
    // global match by id, and move across date if necessary

    // now we dissemble entire map and re-assemble. Downside is that all related views re-render
    // Since update_entry is lower freq op, this is ok
    // post_entry still only touch the specific day, so it's ok
    const allEntriesArr = util.fromEntriesDateMapToEntryList(state.entriesDateMap);
    let newEntriesArr;
    const findIndex = allEntriesArr.findIndex(
      (entry) => entry._id === action.payload.entry._id
    );
    if (findIndex === -1) {
      newEntriesArr = [...allEntriesArr, action.payload.entry];
    } else {
      newEntriesArr = [
        ...allEntriesArr.slice(0, findIndex),
        action.payload.entry,
        ...allEntriesArr.slice(findIndex + 1),
      ];
    }
    const entriesDateMap = util.fromEntryListToEntriesDateMap(newEntriesArr);
    return {
      ...state,
      entriesDateMap,
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
    if (findIndex === -1) {
      newTodosArr = [...newTodosArr, action.payload.todo];
    } else {
      newTodosArr = [
        ...newTodosArr.slice(0, findIndex),
        action.payload.todo,
        ...newTodosArr.slice(findIndex + 1),
      ];
    }
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
    // this was added first for digest, so that when my digest and my _id doesn't exist in digests,
    // it will simply append. When will this happen? In single digest view. Digests arr is empty, and only the
    // requested digest is returned.
    // It's extended to be applied on todo and entry
    if (findIndex === -1) {
      newDigestsArr = [...newDigestsArr, action.payload.digest];
    } else {
      newDigestsArr = [
        ...newDigestsArr.slice(0, findIndex),
        action.payload.digest,
        ...newDigestsArr.slice(findIndex + 1),
      ];
    }
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
