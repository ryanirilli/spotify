import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Spotify from './../action-creators/spotify';

export const App = React.createClass({
  componentWillMount() {
    this.props.getSpotifyAccessToken();
  },

  componentWillReceiveProps(nextProps) {
    if(nextProps.isSpotifyAuthenticated && !nextProps.spotifyData.size) {
      this.props.getRecs({
        market: 'ES',
        seed_tracks: '0c6xIDDpzE81m2q797ordA',
        seed_artists: '4NHQUGzhtTLFvgF5SZesLK',
        seed_genres: 'hip+hop',
        limit: '10'
      });
    }
  },
  
  render() {
    return <div className="app-container">
      {this.props.isSpotifyAuthenticated ? this.renderLandingPage() : null}
    </div>
  },

  renderLandingPage() {
    return <div></div>
  }
});

function mapStateToProps(state) {
  return {
    isSpotifyAuthenticated: state.spotify.get('isAuthenticated'),
    spotifyData: state.spotify.get('data')
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getSpotifyAccessToken: Spotify.getAccessToken,
    getRecs: Spotify.getRecs
  }, dispatch);
}

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);