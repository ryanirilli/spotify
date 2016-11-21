import React from 'react';
import Typeahead from './Typeahead.jsx!';
import {List, Map} from 'immutable';

export default React.createClass({

  componentWillMount() {
    this.props.getSpotifyAccessToken();
  },

  searchSpotifyArtist(val) {
    if (val) {
      this.props.spotifySearch(val);
    } else {
      this.props.resetSpotifySearch();
    }
  },

  render() {
    return <Typeahead device={this.props.device}
                      theme={this.props.theme}
                      placeholder={this.props.placeholder}
                      fetchData={this.searchSpotifyArtist}
                      results={this.props.spotifySearchResults}
                      renderResult={this.renderSpotifySearchResult}
                      onSelect={this.props.handleArtistSelect}
                      selectedValueLabel="name"
                      value={this.props.artist ? this.props.artist.get('name') : ''} />
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
      background: 'rgba(0, 0, 0, 0.05)',
      height: '50px'
    };
    if (url) {
      return <img src={url} className={commonClasses}/>
    } else {
      return <div className={commonClasses} style={style}/>
    }
  }
});