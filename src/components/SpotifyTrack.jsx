import React from 'react';
import Tappable from 'react-tappable';
import raf from 'raf';
import ImgLoader from './ImgLoader.jsx!';
import {List, Map} from 'immutable';


export default React.createClass({

  getInitialState() {
    return {
      track: this.props.track,
      nextTrack: this.getNextTrack(),
      playerProgress: null,
      progressBarWidth: 0,
      isImgLoaded: false,
      isShowingTrackDetails: false,
      isPlayingPreview: false,
      isShowingPalmAddToPlaylistUi: false,
      isPalmSelectedTrack: false,
      isShowingPalmPreview: false,
      initialScrollPosition: 0,
      palmModalSlide: null,
      palmModalLeft: 0,
      isSwiping: false,
      shouldTransitionOut: false,
      wasPlayingBeforeSwipe: false
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

    if (prevState.track.get('id') !== this.state.track.get('id')) {
      setTimeout(() => {
        this.setState({
          shouldTransitionOut: false,
          nextTrack: this.getNextTrack(this.state.track),
          palmModalSlide: null,
          palmModalLeft: 0,
          isSwiping: false
        });
        if (this.state.wasPlayingBeforeSwipe) {
          this.playPreview();
        }
      }, 100);
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
    return <Tappable component="div" moveThreshold={10} onTap={isPalm && this.togglePalmPreview}>
      <div className={`spotify-track ${isPalm ? 'spotify-track--palm' : 'spotify-track--main'}`} draggable={isPalm}
           onMouseEnter={!isPalm && this.playPreview}
           onMouseLeave={!isPalm && this.pausePreview}
           onDragStart={!isPalm && this.onDragStart}>
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
               src={isPalm ? this.state.track.get('preview_url') : track.get('preview_url')}/>}

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

    </Tappable>
  },

  closePalmPreview() {
    this.pausePreview();
    this.setState({
      isShowingPalmPreview: false,
      track: this.props.track
    });
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

  getNextTrack(track = this.props.track) {
    const {spotifyRecs} = this.props;
    const tracks = spotifyRecs.get('tracks');
    const trackIndex = tracks.indexOf(track);
    return tracks.get(trackIndex + 1);
  },

  onModalTouchStart(e) {
    this.setState({palmModalSlide: e.touches[0].clientX});
  },

  onModalTouchMove(e) {
    const palmModalLeft = this.state.palmModalSlide - e.touches[0].clientX;
    const isSwiping = palmModalLeft > 25;
    this.setState({
      palmModalLeft,
      isSwiping
    });
  },

  onModalTouchEnd() {
    const {nextTrack, palmModalLeft} = this.state;
    const exceedsThreshold = palmModalLeft > 100;
    const hasNextTrack = nextTrack !== undefined;
    if (exceedsThreshold && hasNextTrack) {
      let wasPlayingBeforeSwipe = this.state.isPlayingPreview;
      this.pausePreview();
      this.setState({
        progressBarWidth: 0,
        shouldTransitionOut: true,
        wasPlayingBeforeSwipe
      });
    }

    if (!exceedsThreshold) {
      this.setState({
        palmModalSlide: null,
        palmModalLeft: 0,
        isSwiping: false
      });
    }
  },

  onModalTransitionEnd() {
    const {nextTrack} = this.state;
    this.setState({
      track: nextTrack
    });
  },

  renderPalmPreview() {
    const {track, nextTrack, isSwiping, shouldTransitionOut} = this.state;
    const {progressBarWidth, isPlayingPreview} = this.state;

    const artistName = track.getIn(['artists', 0, 'name']);
    const trackImg = track.getIn(['album', 'images', 1, 'url']);
    const trackName = track.get('name');

    const nextArtistName = nextTrack.getIn(['artists', 0, 'name']);
    const nextTrackImg = nextTrack.getIn(['album', 'images', 1, 'url']);
    const nextTrackName = nextTrack.get('name');

    const palmPlayerStateIconClass = isPlayingPreview ? 'icon-pause' : 'icon-play';

    let style;
    let nextTrackStyle;

    if (shouldTransitionOut) {
      style = {
        transition: 'transform 500ms ease',
        transform: 'translateX(-120%)'
      };

      nextTrackStyle = {
        transition: 'all 500ms ease',
        transform: 'scale(1)',
        opacity: 1
      }
    } else {
      style = {
        transform: isSwiping ? `translateX(-${this.state.palmModalLeft}px)` : 'translateX(0px)',
        overflowY: isSwiping ? 'hidden' : 'scroll'
      }
    }

    return <Tappable component="div" stopPropagation={true} className="modal-palm">

      {isSwiping && <div className="modal-palm__content-2" style={nextTrackStyle}>
        <div className="modal-palm__close u-mb--">
          <i className="icon-close u-p--" onClick={this.closePalmPreview} />
        </div>

        <div className="spotify-track-preview-palm">
          <div className="spotify-track-preview-palm__album-img-container">
            <img src={nextTrackImg} className="spotify-track-preview-palm__album-img block" />
            <div className="spotify-track-preview-palm__player-icon">
              <div className="text-center">
                <i className={`${palmPlayerStateIconClass}`}
                   onTouchStart={this.togglePalmPreview} />
              </div>
            </div>
          </div>

          <div className="spotify-track-preview-palm__body">
            <div className="progress-bar">
              <div className="progress-bar__progress"
                   style={{width: `${progressBarWidth}%`}}/>
            </div>

            <div className="text-center u-pv">
              <h3 className="u-mv0">{nextArtistName}</h3>
              <div className="u--mt--">{nextTrackName}</div>
            </div>

            {this.props.isSpotifyUserAuthenticated ? this.renderUserPlaylists() :
              <div className="u-ph u-pb-">
                <button className="btn btn--small btn--pill u-1/1" onClick={this.onClickAddToPlaylistPalm}>
                  <i className="icon-spotify"/> Add to playlist
                </button>
              </div>}
          </div>
        </div>
      </div>}

      <div className="modal-palm__content"
           style={style}
           onTouchStart={this.onModalTouchStart}
           onTouchMove={this.onModalTouchMove}
           onTouchEnd={this.onModalTouchEnd}
           onTransitionEnd={shouldTransitionOut && this.onModalTransitionEnd}>

        <div className="modal-palm__close u-mb--">
          <i className="icon-close u-p--" onClick={this.closePalmPreview} />
        </div>

        <div className="spotify-track-preview-palm">
          <div className="spotify-track-preview-palm__album-img-container">
            <ImgLoader src={trackImg} className="spotify-track-preview-palm__album-img" />
            <div className="spotify-track-preview-palm__player-icon">
              <div className="text-center fade-in-delayed"
                   onTouchStart={this.togglePalmPreview}>
                <i className={`${palmPlayerStateIconClass}`} />
              </div>
            </div>
          </div>

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
    </Tappable>
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
    // document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
    // if (this.state.initialScrollPosition !== document.body.scrollTop) {
    //   return;
    // }

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