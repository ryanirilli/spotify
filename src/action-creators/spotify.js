import Spotify from './../api/spotify';
import { setLocalStorageItem } from './../api/httpUtils';

export function isAuthenticated(isAuthenticated) {
  return {
    type: 'IS_AUTHENTICATED',
    isAuthenticated
  }
}

export function setSpotifyData(spotifyData) {
  return {
    type: 'SET_SPOTIFY_DATA',
    spotifyData
  }
}

export function getAccessToken() {
  return dispatch => {
    Spotify.getAccessToken()
      .then(payload => {
        setLocalStorageItem('accessToken', payload.json.token);
        dispatch(isAuthenticated(true));
      });
  }
}

export function getRecs(params) {
  return dispatch => {
    Spotify.getRecs(params)
      .then(payload => dispatch(setSpotifyData(payload.json)));
  }
}

export default { getAccessToken, getRecs }