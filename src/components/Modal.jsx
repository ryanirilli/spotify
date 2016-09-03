import React from 'react';

export default React.createComponent({

  getDefaultProps() {
    return {
      onClose: () => {}
    }
  },

  render() {
    return <div className="modal">
      <div className="modal__mask" onClick={e => this.props.onClose}></div>
      <div className="modal__content">
        {this.props.children}
      </div>
    </div>
  }
});