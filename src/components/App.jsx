import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Spotify from './../action-creators/spotify';

import RangeSlider from './RangeSlider.jsx!';
import Typeahead from './Typeahead.jsx!';

import { List, Map } from 'immutable';

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
    spotifySearch: Spotify.search,
    resetSpotifySearch: Spotify.resetSearch
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
      targets: Object.assign({}, sliderValues),
      searchResultsAnimation: []
    };
  },

  render() {
    if(!this.props.isSpotifyAuthenticated) {
      return null;
    }

    return <div className="app-container">
      <div className="section-main palm-ph-">
        <div className="layout">
          <div className="layout__item u-1/3 u-1/1-palm">
            <div>
              {this.renderSearch()}
            </div>
            {/* this.renderSliders() */}
          </div>
          <div className="layout__item u-2/3 u-1/1-palm">
            <h1>body</h1>
          </div>
        </div>
      </div>
    </div>
  },

  renderSearch() {
    return <div className="search u-pt palm-pt-">
      <Typeahead fetchData={this.searchSpotifyArtist}
                 results={this.props.spotifySearchResults}
                 renderResult={this.renderSpotifySearchResult} 
                 onSelect={this.handleArtistSelect} />
    </div>
  },

  renderSpotifySearchResult(result, i) {
    const images = result.get('images') || List();
    const thumb = images.last() || Map();
    return <div className={`slide-down-${i}`}>
      <div className="media media--small u-mv-- u-pl--">
        {this.renderSpotifySearchResultImg(thumb.get('url'))}
        <div className="media__body">
          <p className="u-mt0">
            {result.get('name')}
          </p>
        </div>
      </div>
    </div>
  },

  renderSpotifySearchResultImg(url) {
    const commonClasses = "media__img u-50px";
    const style = {
      background: 'rgba(255, 255, 255, 0.1)',
      height: '50px'
    };
    if(url) {
      return <img src={url} className={commonClasses} />
    } else {
      return <div className={commonClasses} style={style} />
    }
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
    if(val) {
      this.props.spotifySearch(val);  
    } else {
      this.props.resetSpotifySearch();
    }
  },

  handleArtistSelect(result) {
    console.log(result.toJSON());
  }

});

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);