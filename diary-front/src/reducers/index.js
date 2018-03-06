const INITIAL_STATE = {};
export default (state = INITIAL_STATE, action) => {
  if (action.type === 'LOGIN') {
    return {...state, username: action.payload.username};
  } else {
    return state;
  }
};