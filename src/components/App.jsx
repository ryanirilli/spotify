import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Spotify from './../action-creators/spotify';

import RangeSlider from './RangeSlider.jsx!';
import Typeahead from './Typeahead.jsx!';

function mapStateToProps(state) {
  return {
    isSpotifyAuthenticated: state.spotify.get('isAuthenticated'),
    spotifyRecs: state.spotify.get('recs'),
    spotifySearchResults: state.spotify.get('searchResults')
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getSpotifyAccessToken: Spotify.getAccessToken,
    getSpotfyRecs: Spotify.getRecs,
    spotifySearch: Spotify.search
  }, dispatch);
}

const sliders = [
  'acousticness',
  'danceability',
  'energy',
  'instrumentalness',
  'liveness',
  'loudness',
  'popularity',
  'speechiness',
  'valence'
];

export const App = React.createClass({
  componentWillMount() {
    this.props.getSpotifyAccessToken();
  },

  getInitialState() {
    const sliderValues = {};
    sliders.forEach(slider => sliderValues[`target_${slider}`] = 0);
    return {
      targets: Object.assign({}, sliderValues)
    };

  },

  render() {
    return <div className="app-container">
      {this.props.isSpotifyAuthenticated ? this.renderInitialView() : null}
    </div>
  },

  renderInitialView() {
    return <div className="section-main">
      <div className="layout">
        <div className="section__sidebar layout__item u-1/3">
          {this.renderSearch()}
          {this.renderSliders()}
        </div>
        <div className="section__body layout__item u-2/3">
          <h1>body</h1>
        </div>
      </div>
    </div>
  },
  
  renderSearch() {
    return <div className="search">
      <Typeahead fetchData={this.searchSpotifyArtist} results={this.props.spotifySearchResults} />
    </div>
  },

  renderSliders() {
    return <div className="sliders">
      {sliders.map((slider, index) => this.renderSlider(`target_${slider}`, index))}
      <button className="btn u-1/1" onClick={this.fetchRecs}>
        Make Dat Playlist
      </button>
    </div>
  },

  renderSlider(key, index) {
    return <div key={key}>
      <label>{sliders[index]}</label>
      <RangeSlider min={0} max={100} step={1} value={this.state.targets[key]} onChange={val => this.setSliderVal(key, val) } />
    </div>
  },

  setSliderVal(key, val) {
    const targets = Object.assign({}, this.state.targets);
    targets[key] = val;
    this.setState({ targets });
  },

  fetchRecs() {
    const params = {
      seed_genres: 'hip+hop',
      seed_artists: '4NHQUGzhtTLFvgF5SZesLK'
    };
    sliders.forEach(slider => {
      const key = `target_${slider}`;
      const val = this.state.targets[key];
      if(val) {
        params[key] = val/100;
      }
    });
    this.props.getSpotfyRecs(params);
  },

  searchSpotifyArtist(val) {
    this.props.spotifySearch(val);
  }
});

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);