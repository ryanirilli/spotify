import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

export const App = React.createClass({
  render: function() {
    return <div>
      <h1 ref="siteTitle">Appocalypse</h1>
    </div>    
  }
});

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);