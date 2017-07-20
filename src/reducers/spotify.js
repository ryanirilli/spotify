import { Map, fromJS } from 'immutable';
import {getLocalStorageItem} from './../api/httpUtils';

const initialState = fromJS({
  isAuthenticated: Boolean(getLocalStorageItem('accessToken')),
  isUserAuthenticated: Boolean(getLocalStorageItem('userAccessToken')),
  isFetchingRecs: false,
  isLoadingSearchResults: false,
  searchResults: [],
  recs: {},
  artist: {},
  user: {},
  userPlaylists: {},
  addedTracks: []
});

export default function(state = initialState, action = {}) {
  switch (action.type) {
    case 'SET_IS_AUTHENTICATED':
      return state.set('isAuthenticated', action.isAuthenticated);
    case 'SET_USER':
      return state.set('user', fromJS(action.user));
    case 'SET_SPOTIFY_USER_PLAYLISTS':
      return state.set('userPlaylists', fromJS(action.playlists));

    case 'SET_ADDED_TRACK': {
      let addedTracks = state.get('addedTracks');
      let playlist = addedTracks.find(item => item.get('playlistId') === action.playlistId);
      const index = addedTracks.indexOf(playlist);

      if (!playlist) {
        playlist = fromJS({
          playlistId: action.playlistId,
          items: []
        });
      }

      const items = playlist.get('items');
      playlist = playlist.set('items', items.push(action.trackUri));

      if (index > -1) {
        addedTracks = addedTracks.update(index, oldPlaylist => playlist);
      } else {
        addedTracks = addedTracks.push(playlist);
      }

      return state.set('addedTracks', addedTracks);
    }

    case 'REMOVE_ADDED_TRACK': {
      const addedTracks = state.get('addedTracks');
      let playlist = addedTracks.find(item => item.get('playlistId') ===  action.playlistId);
      let items = playlist.get('items');
      const playlistIndex = addedTracks.indexOf(playlist);
      const trackIndex = items.indexOf(action.trackUri);
      items = items.remove(trackIndex);
      playlist = playlist.set('items', items);
      return state.set('addedTracks', addedTracks.update(playlistIndex, oldPlaylist => playlist));
    }

    case 'SET_IS_FETCHING_RECS':
      return state.set('isFetchingRecs', action.isFetchingRecs);
    case 'SET_SPOTIFY_RECS':
      action.recs.tracks = action.recs.tracks.filter(track => track.preview_url !== null);
      return state.set('recs', fromJS(action.recs));
    case 'SET_IS_LOADING_SPOTIFY_SEARCH_RESULTS':
      return state.set('isLoadingSearchResults', action.isLoading);
    case 'SET_SPOTIFY_SEARCH_RESULTS':
      return state.set('searchResults', fromJS(action.spotifySearchResults));
    case 'RESET_SPOTIFY_SEARCH':
      return state.set('searchResults', initialState.get('searchResults'));
    case 'SET_SPOTIFY_ARTIST':
      return state.set('artist', fromJS(action.artist));
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