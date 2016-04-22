import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers, bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import thunk from 'redux-thunk';

import { AppContainer } from '/src/components/App.jsx!';
import appReducer from '/src/reducers/app-reducer.js';

const store = createStore(
  combineReducers({
    routing: routerReducer,
    app: appReducer
  }), applyMiddleware(thunk)
);

const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={AppContainer}></Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);