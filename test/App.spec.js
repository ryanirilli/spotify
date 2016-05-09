import React from 'react';
import { renderIntoDocument, Simulate, scryRenderedDOMComponentsWithClass, findRenderedDOMComponentWithClass } from 'react-addons-test-utils';
import { App } from './../src/components/App.jsx!'

const noop = () => {};

function createComponent(props = {}) {
  return renderIntoDocument( <App
    updateSampleProperty={props.updateSampleProperty || noop}
  />);
}

context('App', () => {
  it('should have a unsullied logo img with an alt attribute', () => {
    const AppComponent = createComponent();
    const altTagValue = AppComponent.refs.unsulliedLogo.getAttribute('alt');
    expect(altTagValue).to.equal('unsullied logo');
  })
});