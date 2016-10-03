import React from 'react';

export default React.createClass({

  getInitialState() {
    return { img: null }
  },

  componentDidMount() {
    this.loadImg();
  },

  loadImg() {
    const {_img} = this.refs;
    const img = new Image();
    const { src } = this.props;
    img.src = src;
    img.onload = e => {
      _img.src = src;
      _img.classList.add('img-loader--loaded');
    };
    this.setState({ img });
  },

  componentWillUnmount() {
    this.state.img.onload = null;
  },

  render() {
    return <img ref="_img" className={`block img-loader ${this.props.className || 'u-1/1'}`}/>
  }
});