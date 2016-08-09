import React from 'react';
import { List } from 'immutable';
import { debounce } from './../utils/utils';

export default React.createClass({

  getDefaultProps() {
    return {
      results: List(),
      renderResult: function() {}
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

  onKeydown(event) {
    const { keyCode } = event;
    switch(keyCode) {
      case 27:
        //esc
        this.setState({ isShowingResults: false, curActiveIndex: null });
        break;
      case 38:
        //arrow up
        this.setCurrentActiveIndex('up');
        break;
      case 40:
        //arrow down
        this.setCurrentActiveIndex('down');
        break;
    }
  },

  setCurrentActiveIndex(direction) {
    const { results } = this.props;
    let { curActiveIndex } = this.state;

    if(!results.size) {
      return;
    }

    if (curActiveIndex === null || (curActiveIndex === 0 && direction === 'up')) {
      curActiveIndex = 0;
    } else if(curActiveIndex !== results.size - 1) {
      switch (direction) {
        case 'up':
          curActiveIndex--;
          break;
        case 'down':
          curActiveIndex++;
          break;
      }
    }
    this.setState({ curActiveIndex });
  },

  setCurrentActiveIndexOnHover(index) {
    this.setState({ curActiveIndex: index });
  },

  render() {
    const shouldShowResults = this.props.results.size && this.state.isShowingResults;
    return <div ref="typeahead" className={`typeahead typeahead--${this.props.theme || 'main'} ${shouldShowResults ? 'typeahead--has-results' : ''}`}
                onKeyDown={this.onKeydown}>
      <input className="typeahead__input u-1/1"
             type="text"
             value={this.state.input}
             onChange={this.handleInput} />
      {shouldShowResults ? this.renderResults() : null}
    </div>
  },
  
  renderResults() {
    return <ul className="typeahead__results list-bare">
      {this.props.results.map((result, i) => this.renderResult(result, i))}
    </ul>
  },
  
  renderResult(result, i) {
    const { curActiveIndex } = this.state;
    return <li key={result.get('id')}
               onMouseEnter={() => this.setCurrentActiveIndexOnHover(i)}
               className={`typeahead__result ${curActiveIndex === i ? 'typeahead__result--active' : ''}`}>
      {this.props.renderResult(result, i)}
    </li>
  },

  fetchData() {
    const { input } = this.state;
    this.setState({ isShowingResults: true, curActiveIndex: null });
    this.props.fetchData(input);
  },

  handleInput(input) {
    const { value } = input.target;
    this.setState({ input: value });
    this.state.fetchData(value);
  }
});