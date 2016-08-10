import { fromJS } from 'immutable';

const initialState = fromJS({
  isAuthenticated: false,
  shouldFetchRecs: false,
  searchResults: [],
  recs: {},
  artist: {}
});

export default function(state = initialState, action = {}) {
  switch (action.type) {
    case 'SET_IS_AUTHENTICATED':
      return state.set('isAuthenticated', action.isAuthenticated);
    case 'SET_SPOTIFY_RECS':
      return state.set('data', fromJS(action.recs));
    case 'SET_SPOTIFY_SEARCH_RESULTS':
      return state.set('searchResults', fromJS(action.spotifySearchResults));
    case 'RESET_SPOTIFY_SEARCH':
      return state.set('searchResults', initialState.get('searchResults'));
    case 'SET_SPOTIFY_ARTIST':
      return state.set('artist', action.artist);
    default:
      return state;
  }
};