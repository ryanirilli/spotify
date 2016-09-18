import {fromJS} from 'immutable';
const initialState = fromJS({
  album: {}
});
export default function(state = initialState, action) {
  switch (action.type) {
  case 'SET_SPOTIFY_ALBUM':
    return state.set('album', fromJS(action.album));
  default:
    return state;
  }
}