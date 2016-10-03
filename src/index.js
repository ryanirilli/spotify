import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import {Provider, connect} from 'react-redux';
import {Router, Route, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerReducer, routerMiddleware} from 'react-router-redux'
import thunk from 'redux-thunk';
import 'whatwg-fetch';
import {debounce} from 'src/utils/utils';

import {AppContainer} from 'src/components/App.jsx!';
import {HomeContainer} from 'src/components/Home.jsx!';
import SpotifyLoginSuccess from 'src/components/SpotifyLoginSuccess.jsx!';

import app from 'src/reducers/app';
import spotify from 'src/reducers/spotify';
import spotifyArtistDetails from 'src/reducers/spotify-artist-details';
import spotifyAlbumDetails from 'src/reducers/spotify-album-details';

import logger from 'src/middlewares/logger';
import { setIsUserAuthenticated, fetchUserAndPlaylists } from 'src/action-creators/spotify';
import { setLocalStorageItem } from 'src/api/httpUtils';
import 'waypoints';

const routingMiddleware = routerMiddleware(browserHistory);
const reducers = {routing: routerReducer, app, spotify, spotifyArtistDetails, spotifyAlbumDetails};
const store = createStore(combineReducers(reducers), applyMiddleware(logger, thunk, routingMiddleware));
const history = syncHistoryWithStore(browserHistory, store);

const breakpoints = {
  palm: "screen and (max-width: 44.9375em)",
  lap: "screen and (min-width: 45em) and (max-width: 63.9375em)",
  desk: "screen and (min-width: 64em)"
};

function setDevice() {
  for (let device in breakpoints) {
    const breakpoint = breakpoints[device];
    if(window.matchMedia(breakpoint).matches) {
      store.dispatch({type: 'SET_DEVICE', device});
      break;
    }
  }
}

setDevice();
const debouncedSetDevice = debounce(setDevice, 200);
window.addEventListener('resize', debouncedSetDevice);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={HomeContainer}></Route>
      <Route path="/app" component={AppContainer}></Route>
      <Route path="/spotify-login-success" component={SpotifyLoginSuccess}></Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);

window.onSpotifyLoginSuccess = function(accessToken, refreshToken){
  setLocalStorageItem('userAccessToken', accessToken);
  setLocalStorageItem('userRefresh', refreshToken);
  store.dispatch(setIsUserAuthenticated(true));
  store.dispatch(fetchUserAndPlaylists());
};