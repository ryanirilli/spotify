import { fromJS } from 'immutable';

const initialState = fromJS({
  isAuthenticated: false,
  shouldFetchRecs: false,
  searchResults: [],
  recs: {}
});

export default function(state = initialState, action = {}) {
  switch (action.type) {
    case 'SET_IS_AUTHENTICATED':
      return state.set('isAuthenticated', action.isAuthenticated);
    case 'SET_SPOTIFY_RECS':
      return state.set('data', fromJS(action.recs));
    case 'SET_SPOTIFY_SEARCH_RESULTS':
      return state.set('searchResults', fromJS(action.spotifySearchResults));
    default:
      return state;
  }
};