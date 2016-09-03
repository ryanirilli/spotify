import queryString from 'query-string';
import { request } from './../api/httpUtils';

const baseUrl = 'https://api.spotify.com/v1';

export function getAccessToken() {
  return request('/api/v1/spotify-access-token');
}

export function login() {
  return request('/api/v1/spotify-login');
}

export function getRecs(params) {
  const _params = Object.assign({}, {limit: 100}, params);
  return request(`${baseUrl}/recommendations?${queryString.stringify(_params)}`);
}

export function search(opts) {
  const params = Object.assign({}, {}, opts);
  return request(`${baseUrl}/search?${queryString.stringify(params)}`);
}

export function fetchUserPlaylists() {
  return request(`https://api.spotify.com/v1/me/playlists`);
}

export function fetchUser() {
  return request('https://api.spotify.com/v1/me')
}

export function addTrackToPlaylist(uri, userId, playlistId) {
  return request(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks?uris=${uri}`, {method: 'post'});
}

export function fetchArtist(artistId) {
  return request(`https://api.spotify.com/v1/artists/${artistId}`);
}

export function fetchArtistAlbums(artistId) {
  return request(`https://api.spotify.com/v1/artists/${artistId}/albums`);
}

export function fetchAlbumDetails(albumId) {
  return request(`https://api.spotify.com/v1/albums/${albumId}`);
}

export default {
  getAccessToken,
  login,
  getRecs,
  search,
  addTrackToPlaylist,
  fetchUser,
  fetchUserPlaylists,
  fetchArtist,
  fetchArtistAlbums,
  fetchAlbumDetails
}