import React from 'react';
import { List } from 'immutable';
import { debounce } from './../utils/utils';
import keycodes from './../constants/keycodes';

export default React.createClass({

  getDefaultProps() {
    return {
      device: '',
      value: '',
      results: List(),
      fetchData: function() {},
      renderResult: function() {},
      onSelect: function() {}
    }
  },

  getInitialState() {
    const FETCH_DEBOUNCE_DURATION = this.props.device === 'palm' ? 700 : 250;
    return {
      isShowingResults: false,
      curActiveIndex: null,
      input: this.props.value || '',
      fetchData: debounce(this.fetchData, FETCH_DEBOUNCE_DURATION),
      isPalmFocused: false
    }
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({input: nextProps.value });
    }
  },

  onFocus() {
    const {device} = this.props;
    this.setState({
      input: '',
      isPalmFocused: device === 'palm',
      isShowingResults: Boolean(this.props.results.size)
    });

  },

  onBlur() {
    this.setState({input: this.props.value || ''})
  },

  onClosePalmSearch(e) {
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      isPalmFocused: false,
      isShowingResults: false
    });
    this.refs.typeaheadInput.blur();
  },

  renderPalmClose() {
    return <div className="typeahead-palm__close" onTouchEnd={this.onClosePalmSearch}>
      <i className="icon-close" />
    </div>
  },

  render() {
    const shouldShowResults = this.props.results.size && (this.state.isPalmFocused || this.state.isShowingResults);
    const {isPalmFocused} = this.state;
    return <div ref="typeahead"
                className={`typeahead typeahead--${this.props.theme || 'main'} ${shouldShowResults ? 'typeahead--has-results' : ''} ${isPalmFocused ? 'typeahead--palm-focused slide-up' : ''}`}
                onKeyDown={this.onKeydown}>
      {isPalmFocused && this.renderPalmClose()}
      <input ref="typeaheadInput"
             className="typeahead__input u-1/1"
             placeholder={this.props.placeholder}
             type="text"
             value={this.state.input}
             onChange={this.handleInput}
             onClick={this.showResults}
             onFocus={this.onFocus}
             onBlur={this.onBlur} />
      {shouldShowResults ? this.renderResults() : null}
    </div>
  },
  
  renderResults() {
    return [this.renderCloseMask(), this.renderResultsList()]
  },

  renderResultsList() {
    if (this.props.isLoadingResults) {
      return <div key="typeaheadIsLoading" className="typeahead__results">
        <div className="sp sp-wave"></div>
      </div>
    }

    return <ul key="typeaheadResults" className="typeahead__results list-bare">
      {this.props.results.map((result, i) => this.renderResult(result, i))}
    </ul>
  },
  
  renderResult(result, i) {
    const { curActiveIndex } = this.state;
    return <li key={result.get('id')}
               onMouseEnter={() => this.setCurrentActiveIndexOnHover(i)}
               onClick={this.setSelection}
               className={`typeahead__result ${curActiveIndex === i ? 'typeahead__result--active' : ''}`}>
      {this.props.renderResult(result, i)}
    </li>
  },

  renderCloseMask() {
    return <div key="typeaheadCloseMask" className="typeahead__close-mask" onClick={this.hideResults} />
  },

  showResults() {
    this.setState({ isShowingResults: true });
  },

  hideResults() {
    this.setState({ isShowingResults: false, curActiveIndex: null });
  },

  fetchData() {
    const { input } = this.state;
    this.showResults();
    this.props.fetchData(input);
  },

  handleInput(input) {
    const { value } = input.target;
    this.setState({ input: value });
    this.state.fetchData(value);
  },

  onKeydown(event) {
    const { keyCode } = event;
    switch(keyCode) {
      case keycodes.ESCAPE:
        this.hideResults();
        break;
      case keycodes.UP:
        this.setCurrentActiveIndex('up');
        break;
      case keycodes.DOWN:
        this.setCurrentActiveIndex('down');
        break;
      case keycodes.ENTER:
        this.setSelection();
        break;
    }
  },

  setSelection() {
    const { selectedValueLabel } = this.props;
    const result = this.props.results.get(this.state.curActiveIndex);
    if(result) {
      this.hideResults();
      if(selectedValueLabel) {
        this.setState({input: result.get(selectedValueLabel)});
      }
      this.props.onSelect(result);
      this.setState({isPalmFocused: false});
    }
  },

  setCurrentActiveIndex(direction) {
    const { results } = this.props;
    if(!results.size) {
      return;
    }
    this.showResults();
    let { curActiveIndex } = this.state;
    if (curActiveIndex === null || (curActiveIndex === 0 && direction === 'up')) {
      curActiveIndex = 0;
    } else if (curActiveIndex !== results.size - 1) {
      curActiveIndex = direction === 'up' ? curActiveIndex-1 : curActiveIndex+1;
    }
    this.setState({ curActiveIndex });
  },

  setCurrentActiveIndexOnHover(index) {
    this.setState({ curActiveIndex: index });
  }
});