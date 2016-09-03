import Spotify from './../api/spotify';

export function setArtistDetails(artist) {
  return {
    type: 'SET_SPOTIFY_ARTIST_DETAILS',
    artist
  }
}

export function setArtistAlbums(albums) {
  return {
    type: 'SET_SPOTIFY_ARTIST_ALBUMS',
    albums
  }
}

export function addAlbum(album) {
  return {
    type: 'ADD_SPOTIFY_ALBUM',
    album
  }
}

export function fetchArtistDetails(artistId) {
  return dispatch => {
    Spotify.fetchArtist(artistId)
      .then(payload => dispatch(setArtistDetails(payload.json)));
  }
}

export function fetchArtistAlbums(artistId) {
  return dispatch => {
    Spotify.fetchArtistAlbums(artistId)
      .then(payload => dispatch(setArtistAlbums(payload.json)));
  }
}

export function fetchAlbumDetails(albumId) {
  return dispatch => {
    Spotify.fetchAlbumDetails(albumId)
      .then(payload => dispatch(addAlbum(payload.json)));
  }
}

export default {
  fetchArtistDetails,
  fetchArtistAlbums,
  fetchAlbumDetails
}