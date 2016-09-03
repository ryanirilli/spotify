import { fromJS } from 'immutable';

const initialState = fromJS({
  isAuthenticated: false,
  isUserAuthenticated: false,
  isFetchingRecs: false,
  searchResults: [],
  recs: {},
  artist: {},
  user: {},
  userPlaylists: {}
});

export default function(state = initialState, action = {}) {
  switch (action.type) {
    case 'SET_IS_AUTHENTICATED':
      return state.set('isAuthenticated', action.isAuthenticated);
    case 'SET_USER':
      return state.set('user', fromJS(action.user));
    case 'SET_SPOTIFY_USER_PLAYLISTS':
      return state.set('userPlaylists', fromJS(action.playlists));
    case 'SET_IS_FETCHING_RECS':
      return state.set('isFetchingRecs', action.isFetchingRecs);
    case 'SET_SPOTIFY_RECS':
      return state.set('recs', fromJS(action.recs));
    case 'SET_SPOTIFY_SEARCH_RESULTS':
      return state.set('searchResults', fromJS(action.spotifySearchResults));
    case 'RESET_SPOTIFY_SEARCH':
      return state.set('searchResults', initialState.get('searchResults'));
    case 'SET_SPOTIFY_ARTIST':
      return state.set('artist', action.artist);
    case 'RESET_SPOTIFY':
      return initialState.merge({
        isAuthenticated: state.get('isAuthenticated'),
        isUserAuthenticated: state.get('isUserAuthenticated'),
        userPlaylists: state.get('userPlaylists'),
        user: state.get('user')
      });
    case 'SET_IS_SPOTIFY_USER_AUTHENTICATED':
      return state.set('isUserAuthenticated', action.isUserAuthenticated);
    default:
      return state;
  }
};