import React from 'react';
import { renderIntoDocument, Simulate, scryRenderedDOMComponentsWithClass, findRenderedDOMComponentWithClass } from 'react-addons-test-utils';
import { App } from './../src/components/App.jsx!'

function createComponent(props) {
  return renderIntoDocument( <App />);
}

context('App', () => {
  it('should have a title', () => {
    const AppComponent = createComponent();
    const title = AppComponent.refs.siteTitle.textContent;
    expect(title).to.equal('Appocalypse');
  })
});