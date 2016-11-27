import Spotify from './../api/spotify';
import { setLocalStorageItem } from './../api/httpUtils';

export function setIsAuthenticated(isAuthenticated) {
  return {
    type: 'SET_IS_AUTHENTICATED',
    isAuthenticated
  }
}

export function setIsUserAuthenticated(isUserAuthenticated) {
  return {
    type: 'SET_IS_SPOTIFY_USER_AUTHENTICATED',
    isUserAuthenticated
  }
}

export function setUserPlaylists(playlists) {
  return {
    type: 'SET_SPOTIFY_USER_PLAYLISTS',
    playlists
  }
}

export function setIsFetchingRecs(isFetchingRecs) {
  return {
    type: 'SET_IS_FETCHING_RECS',
    isFetchingRecs
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

export function setUser(user) {
  return {
    type: 'SET_USER',
    user
  }
}

export function setArtist(artist) {
  return {
    type: 'SET_SPOTIFY_ARTIST',
    artist
  }
}

export function reset() {
  return {
    type: 'RESET_SPOTIFY'
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

export function setIsLoadingSpotifySearchResults(isLoading) {
  return {
    type: 'SET_IS_LOADING_SPOTIFY_SEARCH_RESULTS',
    isLoading
  }
}

export function search(artist) {
  return dispatch => {
    dispatch(setIsLoadingSpotifySearchResults(true));
    Spotify.search({q: artist, type: 'artist'})
      .then(payload => {
        dispatch(setSpotifySearchResults(payload.json.artists.items));
        dispatch(setIsLoadingSpotifySearchResults(false));
      });
  }
}

export function fetchRecs(params) {
  return dispatch => {
    dispatch(setIsFetchingRecs(true));
    Spotify.getRecs(params)
      .then(payload => {
        dispatch(setSpotifyRecs(payload.json));
        dispatch(setIsFetchingRecs(false));
      });
  }
}

export function fetchUser() {
  return dispatch => {
    Spotify.fetchUser()
      .then(payload => dispatch(setUser(payload.json)));
  }
}

export function fetchUserAndPlaylists() {
  return dispatch => {
    Spotify.fetchUser()
      .then(payload => {
        dispatch(setUser(payload.json));
        dispatch(fetchUserPlaylists());
      });
  }
}

export function fetchUserPlaylists() {
  return dispatch => {
    Spotify.fetchUserPlaylists()
      .then(payload => dispatch(setUserPlaylists(payload.json)));
  }
}

export function setAddedTrack(playlistId, trackUri) {
  return {
    type: 'SET_ADDED_TRACK',
    playlistId,
    trackUri
  }
}

export function addTrackToPlaylist(uri, playlistId) {
  return (dispatch, getState) => {
    const userId = getState().spotify.getIn(['user','id']);
    Spotify.addTrackToPlaylist(uri, userId, playlistId)
      .then(() => {
        dispatch(setAddedTrack(playlistId, uri));
      });
  }
}

export function fetchArtist(artistId) {
  return dispatch => {
    Spotify.fetchArtist(artistId)
      .then(payload => dispatch(setArtist(payload.json)));
  }
}

export default {
  getAccessToken,
  fetchRecs,
  search,
  resetSearch,
  fetchArtist,
  setArtist,
  reset,
  setIsFetchingRecs,
  setIsUserAuthenticated,
  fetchUserPlaylists,
  fetchUser,
  fetchUserAndPlaylists,
  addTrackToPlaylist,
  setIsAuthenticated
}