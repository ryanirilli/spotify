import { fromJS } from 'immutable';

const initialState = fromJS({
  isAuthenticated: false,
  data: {}
});

export default function(state = initialState, action = {}) {
  switch (action.type) {
    case 'IS_AUTHENTICATED':
      return state.set('isAuthenticated', action.isAuthenticated);
    case 'SET_SPOTIFY_DATA':
      return state.set('data', fromJS(action.spotifyData));
    default:
      return state;
  }
};