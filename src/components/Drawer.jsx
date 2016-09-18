import React from 'react';
import {generateGuid} from './../utils/utils';

export default React.createClass({

  getInitialState() {
    return {
      id: `drawer__body-${generateGuid()}`,
      height: null,
      shouldAnimateInitialOpen: false,
    };
  },

  propTypes: {
    isOpen: React.PropTypes.bool.isRequired,
    afterOpenClass: React.PropTypes.string,
    onToggleCallback: React.PropTypes.func
  },

  componentDidMount() {
    this.refs.drawer.addEventListener('transitionend', this.onTransitionEnd);
    if (this.props.isOpen) {
      if(this.props.shouldAnimateInitialOpen) {
        this.setState({ shouldAnimateInitialOpen: true });
      } else {
        this.onTransitionEnd();
        this.updateClassList(true);
        this.setState({height: this.getHeight()});
      }
    }
  },

  componentWillUnmount() {
    this.refs.drawer.removeEventListener('transitionend', this.onTransitionEnd);
  },

  componentDidUpdate(prevProps, prevState) {
    const {isOpen} = this.props;
    const wasOpen = prevProps.isOpen;
    const shouldToggle = isOpen !== wasOpen;

    const prevShouldAnimateInitialOpen = prevState.shouldAnimateInitialOpen;
    const {shouldAnimateInitialOpen} = this.state;
    const shouldAnimateInitial = prevShouldAnimateInitialOpen !== shouldAnimateInitialOpen;

    if (shouldToggle || shouldAnimateInitial) {
      this.setState({height: this.getHeight()});
      setTimeout(() => this.updateClassList(isOpen));
    }
  },

  getHeight() {
    const {drawer} = this.refs;
    const _cssText = drawer.style.cssText;
    drawer.style.cssText = 'visibility: hidden; position: absolute; height: auto';
    const height = `${drawer.offsetHeight}px`;
    drawer.style.cssText = _cssText;
    return height;
  },

  openClass: 'drawer__body--open',
  afterOpenClass: 'drawer__body--after-open',
  updateClassList(isOpen) {
    const {drawer, drawerContent} = this.refs;
    if (isOpen) {
      drawer.classList.add(this.openClass);
    } else {
      drawer.classList.remove(this.afterOpenClass);
      drawerContent.classList.remove(this.props.afterOpenClass);
      // delay to allow css animation to execute properly
      setTimeout(() => drawer.classList.remove(this.openClass), 50);
    }
  },

  onTransitionEnd(e) {
    const {isOpen} = this.props;
    if (isOpen) {
      this.refs.drawer.classList.add(this.afterOpenClass);
      this.refs.drawerContent.classList.add(this.props.afterOpenClass);
    }
    if (e) {
      const { onToggleCallback } = this.props;
      onToggleCallback && onToggleCallback();
    }
  },

  renderStyle() {
    const {drawer} = this.refs;
    if (!drawer) {
      return;
    }
    const {id, height} = this.state;
    return <style>
      {`#${id}.${this.openClass} { height: ${height} }`}
    </style>
  },

  render() {
    const {id} = this.state;
    return <div className='drawer'>
      {this.renderStyle()}
      <div ref='drawer' className='drawer__body' id={id}>
        <div ref="drawerContent" className={`drawer__body-content ${this.props.className || ''}`}>
          {this.props.children}
        </div>
      </div>
    </div>
  }
});