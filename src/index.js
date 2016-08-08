import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers, bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux'
import thunk from 'redux-thunk';
import 'whatwg-fetch';
import { AppContainer } from 'src/components/App.jsx!';
import spotify from 'src/reducers/spotify';
import logger from 'src//middlewares/logger';

const routingMiddleware = routerMiddleware(browserHistory);

const reducers = { routing: routerReducer, spotify };
const store = createStore(combineReducers(reducers), applyMiddleware(logger, thunk, routingMiddleware));
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={AppContainer}></Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);