import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { updateSampleProperty } from 'src/action-creators/app-action-creators.js';

export const App = React.createClass({

  componentDidMount() {
    this.props.updateSampleProperty('see, it\'s that easy');
  },

  render() {
    return <div>
      <h1 ref="siteTitle">Appocalypse</h1>
      <p>{this.props.sampleProperty}</p>
    </div>
  }
});

function mapStateToProps(state) {
  return {
    sampleProperty: state.app.get('sampleProperty')
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    updateSampleProperty
  }, dispatch);
}

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);