import React from 'react';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';

function maxmin(pos, min, max) {
  if (pos < min) { return min; }
  if (pos > max) { return max; }
  return pos;
}

export default React.createClass({

  propTypes() {
    return {
      min:        PropTypes.number,
      max:        PropTypes.number,
      step:       PropTypes.number,
      value:      PropTypes.number,
      onChange:   PropTypes.func,
      className:  PropTypes.string,
      isDisabled: PropTypes.boolean
    }
  },

  getDefaultProps() {
    return {
      min: 0,
      max: 100,
      step: 1,
      value: 0,
      isDisabled: false
    }
  },

  getInitialState() {
    return {
      limit: 0,
      grab: 0
    }
  },

  componentDidMount() {
    this.setupSlider();
    window.addEventListener('resize', this.setupSlider);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.setupSlider);
  },

  setupSlider() {
    const sliderPos = findDOMNode(this.refs.slider).offsetWidth;
    const handlePos = findDOMNode(this.refs.handle).offsetWidth;
    this.setState({
      limit: sliderPos - handlePos,
      grab: handlePos / 2
    });
  },

  handleSliderMouseDown(e) {
    const onChange = this.props.onChange;
    if (!onChange) return;
    const value = this.position(e);
    onChange(value);
  },

  handleKnobMouseDown() {
    document.addEventListener('mousemove', this.handleDragStart);
    document.addEventListener('touchmove', this.handleDragStart);
    document.addEventListener('mouseup', this.handleDragEnd);
    document.addEventListener('touchend', this.handleDragEnd);
  },

  handleDragStart(e) {
    const { onChange } = this.props;
    if (!onChange) return;
    const value = this.position(e);
    onChange(value);
  },

  handleDragEnd() {
    document.removeEventListener('mousemove', this.handleDragStart);
    document.removeEventListener('mouseup', this.handleDragEnd);
    document.removeEventListener('touchmove', this.handleDragStart);
    document.removeEventListener('touchend', this.handleDragEnd);
  },

  handleNoop(e) {
    e.stopPropagation();
    e.preventDefault();
  },

  getPositionFromValue(value) {
    const { limit } = this.state;
    const { min, max } = this.props;
    const divisor = max - min;
    const percentage = divisor !== 0 ? (value - min) / divisor : 0.5;
    return Math.round(percentage * limit);
  },

  getValueFromPosition(pos) {
    const { limit } = this.state;
    const { min, max, step } = this.props;
    const percentage = (maxmin(pos, 0, limit) / (limit || 1));
    return step * Math.round(percentage * (max - min) / step) + min;
  },

  position(e) {
    const node = findDOMNode(this.refs.slider);
    const coordinate = e.touches ? e.touches[0].clientX : e.clientX;
    const direction = node.getBoundingClientRect()['left'];
    const pos = coordinate - direction - this.state.grab;
    return this.getValueFromPosition(pos);
  },

  coordinates(pos) {
    const value = this.getValueFromPosition(pos);
    const handlePos = this.getPositionFromValue(value);
    const fillPos = handlePos + this.state.grab;
    return {
      fill: fillPos,
      handle: handlePos
    };
  },

  render() {

    const position = this.getPositionFromValue(this.props.value);
    const coords = this.coordinates(position);
    const fillStyle = {width: `${coords.fill}px`};
    const handleStyle = {left: `${coords.handle}px`};
    const isDisabled = this.props.max === 0 || this.props.disabled;

    return (
      <div
        ref="slider"
        className={classnames('rangeslider', {'rangeslider--disabled': isDisabled}, this.props.className)}>
        <div
          ref="fill"
          className="rangeslider__fill"
          style={fillStyle}></div>
        <div
          ref="handle"
          className="rangeslider__handle"
          onMouseDown={isDisabled ? this.handleNoop : this.handleKnobMouseDown}
          onTouchStart={isDisabled ? this.handleNoop : this.handleKnobMouseDown}
          style={handleStyle}></div>
      </div>
    );
  }
})