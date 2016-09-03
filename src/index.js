import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import {Provider, connect} from 'react-redux';
import {Router, Route, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerReducer, routerMiddleware} from 'react-router-redux'
import thunk from 'redux-thunk';
import 'whatwg-fetch';
import {AppContainer} from 'src/components/App.jsx!';
import SpotifyLoginSuccess from 'src/components/SpotifyLoginSuccess.jsx!';
import spotify from 'src/reducers/spotify';
import spotifyArtistDetails from 'src/reducers/spotify-artist-details';
import logger from 'src/middlewares/logger';
import { setIsUserAuthenticated, fetchUserAndPlaylists } from 'src/action-creators/spotify';
import { setLocalStorageItem } from 'src/api/httpUtils';
import 'waypoints';

const routingMiddleware = routerMiddleware(browserHistory);
const reducers = {routing: routerReducer, spotify, spotifyArtistDetails};
const store = createStore(combineReducers(reducers), applyMiddleware(logger, thunk, routingMiddleware));
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={AppContainer}></Route>
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