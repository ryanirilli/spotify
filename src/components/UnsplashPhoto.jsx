import React from 'react';

export default React.createClass({
  getInitialState() {
    return {
      width: window.innerWidth
    }
  },

  componentDidMount() {
    window.addEventListener('resize', this.setWidth);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.setWidth);
  },

  setWidth() {
    this.setState({width: window.innerWidth});
  },

  render() {
    return <img className="block" src={`https://unsplash.it/${this.state.width}/500?image=529`} />
  }
});