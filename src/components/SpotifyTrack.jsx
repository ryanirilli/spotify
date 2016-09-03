import React from 'react';
import raf from 'raf';
import Modal from './Modal.jsx!';

export default React.createClass({

  getInitialState() {
    return {
      playerProgress: null,
      progressBarWidth: 0,
      isImgLoaded: false,
      isShowingTrackDetails: false
    }
  },

  componentDidMount() {
    const { track } = this.props;
    const { trackImg } = this.refs;
    const imgUrl = track.getIn(['album', 'images', 1, 'url']);
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      trackImg.src = imgUrl;
      trackImg.classList.add('spotify-track__img--loaded');
    };
  },

  render() {
    const { track } = this.props;
    const { progressBarWidth } = this.state;
    return <div>
        <div className="spotify-track" draggable="true"
                  onMouseEnter={this.playPreview}
                  onMouseLeave={this.pausePreview}
                  onDragStart={this.onDragStart}>
        <div className="spotify-track__details">
          {this.renderTrackArtistAndName()}
        </div>

        <img ref="trackImg"
             className="u-1/1 spotify-track__img"/>
        <audio className="spotify-track__preview"
               ref="preview"
               src={track.get('preview_url')} />

        <div className="spotify-track__progress">
          <div className="spotify-track__progress-bar"
               style={{width: `${progressBarWidth}%`}} />
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
    const { track } = this.props;
    const artistId = track.getIn(['artists', 0, 'id']);
    this.pausePreview();
    this.setState({ isShowingTrackDetails: true });
    this.props.fetchSpotifyArtist(artistId);
    this.props.fetchSpotifyArtistAlbums(artistId);
  },

  renderTrackArtistAndName() {
    const { track } = this.props;
    return <div>
        <div>
          {track.getIn(['artists', 0, 'name'])}
        </div>
        <div className="text-truncate">
          <a href={track.get('uri')}>
            {track.get('name')}
          </a>
        </div>
    </div>
  },

  renderTrackDetails() {
    const { track, spotifyArtistDetails } = this.props;
    const albums = this.props.spotifyArtistAlbums.get('items') || [];
    return <Modal onClose={}>
      <div className="layout">
        <div className="layout__item u-1/3">
          <img className="u-1/1" src={spotifyArtistDetails.getIn(['images', 0, 'url'])} />
          {this.renderTrackArtistAndName()}
        </div>
        <div className="layout__item u-2/3">
          <ul className="list-bare">
            {albums.map(album => this.renderAlbum(album))}
          </ul>
        </div>
      </div>
    </Modal>
  },

  renderAlbum(album) {
    return <li key={album.get('id')}>
      {album.get('name')}
    </li>
  },

  setProgressBar() {
    const { preview } = this.refs;
    const { currentTime } = preview;
    const progressBarWidth = (currentTime/30)*100;
    const playerProgress = raf(() => { this.setProgressBar() });
    this.setState({ playerProgress, progressBarWidth });
  },

  playPreview() {
    const {preview} = this.refs;
    preview.play(0);
    const playerProgress = raf(() => { this.setProgressBar() });
    this.setState({ playerProgress });
  },

  pausePreview() {
    const {preview} = this.refs;
    preview.pause();
    const { playerProgress } = this.state;
    raf.cancel(playerProgress);
  },

  onDragStart(e) {
    this.pausePreview();
    const trackData = this.props.track.toJSON();
    e.dataTransfer.setData("track", JSON.stringify(trackData));
  }
});