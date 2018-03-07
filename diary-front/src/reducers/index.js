const INITIAL_STATE = {
  username: null,
  entriesDateMap: {},
};
export default (state = INITIAL_STATE, action) => {
  if (action.type === 'LOGIN') {
    return { ...state, username: action.payload.username };
  } else if (action.type === 'ENTRIES_FOR_DATE') {
    return {
      ...state,
      entriesDateMap: { ...state.entriesDateMap, ...action.payload },
    };
  } else {
    return state;
  }
};
