import queryString from 'query-string';
import { request } from './../api/httpUtils';

const baseUrl = 'https://api.spotify.com/v1';

export function getAccessToken() {
  return request('/api/v1/spotify-access-token');
}

export function getRecs(params) {
  const _params = Object.assign({}, {limit: 100}, params);
  return request(`${baseUrl}/recommendations?${queryString.stringify(_params)}`);
}

export function search(opts) {
  const params = Object.assign({}, {}, opts);
  return request(`${baseUrl}/search?${queryString.stringify(params)}`);
}

export default { getAccessToken, getRecs, search }