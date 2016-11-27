import React from 'react';
import Tappable from 'react-tappable';
import raf from 'raf';
import ImgLoader from './ImgLoader.jsx!';
import {List, Map} from 'immutable';


export default React.createClass({

  getInitialState() {
    return {
      playerProgress: null,
      progressBarWidth: 0,
      isImgLoaded: false,
      isShowingTrackDetails: false,
      isPlayingPreview: false,
      isShowingPalmAddToPlaylistUi: false,
      isPalmSelectedTrack: false,
      isShowingPalmPreview: false,
      initialScrollPosition: 0
    }
  },

  componentWillReceiveProps(nextProps) {
    if(!this.props.isSpotifyUserAuthenticated && nextProps.isSpotifyUserAuthenticated) {
      this.setState({isShowingPalmAddToPlaylistUi: true});
    }
  },

  componentDidUpdate(prevProps, prevState) {
    if(this.state.isPalmSelectedTrack && !prevState.isPalmSelectedTrack) {
      this.playPreview();
    }
  },

  componentWillUnmount() {
    const {preview} = this.refs;
    if (preview) {
      preview.removeEventListener('ended', this.pausePreview);
    }
  },

  setInitialScrollPosition() {
    this.setState({initialScrollPosition: document.body.scrollTop});
  },

  render() {
    const {progressBarWidth, isShowingPalmPreview, isPalmSelectedTrack} = this.state;
    const {track, device} = this.props;
    const isPalm = device === 'palm';
    const artistName = track.getIn(['artists', 0, 'name']);
    const trackName = track.get('name');
    return <div>
      <div className={`spotify-track ${isPalm ? 'spotify-track--palm' : 'spotify-track--main'}`} draggable={isPalm}
           onMouseEnter={!isPalm && this.playPreview}
           onMouseLeave={!isPalm && this.pausePreview}
           onDragStart={!isPalm && this.onDragStart}
           onTouchStart={isPalm && this.setInitialScrollPosition}
           onTouchEnd={isPalm && this.togglePalmPreview}>
        <div className="spotify-track__details">
          <div>
            <h3 className="spotify-track__title text-truncate">
              {artistName}
            </h3>
            <div className="text-truncate">
              <a href={track.get('uri')}>
                {trackName}
              </a>
            </div>
          </div>
        </div>

        <ImgLoader src={track.getIn(['album', 'images', 1, 'url'])}/>

        {(!isPalm || isPalmSelectedTrack)  && <audio className="spotify-track__preview"
               ref="preview"
               src={track.get('preview_url')}/>}

        <div className="spotify-track__progress">
          <div className="spotify-track__progress-bar"
               style={{width: `${progressBarWidth}%`}}/>
        </div>

        {!isPalm && <div className="spotify-track__more"
             onClick={this.showTrackDetails}>
          <i className="icon-dots-three-horizontal"></i>
        </div>}
      </div>

      {isShowingPalmPreview && this.renderPalmPreview()}

    </div>
  },

  closePalmPreview() {
    this.pausePreview();
    this.setState({isShowingPalmPreview: false});
    this.props.setSpotifyIsShowingArtistDetails(false);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  },

  renderUserPlaylists() {
    const playlists = this.props.spotifyUserPlaylists.get('items') || List();
    const userId = this.props.spotifyUser.get('id');
    const ownedPlaylists = playlists.filter(playlist => playlist.getIn(['owner', 'id']) === userId);
    return <div>
      <h3 className="u-pl- u-mv0 bg-light-grey">Add Track To Playlist</h3>
      <ul className="bg-lightest-grey list-bare">
        {ownedPlaylists.map(playlist => this.renderPlaylist(playlist))}
      </ul>
    </div>
  },

  getHasAddedTrackToPlaylist(playlistId) {
    const {track} = this.props;
    const addedTracks = this.props.spotifyAddedTracks;
    const addedTrack = addedTracks.find(item => item.get('playlistId') === playlistId) || Map();
    const items = addedTrack.get('items') || List();
    return items.includes(track.get('uri'));
  },

  renderPlaylist(playlist) {
    const playlistId = playlist.get('id');
    const hasAddedTrack = this.getHasAddedTrackToPlaylist(playlistId);
    return <Tappable onTap={e => this.toggleTrackInPlaylist(playlistId)}
                     key={playlistId}
                     ref={playlistId}
                     component='li'
                     className={`u-ph- u-pv-- text-truncate u-bb-light ${hasAddedTrack ? 'list-item__success' : ''}`}>
        {hasAddedTrack && <i className="icon-check u-pr--" />}
        {playlist.get('name')}
    </Tappable>
  },

  toggleTrackInPlaylist(playlistId) {
    const {track} = this.props;
    const uri = track.get('uri');
    const hasAddedTrack = this.getHasAddedTrackToPlaylist(playlistId);
    if (hasAddedTrack) {
      this.props.removeSpotifyTrackFromPlaylist(uri, playlistId);
    } else {
      this.props.addSpotifyTrackToPlaylist(uri, playlistId);
    }
  },

  renderPalmPreview() {
    const {track} = this.props;
    const {progressBarWidth, isPlayingPreview} = this.state;

    const artistName = track.getIn(['artists', 0, 'name']);
    const trackImg = track.getIn(['album', 'images', 1, 'url']);
    const trackName = track.get('name');

    const palmPlayerStateIconClass = isPlayingPreview ? 'icon-pause' : 'icon-play';

    return <div className="modal-palm">
      <div className="modal-palm__content">
        <div className="modal-palm__close u-mb--">
          <i className="icon-close u-p--" onClick={this.closePalmPreview} />
        </div>
        <div className="spotify-track-preview-palm">
          <div className="spotify-track-preview-palm__player-icon">
            <div className="text-center">
              <i className={`${palmPlayerStateIconClass}`}
                 onTouchStart={this.togglePalmPreview} />
            </div>
          </div>
          <ImgLoader src={trackImg}/>
          <div className="spotify-track-preview-palm__body">
            <div className="progress-bar">
              <div className="progress-bar__progress"
                   style={{width: `${progressBarWidth}%`}}/>
            </div>

            <div className="text-center u-pv">
              <h3 className="u-mv0">{artistName}</h3>
              <div className="u--mt--">{trackName}</div>
            </div>

            {this.props.isSpotifyUserAuthenticated ? this.renderUserPlaylists() :
              <div className="u-ph u-pb-">
                <button className="btn btn--small btn--pill u-1/1" onClick={this.onClickAddToPlaylistPalm}>
                  <i className="icon-spotify"/> Add to playlist
                </button>
              </div>}
          </div>
        </div>
      </div>
    </div>
  },

  onClickAddToPlaylistPalm() {
    if(this.props.isSpotifyUserAuthenticated) {
      this.setState({isShowingPalmAddToPlaylistUi: true});
    } else {
      window.open('/api/v1/spotify-login');
    }
  },

  showTrackDetails() {
    const {track} = this.props;
    const artistId = track.getIn(['artists', 0, 'id']);
    this.pausePreview();
    this.props.onTrackClick(artistId);
    this.props.replace({
      ...this.props.location,
      query: {...this.props.location.query, detailsArtistId: artistId}
    });
  },

  setProgressBar() {
    const {preview} = this.refs;
    const {currentTime} = preview;
    const progressBarWidth = (currentTime / 30) * 100;
    const playerProgress = raf(() => this.setProgressBar());
    this.setState({playerProgress, progressBarWidth});
  },

  togglePalmPreview(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
    if (this.state.initialScrollPosition !== document.body.scrollTop) {
      return;
    }

    if(this.state.isPlayingPreview) {
      this.pausePreview();
    } else {
      this.playPreview();
    }
  },

  playPreview() {
    const newState = {isPlayingPreview: true};
    const isPalm = this.props.device === 'palm';
    if (!isPalm || this.state.isPalmSelectedTrack) {
      const {preview} = this.refs;
      preview.play();
      preview.addEventListener('ended', this.pausePreview);
      newState.playerProgress = raf(() => this.setProgressBar());
      if(isPalm) {
        newState.isShowingPalmPreview = true;
        this.props.setSpotifyIsShowingArtistDetails(true);
      }
    } else {
      newState.isPalmSelectedTrack = true;
    }
    this.setState(newState);
  },

  pausePreview() {
    const {preview} = this.refs;
    preview.pause();
    preview.removeEventListener('ended', this.pausePreview);
    const {playerProgress} = this.state;
    raf.cancel(playerProgress);
    this.setState({isPlayingPreview: false});
  },

  onDragStart(e) {
    this.pausePreview();
    const trackData = this.props.track.toJSON();
    e.dataTransfer.setData("track", JSON.stringify(trackData));
  }
});