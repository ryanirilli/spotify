import React from 'react';
export default React.createClass({
    componentWillMount() {
      const { access_token, refresh_token } = this.props.location.query;
      window.opener.onSpotifyLoginSuccess(access_token, refresh_token);
      window.close();
    },
    render() { return <div /> }
});
