import React from 'react';
import {replace, push} from 'react-router-redux';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {debounce} from './../utils/utils';

import {getLocalStorageItem} from './../api/httpUtils'

import Spotify from './../action-creators/spotify';
import SpotifyArtistDetails from './../action-creators/spotify-artist-details';

import Drawer from './Drawer.jsx!';
import RangeSlider from './RangeSlider.jsx!';
import SpotifyTrack from './SpotifyTrack.jsx!';
import TypeaheadSpotify from './TypeaheadSpotify.jsx!';
import Waypoint from './Waypoint.jsx!';
import Modal from './Modal.jsx!';
import ImgLoader from './ImgLoader.jsx!';

import {List, Map} from 'immutable';

function mapStateToProps(state) {
  return {
    device: state.app.get('device'),
    isSpotifyAuthenticated: state.spotify.get('isAuthenticated'),
    spotifyRecs: state.spotify.get('recs'),
    spotifyIsLoadingSearchResults: state.spotify.get('isLoadingSearchResults'),
    spotifySearchResults: state.spotify.get('searchResults'),
    spotifySelectedArtist: state.spotify.get('artist'),
    isFetchingSpotifyRecs: state.spotify.get('isFetchingRecs'),
    isSpotifyUserAuthenticated: state.spotify.get('isUserAuthenticated'),
    spotifyUserPlaylists: state.spotify.get('userPlaylists'),
    spotifyArtistDetails: state.spotifyArtistDetails.get('artist'),
    spotifyArtistAlbums: state.spotifyArtistDetails.get('albums'),
    spotifyAlbumDetails: state.spotifyAlbumDetails.get('album'),
    isSpotifyShowingArtistDetails: state.spotifyArtistDetails.get('isShowingArtistDetails'),
    spotifyAddedTracks: state.spotify.get('addedTracks'),
    spotifyUser: state.spotify.get('user')
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    push, replace,
    getSpotifyAccessToken: Spotify.getAccessToken,
    fetchSpotfyRecs: Spotify.fetchRecs,
    spotifySearch: Spotify.search,
    resetSpotifySearch: Spotify.resetSearch,
    fetchCurrentSpotifyArtist: Spotify.fetchArtist,
    setSpotifyArtist: Spotify.setArtist,
    resetSpotify: Spotify.reset,
    spotifyLogin: Spotify.login,
    addSpotifyTrackToPLaylist: Spotify.addTrackToPlaylist,
    fetchSpotifyArtist: SpotifyArtistDetails.fetchArtistDetails,
    fetchSpotifyArtistAlbums: SpotifyArtistDetails.fetchArtistAlbums,
    resetSpotifyArtistDetails: SpotifyArtistDetails.resetArtistDetails,
    fetchSpotifyAlbumDetails: SpotifyArtistDetails.fetchAlbumDetails,
    fetchUserAndPlaylists: Spotify.fetchUserAndPlaylists,
    setSpotifyIsShowingArtistDetails: SpotifyArtistDetails.setIsShowingArtistDetails,
    setIsUserAuthenticated: Spotify.setIsUserAuthenticated,
    setIsAuthenticated: Spotify.setIsAuthenticated
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

  getInitialState() {
    const sliderValues = {};
    sliders.forEach(slider => sliderValues[`${spotifyPropertyPrefix}_${slider}`] = 0);
    return {
      targets: Object.assign({}, sliderValues),
      debouncedFetchRecs: debounce(this.fetchRecs, 1000),
      isSpotifySlidersDrawerOpen: true,
      isSpotifyPlaylistsDrawerOpen: true,
      playlistDrawerReset: 0,
      isShowingTrackDetails: false
    };
  },

  componentWillMount() {
    const userAccessToken = getLocalStorageItem('userAccessToken');
    if(userAccessToken) {
      this.loadInitialState();
      return;
    };

    if(!this.props.isSpotifyAuthenticated) {
      this.props.getSpotifyAccessToken();
    } else {
      this.loadInitialState();
    }
  },

  componentWillReceiveProps(nextProps) {
    if(nextProps.isSpotifyAuthenticated && !this.props.isSpotifyAuthenticated) {
      this.loadInitialState(nextProps.location.query);
    }
  },

  loadInitialState(query = this.props.location.query) {
    const {artistId, detailsArtistId} = query;

    if (getLocalStorageItem('userAccessToken')) {
      this.props.fetchUserAndPlaylists();
    }

    if(artistId) {
      this.fetchRecs(artistId);
      this.props.fetchCurrentSpotifyArtist(artistId);
    }

    if(detailsArtistId) {
      this.openTrackDetails(detailsArtistId);
    }
  },

  openTrackDetails(artistId) {
    this.setState({isShowingTrackDetails: true});
    this.props.fetchSpotifyArtist(artistId);
    this.props.fetchSpotifyArtistAlbums(artistId);
  },

  closeTrackDetails() {
    const query = {...this.props.location.query};
    delete query.detailsArtistId;
    this.setState({ isShowingTrackDetails: false});
    this.props.resetSpotifyArtistDetails();
    this.props.replace({
      ...this.props.location,
      query
    });
  },

  render() {
    if(!this.props.spotifySelectedArtist.size || !this.props.isSpotifyAuthenticated) {
      return null;
    }

    const shouldRenderLoading = this.props.spotifyRecs.size && this.props.isFetchingSpotifyRecs;

    return <div className="app-container">

      {shouldRenderLoading ? this.renderLoading() : null}

      <div className="fixed-top bg-orange">
        <div className="section-main u-ph- u-pb-">
          {this.renderSearch()}
        </div>
      </div>

      <div className="u-pt+">
        {this.props.spotifyRecs.size ? this.renderSpotifyRecs() : this.renderInitialScreen()}
      </div>

      {this.state.isShowingTrackDetails ? this.renderTrackDetails() : null}

    </div>
  },

  renderInitialScreen() {
    return <div className="initial-screen u-pt+">
      <div className="initial-screen__content">
        <img className="pulse" src="/static/img/turntable.svg" />
      </div>
    </div>
  },

  renderSpotifyRecs() {
    const isPalm = this.props.device === 'palm';
    return <div className="section-main u-ph-">
      <div className="layout">

        {!isPalm && <div className="layout__item u-1/4 u-2/5-lap u-1/1-palm">
          {this.renderSidebar()}
        </div>}

        <div className="layout__item u-3/4 u-3/5-lap u-1/1-palm">
          {this.renderTracks()}
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
      <Drawer isOpen={this.state.isSpotifySlidersDrawerOpen} onToggleCallback={this.onPlaylistDrawerToggle}>
        {this.renderSliders()}
      </Drawer>

      <Waypoint offsetTop={60} reset={this.state.playlistDrawerReset} isDisabled={this.props.device !== 'desk'}>
        <div className="drawer-header" onClick={this.toggleSpotifyPlaylistsDrawer}>
          My playlists
        </div>
        <Drawer isOpen={this.state.isSpotifyPlaylistsDrawerOpen} onToggleCallback={this.onPlaylistDrawerToggle}>
          {this.props.isSpotifyUserAuthenticated ? this.renderUserPlaylists() : this.renderSpotifyLoginButton()}
        </Drawer>
      </Waypoint>
    </div>
  },

  renderSpotifyLoginButton() {
    return [
      <p key="0" className="u-ph--">
        Drag and drop tracks to your playlists
      </p>,
      <button key="1" className="btn btn--small btn--pill u-1/1" onClick={() => window.open("/api/v1/spotify-login") }>
        <i className="icon-spotify"/> Spotify connect
      </button>
    ]
  },

  renderUserPlaylists() {
    const playlists = this.props.spotifyUserPlaylists.get('items') || [];
    return <div>
      <ul className="list-bare list-hover-main list-short">
        {playlists.map(playlist => this.renderPlaylist(playlist))}
      </ul>
    </div>
  },

  renderPlaylist(playlist) {
    const playlistId = playlist.get('id');
    return <li key={playlistId}
               ref={playlistId}
               className={`u-ph- u-pv-- text-truncate droppable`}
               onDragOver={this.onDragOver}
               onDrop={e => this.handleTrackDrop(e, playlistId)}
               onDragEnter={e => this.onDragEnter(playlistId)}
               onDragLeave={e => this.onDragLeave(playlistId)}>
      {playlist.get('name')}
    </li>
  },

  renderTracks() {
    const isPalm = this.props.device === 'palm';
    return <div className={`spotify-tracks layout ${isPalm ? 'layout--small' : ''} u-mt u-mb++`}>
      {this.props.spotifyRecs.get('tracks').map(track => this.renderTrack(track))}
    </div>
  },

  renderTrack(track) {
    return <div key={track.get('id')} className="layout__item u-1/5 u-1/3-portable">
      <div className="u-mb">
        <SpotifyTrack {...this.props} track={track} onTrackClick={this.openTrackDetails}/>
      </div>
    </div>
  },

  renderTrackDetails() {
    const {spotifyArtistDetails, spotifyArtistAlbums} = this.props;
    const artistImg = spotifyArtistDetails.getIn(['images', 0, 'url']);
    const albums = spotifyArtistAlbums.get('items') || [];
    return <Modal onClose={this.closeTrackDetails}>
      <div className="master-detail">
        <div className="master-detail__sidebar">
          {artistImg ? <ImgLoader className="u-250px" src={artistImg}/> : null}
        </div>
        <div className="master-detail__body u-pv">
          <ul className="list-bare list-hover list-hover-light">
            {albums.map(album => this.renderAlbum(album))}
          </ul>
        </div>
      </div>
    </Modal>
  },

  renderAlbum(album) {
    const id = album.get('id');
    const {spotifyAlbumDetails} = this.props;
    const isActiveAlbum = spotifyAlbumDetails.get('id') === id;
    const tracks = spotifyAlbumDetails.getIn(['tracks', 'items']) || [];
    return <li onClick={e => this.loadAlbum(id)} key={id}
               className="text-truncate">
      <span className="icon-folder-music u-mh--"></span> {album.get('name')}
      {isActiveAlbum && tracks.size && this.renderAlbumTracks(tracks)}
    </li>
  },

  renderAlbumTracks(tracks) {
    return <Drawer isOpen={true} shouldAnimateInitialOpen={true}>
      <ul className="list-bare u-pv- u-pl bg-white">
        {tracks.map(track => <li key={track.get('id')}>
          {track.get('name')}
          <audio className="spotify-track__preview"
                 ref={`${track.get('id')}-preview`}
                 src={track.get('preview_url')}/>
        </li>)}
      </ul>
    </Drawer>
  },

  renderSearch() {
    return <div className="search u-pt-">
      <div className="layout layout--flush">
        <div className="layout__item u-1/4">
          <div className="text-center u-pr-- palm-pt--">
            <img onClick={e => this.props.push('/')} className="logo block u-1/1" src="/static/img/logo_spotworm_white.svg"></img>
          </div>
        </div>
        <div className="layout__item u-3/4">
          <TypeaheadSpotify getSpotifyAccessToken={this.props.getSpotifyAccessToken}
                            isLoadingResults={this.props.spotifyIsLoadingSearchResults}
                            device={this.props.device}
                            isSpotifyAuthenticated={this.props.isSpotifyAuthenticated}
                            spotifySearch={this.props.spotifySearch}
                            artist={this.props.spotifySelectedArtist}
                            resetSpotifySearch={this.props.resetSpotifySearch}
                            spotifySearchResults={this.props.spotifySearchResults}
                            handleArtistSelect={this.handleArtistSelect}/>
        </div>
      </div>
    </div>
  },

  renderSliders() {
    return <div className="sliders u-ph-- u-pv-">
      {sliders.map((slider, index) => this.renderSlider(`${spotifyPropertyPrefix}_${slider}`, index))}
    </div>
  },

  renderSlider(key, index) {
    let label = sliders[index];
    switch (label) {
      case 'acousticness':
        label = 'chillness';
        break;
      case 'danceability':
        label = 'grooveability';
        break;
    }
    return <div key={key}>
      <label>{label} {this.getSliderVal(key)}%</label>
      <RangeSlider min={0} max={100} step={1} value={this.state.targets[key]}
                   onChange={val => this.setSliderVal(key, val) } />
    </div>
  },

  onPlaylistDrawerToggle() {
    this.setState({playlistDrawerReset: this.state.playlistDrawerReset + 1});
  },

  toggleSpotifySlidersDrawer() {
    this.setState({isSpotifySlidersDrawerOpen: !this.state.isSpotifySlidersDrawerOpen});
  },

  toggleSpotifyPlaylistsDrawer() {
    this.setState({isSpotifyPlaylistsDrawerOpen: !this.state.isSpotifyPlaylistsDrawerOpen});
  },

  setSliderVal(key, val) {
    const targets = {...this.state.targets};
    targets[key] = val;
    this.setState({targets});
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
      if (val) {
        params[key] = zeroToOneSliders.indexOf(slider) > -1 ? val / 100 : val;
      }
    });

    this.props.fetchSpotfyRecs(params);
  },

  searchSpotifyArtist(val) {
    if (val) {
      this.props.spotifySearch(val);
    } else {
      this.props.resetSpotifySearch();
    }
  },

  handleArtistSelect(artist) {
    const artistId = artist.get('id');
    this.props.resetSpotify();
    this.setState(this.getInitialState());
    this.props.setSpotifyArtist(artist);
    const {location} = this.props;
    const query = {...location.query, artistId};
    this.props.push({...location, query});
    this.fetchRecs(artistId);
  },

  handleTrackDrop(e, playlistId) {
    e.preventDefault();
    const track = JSON.parse(e.dataTransfer.getData('track'));
    const {uri} = track;
    const node = this.refs[playlistId];
    this.props.addSpotifyTrackToPLaylist(uri, playlistId);
    node.classList.remove('droppable--hover');
  },

  onDragOver: function (e) {
    e.preventDefault();
    e.stopPropagation();
  },

  onDragEnter(playlistId) {
    const node = this.refs[playlistId];
    node.classList.add('droppable--hover');
  },

  onDragLeave(playlistId) {
    const node = this.refs[playlistId];
    node.classList.remove('droppable--hover');
  },

  loadAlbum(id) {
    this.props.fetchSpotifyAlbumDetails(id);
  }

});

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);