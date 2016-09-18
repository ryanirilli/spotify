import React from 'react';
import raf from 'raf';
import Modal from './Modal.jsx!';
import ImgLoader from './ImgLoader.jsx!';
import Drawer from './Drawer.jsx!';

export default React.createClass({

  getInitialState() {
    return {
      playerProgress: null,
      progressBarWidth: 0,
      isImgLoaded: false,
      isShowingTrackDetails: false
    }
  },

  render() {
    const {track} = this.props;
    const {progressBarWidth} = this.state;
    return <div>
      <div className="spotify-track" draggable="true"
           onMouseEnter={this.playPreview}
           onMouseLeave={this.pausePreview}
           onDragStart={this.onDragStart}>
        <div className="spotify-track__details">
          {this.renderTrackArtistAndName()}
        </div>

        <ImgLoader src={track.getIn(['album', 'images', 1, 'url'])}/>

        <audio className="spotify-track__preview"
               ref="preview"
               src={track.get('preview_url')}/>

        <div className="spotify-track__progress">
          <div className="spotify-track__progress-bar"
               style={{width: `${progressBarWidth}%`}}/>
        </div>

        <div className="spotify-track__more"
             onClick={this.showTrackDetails}>
          <i className="icon-dots-three-horizontal"></i>
        </div>
      </div>
      {this.state.isShowingTrackDetails ? this.renderTrackDetails() : null}
    </div>
  },

  showTrackDetails() {
    const {track} = this.props;
    const artistId = track.getIn(['artists', 0, 'id']);
    this.pausePreview();
    this.setState({isShowingTrackDetails: true});
    this.props.fetchSpotifyArtist(artistId);
    this.props.fetchSpotifyArtistAlbums(artistId);
  },

  renderTrackArtistAndName() {
    const {track} = this.props;
    return <div className="u-pl-">
      <h3 className="u-m0">
        {track.getIn(['artists', 0, 'name'])}
      </h3>
      <div className="text-truncate">
        <a href={track.get('uri')}>
          {track.get('name')}
        </a>
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
          {this.renderTrackArtistAndName()}
        </div>
        <div className="master-detail__body u-p">
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
               className="text-truncate u-pt--">
      <span className="icon-folder-music u-mr--"></span> {album.get('name')}
      {isActiveAlbum && tracks.size && this.renderTracks(tracks)}
    </li>
  },

  renderTracks(tracks) {
    return <Drawer isOpen={true} shouldAnimateInitialOpen={true}>
      <ul>
        {tracks.map(track => <li key={track.get('id')}>
          {track.get('name')}
          <audio className="spotify-track__preview"
                 ref={`${track.get('id')}-preview`}
                 src={track.get('preview_url')}/>
        </li>)}
      </ul>
    </Drawer>
  },

  closeTrackDetails() {
    this.setState({ isShowingTrackDetails: false});
    this.props.resetSpotifyArtistDetails();
  },

  setProgressBar() {
    const {preview} = this.refs;
    const {currentTime} = preview;
    const progressBarWidth = (currentTime / 30) * 100;
    const playerProgress = raf(() => {
      this.setProgressBar()
    });
    this.setState({playerProgress, progressBarWidth});
  },

  playPreview() {
    const {preview} = this.refs;
    preview.play(0);
    const playerProgress = raf(() => {
      this.setProgressBar()
    });
    this.setState({playerProgress});
  },

  pausePreview() {
    const {preview} = this.refs;
    preview.pause();
    const {playerProgress} = this.state;
    raf.cancel(playerProgress);
  },

  onDragStart(e) {
    this.pausePreview();
    const trackData = this.props.track.toJSON();
    e.dataTransfer.setData("track", JSON.stringify(trackData));
  },

  loadAlbum(id) {
    this.props.fetchSpotifyAlbumDetails(id);
  }
});