import { fromJS } from 'immutable';

const initialState = fromJS({
  isShowingArtistDetails: false,
  artist: {},
  albums: {}
});

export default function(state = initialState, action = {}) {
  switch (action.type) {
    case 'SET_SPOTIFY_ARTIST_DETAILS':
      return state.set('artist', fromJS(action.artist));
    case 'SET_SPOTIFY_ARTIST_ALBUMS':
      const seen = [];
      action.albums.items = action.albums.items.filter(item => {
        const album = item.name.toLowerCase();
        const hasBeenSeen = seen.indexOf(album) > -1;
        if (!hasBeenSeen) {
          seen.push(album);
          return true;
        }
      });
      return state.set('albums', fromJS(action.albums));
    case 'SET_IS_SHOWING_ARTIST_DETAILS':
      return state.set('isShowingArtistDetails', action.isShowingArtistDetails);
    case 'RESET_SPOTIFY_ARTIST_DETAILS':
      return initialState;
    default:
      return state;
  }
};