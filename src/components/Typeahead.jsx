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
      input: '',
      fetchData: debounce(this.fetchData, 250)
    }
  },

  render() {
    return <div className={`typeahead typeahead--${this.props.theme || 'main'} ${this.props.results.size ? 'typeahead--has-results' : ''}`}>
      <input className="typeahead__input u-1/1"
             type="text"
             value={this.state.input}
             onChange={this.handleInput} />
      {this.props.results.size ? this.renderResults() : null}
    </div>
  },
  
  renderResults() {
    return <ul className="typeahead__results list-bare">
      {this.props.results.map((result, i) => this.renderResult(result, i))}
    </ul>
  },
  
  renderResult(result, i) {
    return <li key={result.get('id')} className="typeahead__result">
      {this.props.renderResult(result, i)}
    </li>
  },

  fetchData() {
    const { input } = this.state;
    this.props.fetchData(input);
  },

  handleInput(input) {
    const { value } = input.target;
    this.setState({ input: value });
    this.state.fetchData(value);
  }
});