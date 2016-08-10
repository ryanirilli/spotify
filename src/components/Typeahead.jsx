import React from 'react';
import { List } from 'immutable';
import { debounce } from './../utils/utils';

export default React.createClass({

  getDefaultProps() {
    return {
      results: List(),
      fetchData: function() {},
      renderResult: function() {},
      onSelect: function() {}
    }
  },

  getInitialState() {
    return {
      isShowingResults: true,
      curActiveIndex: null,
      input: '',
      fetchData: debounce(this.fetchData, 250)
    }
  },

  render() {
    const shouldShowResults = this.props.results.size && this.state.isShowingResults;
    return <div ref="typeahead"
                className={`typeahead typeahead--${this.props.theme || 'main'} ${shouldShowResults ? 'typeahead--has-results' : ''}`}
                onKeyDown={this.onKeydown}>
      <input className="typeahead__input u-1/1"
             placeholder={this.props.placeholder}
             type="text"
             value={this.state.input}
             onChange={this.handleInput}
             onClick={this.showResults} />
      {shouldShowResults ? this.renderResults() : null}
    </div>
  },
  
  renderResults() {
    return [this.renderCloseMask(), <ul key="typeaheadResults" className="typeahead__results list-bare">
      {this.props.results.map((result, i) => this.renderResult(result, i))}
    </ul>]
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
      case 27: //esc
        this.hideResults();
        break;
      case 38: //arrow up
        this.setCurrentActiveIndex('up');
        break;
      case 40: //arrow down
        this.setCurrentActiveIndex('down');
        break;
      case 13: //Enter
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