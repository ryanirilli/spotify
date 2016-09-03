import { fromJS } from 'immutable';

const initialState = fromJS({
  artist: {},
  albums: {}
});

export default function(state = initialState, action = {}) {
  switch (action.type) {
    case 'SET_SPOTIFY_ARTIST_DETAILS':
      return state.set('artist', fromJS(action.artist));
    case 'SET_SPOTIFY_ARTIST_ALBUMS':
      return state.set('albums', fromJS(action.albums));
    default:
      return state;
  }
};