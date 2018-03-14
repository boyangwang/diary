const INITIAL_STATE = {
  user: null,
  entriesDateMap: {},
};
export default (state = INITIAL_STATE, action) => {
  if (action.type === 'LOGIN') {
    return { ...state, user: action.payload.user };
  } else if (action.type === 'ENTRIES_FOR_DATE') {
    return {
      ...state,
      entriesDateMap: { ...state.entriesDateMap, ...action.payload },
    };
  } else if (action.type === 'TODOS') {
    return {
      ...state,
      ...action.payload,
    };
  } else {
    return state;
  }
};
