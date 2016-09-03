import React from 'react';



export default React.createClass({

  getDefaultProps() {
    return {
      offsetTop: 0
    }
  },

  getInitialState() {
    return {
      isFixed: false,
      waypoint: null,
      shimHeight: 0,
      offsetTop: 0,
      width: 0
    }
  },

  componentDidMount() {
    this.setWaypoint();
  },

  componentWillUnmount() {
    this.destroyWaypoint();
  },

  setWaypoint() {
    this.destroyWaypoint();
    const _waypoint = new window.Waypoint({
      element: this.refs.waypoint,
      offset: this.props.offsetTop,
      handler: function(direction) { this.handleWaypoint(direction) }.bind(this)
    });
    this.setState({ waypoint: _waypoint, width: this.refs.waypoint.offsetWidth });
  },

  destroyWaypoint() {
    const { waypoint } = this.state;
    if(waypoint) { waypoint.destroy(); }
  },

  componentDidUpdate(prevProps) {
    if(prevProps.reset !== this.props.reset) {
      this.setWaypoint();
    }
  },

  handleWaypoint(direction) {
    const { waypoint } = this.refs;

    if(!waypoint) {
      debugger;
    }

    const isFixed = direction === 'down';
    const shimHeight = isFixed ? waypoint.clientHeight : 0;
    const offsetTop = isFixed ? waypoint.offsetTop : 0;
    this.setState({ isFixed, shimHeight, offsetTop });
  },

  render() {
    const fixedClass = this.state.isFixed ? 'waypoint--fixed' : '';
    return <div>
      <div style={{height: `${this.state.shimHeight}px`}}></div>
      <div ref="waypoint" className={`waypoint ${fixedClass}`} style={{top: `${this.props.offsetTop}px`, width: this.state.width || '100%'}}>
        {this.props.children}
      </div>
    </div>
  }
})