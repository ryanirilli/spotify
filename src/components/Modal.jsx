import React from 'react';
import keycodes from './../constants/keycodes';

export default React.createClass({

  getDefaultProps() {
    return {
      onClose: () => {}
    }
  },

  componentDidMount() {
    window.addEventListener('keydown', this.onKeydown);
    document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  },

  render() {
    return <div className="modal">
      <div className="modal__mask" onClick={this.props.onClose}></div>
      <div className="modal__content">
        {this.props.children}
        <div className="modal__bottom-spacer" onClick={this.props.onClose}></div>
      </div>
    </div>
  },

  onKeydown(e) {
    const { keyCode } = event;
    switch(keyCode) {
      case keycodes.ESCAPE:
        this.props.onClose();
        break;
    }
  }
});