import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {List, Map} from 'immutable';
import {push} from 'react-router-redux';

import Spotify from './../action-creators/spotify';
import TypeaheadSpotify from './TypeaheadSpotify.jsx!';
import UnsplashPhoto from './UnsplashPhoto.jsx!';

function mapStateToProps(state) {
  return {
    device: state.app.get('device'),
    isSpotifyAuthenticated: state.spotify.get('isAuthenticated'),
    spotifySearchResults: state.spotify.get('searchResults')
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getSpotifyAccessToken: Spotify.getAccessToken,
    spotifySearch: Spotify.search,
    resetSpotifySearch: Spotify.resetSearch,
    setSpotifyArtist: Spotify.setArtist,
    push
  }, dispatch);
}

export const Home = React.createClass({

  handleArtistSelect(artist) {
    this.props.setSpotifyArtist(artist);
    this.props.push(`/app?artistId=${artist.get('id')}`);
  },

  render() {
    return <div className="home">
      <div className="bg-orange bg-hero-home u-ph- full-page">
        <div className="u-pv">
          <object className="block" type="image/svg+xml" data="/static/img/logo_spotworm_white.svg" width="165"></object>
        </div>
        <div className="u-max-400px center u-pv+">
          <h2 className="u-mv0">Enter your favorite music artist</h2>
          <TypeaheadSpotify device={this.props.device}
                            getSpotifyAccessToken={this.props.getSpotifyAccessToken}
                            isSpotifyAuthenticated={this.props.isSpotifyAuthenticated}
                            spotifySearch={this.props.spotifySearch}
                            resetSpotifySearch={this.props.resetSpotifySearch}
                            spotifySearchResults={this.props.spotifySearchResults}
                            handleArtistSelect={this.handleArtistSelect}
                            artist={this.props.spotifySelectedArtist}
                            theme="fancy"/>
        </div>
      </div>
    </div>
  }
});

export const HomeContainer = connect(mapStateToProps, mapDispatchToProps)(Home);