import React from 'react';

export default React.createClass({

  getInitialState() {
    return { img: null }
  },

  componentDidMount() {
    this.loadImg();
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.src !== nextProps.src) {
      this.loadImg(nextProps.src);
    }
  },

  loadImg(src = this.props.src) {
    const {_img} = this.refs;
    const img = new Image();
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