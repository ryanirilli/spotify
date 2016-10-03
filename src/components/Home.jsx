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

    return <div>
      <div className="u-p--">
        <object className="block" type="image/svg+xml" data="/static/img/logo.svg" width="65"></object>
      </div>

      <UnsplashPhoto />

      <div className="bg-gradient-blue u-p- u-pb+">
        <div className="u-max-400px center">
          <h2>Enter your favorite artist</h2>
          <TypeaheadSpotify getSpotifyAccessToken={this.props.getSpotifyAccessToken}
                            isSpotifyAuthenticated={this.props.isSpotifyAuthenticated}
                            spotifySearch={this.props.spotifySearch}
                            resetSpotifySearch={this.props.resetSpotifySearch}
                            spotifySearchResults={this.props.spotifySearchResults}
                            handleArtistSelect={this.handleArtistSelect}/>
        </div>
      </div>
    </div>
  }
});

export const HomeContainer = connect(mapStateToProps, mapDispatchToProps)(Home);