import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { updateSampleProperty } from 'src/action-creators/app-action-creators.js';

export const App = React.createClass({

  componentDidMount() {
    this.props.updateSampleProperty('Get started');
  },

  render() {
    return <div className="app-container">
      <img ref="unsulliedLogo" alt="unsullied logo" className="unsullied-logo" src="/static/img/unsullied.svg" />
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