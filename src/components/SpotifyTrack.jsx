import React from 'react';
import raf from 'raf';

export default React.createClass({

  getInitialState() {
    return {
      playerProgress: null,
      progressBarWidth: 0,
      isImgLoaded: false
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
    return <div className="spotify-track"
                onMouseEnter={this.playPreview}
                onMouseLeave={this.pausePreview}>
      <div className="spotify-track__details">
        <div className="spotify-track__artist">
          {track.getIn(['artists', 0, 'name'])}
        </div>
        <div className="spotify-track__name text-truncate">
          <a href={track.get('uri')}>
            {track.get('name')}
          </a>
        </div>
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
    </div>
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
  }
});