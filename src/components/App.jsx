import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { debounce } from './../utils/utils';

import Spotify from './../action-creators/spotify';

import Drawer from './Drawer.jsx!';
import RangeSlider from './RangeSlider.jsx!';
import SpotifyTrack from './SpotifyTrack.jsx!';
import Typeahead from './Typeahead.jsx!';

import { List, Map } from 'immutable';

function mapStateToProps(state) {
  return {
    isSpotifyAuthenticated: state.spotify.get('isAuthenticated'),
    spotifyRecs: state.spotify.get('recs'),
    spotifySearchResults: state.spotify.get('searchResults'),
    spotifySelectedArtist: state.spotify.get('artist'),
    isFetchingSpotifyRecs: state.spotify.get('isFetchingRecs')
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getSpotifyAccessToken: Spotify.getAccessToken,
    fetchSpotfyRecs: Spotify.fetchRecs,
    spotifySearch: Spotify.search,
    resetSpotifySearch: Spotify.resetSearch,
    setSpotifyArtist: Spotify.setArtist,
    resetSpotify: Spotify.reset
  }, dispatch);
}

const sliders = [
  'popularity',
  'acousticness',
  'danceability'
];

const zeroToOneSliders = [
  'acousticness',
  'danceability'
];

const spotifyPropertyPrefix = 'target'; //min or target

export const App = React.createClass({

  componentWillMount() {
    this.props.getSpotifyAccessToken();
    this.fetchRecs('1GAS0rb4L8VTPvizAx2O9J');
  },

  getInitialState() {
    const sliderValues = {};
    sliders.forEach(slider => sliderValues[`${spotifyPropertyPrefix}_${slider}`] = 0);
    return {
      targets: Object.assign({}, sliderValues),
      debouncedFetchRecs: debounce(this.fetchRecs, 1000),
      isSpotifySlidersDrawerOpen: true
    };
  },

  render() {
    if(!this.props.isSpotifyAuthenticated) {
      return null;
    }

    return <div className="app-container">

      {this.props.isFetchingSpotifyRecs ? this.renderLoading() : null}

      <div className="fixed-top bg-black">
        <div className="section-main palm-ph-">
          {this.renderSearch()}
        </div>
      </div>

      <div className="section-main palm-ph- u-pt+">
        <div className="layout">
          <div className="layout__item u-1/4">
            {this.props.spotifyRecs.size ? this.renderSidebar() : null}
          </div>
          <div className="layout__item u-3/4">
            {this.props.spotifyRecs.size ? this.renderTracks() : null}
          </div>
        </div>
      </div>
    </div>
  },

  renderLoading() {
    return <div className="loader"></div>
  },

  renderSidebar() {
    return <div className="sidebar u-pt">
      <div className="drawer-header" onClick={this.toggleSpotifySlidersDrawer}>
        Advanced Settings
      </div>
      <Drawer isOpen={this.state.isSpotifySlidersDrawerOpen}>
        {this.renderSliders()}
      </Drawer>
      <div className="drawer-header" onClick={this.toggleSpotifySlidersDrawer}>
        My playlists
      </div>
    </div>
  },

  renderTracks() {
    return <div className="spotify-tracks layout u-mt">
      {this.props.spotifyRecs.get('tracks').map(track => this.renderTrack(track))}
    </div>
  },

  renderTrack(track) {
    return <div key={track.get('id')} className="layout__item u-1/5 u-1/1-palm">
      <div className="u-mb">
        <SpotifyTrack track={track} />  
      </div>
    </div>
  },

  renderSearch() {
    return <div className="search u-pt palm-pt-">
      <Typeahead placeholder="Artist search"
                 fetchData={this.searchSpotifyArtist}
                 results={this.props.spotifySearchResults}
                 renderResult={this.renderSpotifySearchResult} 
                 onSelect={this.handleArtistSelect}
                 selectedValueLabel="name"/>
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
    return <div className="sliders u-ph-- u-pv-">
      {sliders.map((slider, index) => this.renderSlider(`${spotifyPropertyPrefix}_${slider}`, index))}
    </div>
  },

  renderSlider(key, index) {
    let label = sliders[index];
    switch(label) {
      case 'acousticness':
        label = 'chillness';
        break;
      case 'danceability':
        label = 'groveability';
        break;
    }
    return <div key={key}>
      <label>{label} {this.getSliderVal(key)}%</label>
      <RangeSlider min={0} max={100} step={1} value={this.state.targets[key]} onChange={val => this.setSliderVal(key, val) } />
    </div>
  },

  toggleSpotifySlidersDrawer() {
    this.setState({isSpotifySlidersDrawerOpen: !this.state.isSpotifySlidersDrawerOpen});
  },

  setSliderVal(key, val) {
    const targets = Object.assign({}, this.state.targets);
    targets[key] = val;
    this.setState({ targets });
    this.state.debouncedFetchRecs(this.props.spotifySelectedArtist.get('id'));
  },

  getSliderVal(key) {
    return this.state.targets[key];
  },

  fetchRecs(artistId) {
    const params = {
      seed_artists: artistId
    };

    sliders.forEach(slider => {
      const key = `${spotifyPropertyPrefix}_${slider}`;
      const val = this.state.targets[key];
      if(val) {
        params[key] = zeroToOneSliders.indexOf(slider) > -1 ? val/100 : val;
      }
    });
    
    this.props.fetchSpotfyRecs(params);
  },

  searchSpotifyArtist(val) {
    if(val) {
      this.props.spotifySearch(val);  
    } else {
      this.props.resetSpotifySearch();
    }
  },

  handleArtistSelect(artist) {
    this.props.resetSpotify();
    this.setState(this.getInitialState());
    this.props.setSpotifyArtist(artist);
    this.fetchRecs(artist.get('id'));
  }

});

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);