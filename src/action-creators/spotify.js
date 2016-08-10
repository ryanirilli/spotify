import Spotify from './../api/spotify';
import { setLocalStorageItem } from './../api/httpUtils';

export function setIsAuthenticated(isAuthenticated) {
  return {
    type: 'SET_IS_AUTHENTICATED',
    isAuthenticated
  }
}

export function resetSearch() {
  return {
    type: 'RESET_SPOTIFY_SEARCH'
  }
}

export function setSpotifyRecs(recs) {
  return {
    type: 'SET_SPOTIFY_RECS',
    recs
  }
}

export function setSpotifySearchResults(spotifySearchResults) {
  return {
    type: 'SET_SPOTIFY_SEARCH_RESULTS',
    spotifySearchResults
  }
}

export function setArtist(artist) {
  return {
    type: 'SET_SPOTIFY_ARTIST',
    artist
  }
}

export function getAccessToken() {
  return dispatch => {
    Spotify.getAccessToken()
      .then(payload => {
        setLocalStorageItem('accessToken', payload.json.token);
        dispatch(setIsAuthenticated(true));
      });
  }
}

export function search(artist) {
  return dispatch => {
    Spotify.search({q: artist, type: 'artist'})
      .then(payload => {
        dispatch(setSpotifySearchResults(payload.json.artists.items));
      });
  }
}

export function getRecs(params) {
  return dispatch => {
    Spotify.getRecs(params)
      .then(payload => dispatch(setSpotifyRecs(payload.json)));
  }
}

export default { getAccessToken, getRecs, search, resetSearch, setArtist }