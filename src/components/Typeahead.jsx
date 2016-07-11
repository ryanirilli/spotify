import React from 'react';
import { debounce } from './../utils/utils';
let test = 0;
export default React.createClass({

  getInitialState() {
    return {
      input: '',
      fetchData: debounce(this.fetchData, 500)
    }
  },

  render() {
    return <div className="typeahead">
      <input className="u-1/1"
             type="text"
             value={this.state.input}
             onChange={this.handleInput} />
      <div className="typeahead__results">
        <ul>
          {this.props.results.map(result => {
            return <li>{this.renderResult(result)}</li>
          })}
        </ul>
      </div>
    </div>
  },

  renderResult(result) {
    return <div key={result.get('id')}>
      {result.get('name')}
    </div>
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