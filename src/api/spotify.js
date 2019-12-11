import queryString from "query-string";
import { request } from "./../api/httpUtils";

const baseUrl = "https://api.spotify.com/v1";

export function getAccessToken() {
  return request("/api/v1/spotify-access-token");
}

export function login() {
  return request("/api/v1/spotify-login");
}

export async function getRecs(params) {
  const _params = Object.assign({}, { limit: 100 }, params);
  const payload = await request(
    `${baseUrl}/recommendations?${queryString.stringify(_params)}`
  );

  const features = await request(
    `${baseUrl}/audio-features?ids=${payload.json.tracks
      .map(({ id }) => id)
      .join(",")}`
  );
  payload.json.tracks.forEach(track => {
    track.features = features.json.audio_features.find(
      ({ id }) => track.id === id
    );
  });
  return payload;
}

export function search(opts) {
  const params = Object.assign({}, {}, opts);
  return request(`${baseUrl}/search?${queryString.stringify(params)}`);
}

export function fetchUserPlaylists() {
  return request(`${baseUrl}/me/playlists`);
}

export function fetchUser() {
  return request(`${baseUrl}/me`);
}

export function addTrackToPlaylist(uri, userId, playlistId) {
  return request(
    `${baseUrl}/users/${userId}/playlists/${playlistId}/tracks?uris=${uri}`,
    { method: "post" }
  );
}

export function removeTrackFromPlaylist(uri, userId, playlistId) {
  const params = {
    method: "delete",
    body: JSON.stringify({
      tracks: [{ uri }]
    })
  };
  return request(
    `${baseUrl}/users/${userId}/playlists/${playlistId}/tracks`,
    params
  );
}

export function fetchArtist(artistId) {
  return request(`${baseUrl}/artists/${artistId}`);
}

export function fetchArtistAlbums(artistId) {
  return request(`${baseUrl}/artists/${artistId}/albums`);
}

export function fetchAlbumDetails(albumId) {
  return request(`${baseUrl}/albums/${albumId}`);
}

export default {
  getAccessToken,
  login,
  getRecs,
  search,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  fetchUser,
  fetchUserPlaylists,
  fetchArtist,
  fetchArtistAlbums,
  fetchAlbumDetails
};
